import React, { useState, useEffect, useCallback } from 'react';
import { SmartInvoiceMatcher, SmartMatch } from '../utils/smartMatching';
import { BankTransaction } from '../types';
import { Invoice } from '../types';
import { PaymentRecord } from '../types';

interface SmartMatchingPanelProps {
  transactions: BankTransaction[];
  invoices: Invoice[];
  payments: PaymentRecord[];
  onMatchUpdate: (matches: SmartMatch[]) => void;
}

export const SmartMatchingPanel: React.FC<SmartMatchingPanelProps> = ({
  transactions,
  invoices,
  payments,
  onMatchUpdate
}) => {
  const [matches, setMatches] = useState<SmartMatch[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.6);
  const [autoApplyThreshold, setAutoApplyThreshold] = useState(0.9);

  const processMatches = useCallback(() => {
    setIsProcessing(true);
    
    // Combine bank transactions and payment records
    const allTransactions: BankTransaction[] = [
      ...transactions.map(t => ({ ...t, type: 'credit' as const })),
      ...payments.map(p => ({
        id: p.id,
        reference: p.paymentNumber,
        date: p.date,
        description: `Payment - ${p.clientName}`, 
        amount: p.amount,
        type: 'credit' as const,
        status: 'pending' as const
      }))
    ];
    
    const smartMatches = SmartInvoiceMatcher.matchTransactions(allTransactions, invoices);
    
    // Filter by confidence threshold
    const filteredMatches = smartMatches.filter(m => m.confidence >= confidenceThreshold);
    setMatches(filteredMatches);
    onMatchUpdate(filteredMatches);
    
    setIsProcessing(false);
  }, [transactions, invoices, payments, confidenceThreshold, onMatchUpdate]);

  useEffect(() => {
    processMatches();
  }, [processMatches]);

  const getMatchColor = (match: SmartMatch) => {
    switch (match.pattern) {
      case 'exact': return 'bg-green-50 border-green-200 text-green-800';
      case 'partial': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'fuzzy': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'manual': return 'bg-purple-50 border-purple-200 text-purple-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600';
    if (confidence >= 0.7) return 'text-yellow-600';
    if (confidence >= 0.5) return 'text-blue-600';
    return 'text-red-600';
  };

  const handleManualMatch = (transactionId: string, invoiceId: string, correct: boolean) => {
    const updatedMatches = matches.map(match => {
      if (match.transactionId === transactionId) {
        if (correct) {
          SmartInvoiceMatcher.learnFromCorrection(match, true);
          return { ...match, invoiceId, confidence: match.confidence + 0.1, notes: 'Manual confirmation' };
        } else {
          SmartInvoiceMatcher.learnFromCorrection(match, false);
          return { ...match, invoiceId: undefined, confidence: 0.1, notes: 'Manual rejection' };
        }
      }
      return match;
    });
    
    setMatches(updatedMatches);
    onMatchUpdate(updatedMatches);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Smart Invoice Matching</h3>
        <button
          onClick={processMatches}
          disabled={isProcessing}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {isProcessing ? 'Processing...' : 'Re-process Matches'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confidence Threshold</label>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.1"
            value={confidenceThreshold}
            onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
            className="w-full"
          />
          <span className="text-xs text-gray-500">≥{confidenceThreshold}</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Auto-apply Threshold</label>
          <input
            type="range"
            min="0.5"
            max="1.0"
            step="0.1"
            value={autoApplyThreshold}
            onChange={(e) => setAutoApplyThreshold(parseFloat(e.target.value))}
            className="w-full"
          />
          <span className="text-xs text-gray-500">≥{autoApplyThreshold}</span>
        </div>
        <div className="flex items-end">
          <div className="text-sm text-gray-600">
            Total: {matches.length} matches
            <br />
            Auto: {matches.filter(m => m.autoMatch).length}
            <br />
            Manual: {matches.filter(m => !m.autoMatch).length}
          </div>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {matches.map((match) => (
          <div
            key={match.transactionId}
            className={`p-3 rounded-lg border ${getMatchColor(match)} transition-all`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-medium">
                  {match.transactionId.startsWith('pay') ? 'PAY' : 'BANK'}
                </span>
                <span className="text-sm">
                  {match.transactionId.startsWith('pay') 
                    ? payments.find(p => p.id === match.transactionId)?.paymentNumber
                    : transactions.find(t => t.id === match.transactionId)?.reference}
                </span>
              </div>
              <div className={`text-sm font-medium ${getConfidenceColor(match.confidence)}`}> {match.confidence.toFixed(2)} confidence
              </div>
              <span className="text-xs px-2 py-1 rounded-full border">
                {match.pattern}
              </span>
            </div>

            <div className="mb-2">
              {match.invoiceId ? (
                <span className="text-sm">
                  → Matched to Invoice #{invoices.find(i => i.id === match.invoiceId)?.invoiceNumber}
                </span>
              ) : (
                <span className="text-sm text-gray-500">
                  → No invoice matched
                </span>
              )}
            </div>

            {match.suggestions.length > 0 && (
              <div className="mb-2">
                <div className="text-xs font-medium mb-1">Alternative Matches:</div>
                <div className="space-y-1">
                  {match.suggestions.map((suggestion, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <span>Invoice #{suggestion.invoiceId}</span>
                      <span>Amount: {suggestion.amount} | Confidence: {suggestion.confidence}</span>
                      <button
                        onClick={() => handleManualMatch(match.transactionId, suggestion.invoiceId, true)}
                        className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                      >
                        Accept
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {match.invoiceId && !match.autoMatch && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleManualMatch(match.transactionId, match.invoiceId!, true)}
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                >
                  ✓ Confirm
                </button>
                <button
                  onClick={() => handleManualMatch(match.transactionId, '', false)}
                  className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                >
                  ✗ Reject
                </button>
                <button
                  onClick={() => handleManualMatch(match.transactionId, '', false)}
                  className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                >
                  Ignore
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {matches.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No matches found for the current criteria.
        </div>
      )}
    </div>
  );
};
