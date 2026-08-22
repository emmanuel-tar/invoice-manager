import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  CheckSquare, 
  Calendar, 
  FileText, 
  ArrowRight, 
  Info, 
  Layers 
} from 'lucide-react';
import { Estimate, Invoice } from '../types';

interface ConvertToInvoiceModalProps {
  estimate: Estimate | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmConvert: (options: {
    estimate: Estimate;
    invoiceNumber: string;
    date: string;
    dueDate: string;
    carryOverItems: boolean;
    includeRefNote: boolean;
  }) => void;
}

export const ConvertToInvoiceModal: React.FC<ConvertToInvoiceModalProps> = ({
  estimate,
  isOpen,
  onClose,
  onConfirmConvert,
}) => {
  if (!isOpen || !estimate) return null;

  const today = new Date().toISOString().split('T')[0];
  const defaultDue = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [invoiceNumber, setInvoiceNumber] = useState<string>(`INV-${Math.floor(1000 + Math.random() * 9000)}`);
  const [dateType, setDateType] = useState<'today' | 'estimate'>('today');
  const [issueDate, setIssueDate] = useState<string>(today);
  const [dueDate, setDueDate] = useState<string>(defaultDue);
  const [carryOverItems, setCarryOverItems] = useState<boolean>(true);
  const [includeRefNote, setIncludeRefNote] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleConvert = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onConfirmConvert({
        estimate,
        invoiceNumber,
        date: dateType === 'today' ? issueDate : estimate.date,
        dueDate,
        carryOverItems,
        includeRefNote,
      });
      setIsProcessing(false);
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200/80 overflow-hidden relative">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600 text-white">
              <Sparkles className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Convert Estimate to Invoice</h3>
              <p className="text-xs text-slate-500 font-mono">
                Source: <span className="font-bold text-blue-600">{estimate.estimateNumber}</span> • {estimate.clientName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options Body */}
        <div className="py-4 space-y-4 text-xs">
          {/* Invoice Number & Date Option */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">New Invoice Number</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Date Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Invoice Issue Date</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDateType('today')}
                className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                  dateType === 'today'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-semibold ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <div>Today ({today})</div>
                  <div className="text-[10px] text-slate-400 font-normal">Fresh billing date</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDateType('estimate')}
                className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                  dateType === 'estimate'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-semibold ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <div>Original Date ({estimate.date})</div>
                  <div className="text-[10px] text-slate-400 font-normal">Match quote timestamp</div>
                </div>
              </button>
            </div>
          </div>

          {/* Conversion Checkboxes */}
          <div className="space-y-2.5 pt-1">
            <label className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/70 transition-colors">
              <input
                type="checkbox"
                checked={carryOverItems}
                onChange={(e) => setCarryOverItems(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="font-semibold text-slate-900">Carry over all line items and pricing</span>
                <p className="text-[11px] text-slate-500">
                  Transfers all {estimate.items.length} services, quantities, and discount rates directly.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/70 transition-colors">
              <input
                type="checkbox"
                checked={includeRefNote}
                onChange={(e) => setIncludeRefNote(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="font-semibold text-slate-900">
                  Add reference note: "Based on Estimate {estimate.estimateNumber}"
                </span>
                <p className="text-[11px] text-slate-500">
                  Links the quote record in both customer notes and invoice metadata.
                </p>
              </div>
            </label>
          </div>

          {/* Amount Overview Card */}
          <div className="p-3.5 rounded-lg bg-slate-900 text-white flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-blue-400 uppercase font-semibold">Total to Invoice</div>
              <div className="text-xl font-black font-mono-data mt-0.5">${estimate.total.toFixed(2)}</div>
            </div>
            <div className="text-right text-[11px] text-slate-300">
              <div>Subtotal: ${estimate.subtotal.toFixed(2)}</div>
              <div>Taxes: ${estimate.taxAmount.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>

          <button
            id="btn-confirm-convert-estimate"
            type="button"
            onClick={handleConvert}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <span>Converting...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-blue-200" />
                <span>Generate Invoice</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
