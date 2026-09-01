import React, { useState } from 'react';
import {
  Banknote,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  Download,
  Upload,
  Building2,
  CreditCard,
  Wallet,
  ChevronDown,
  ChevronRight,
  Eye,
  Link2,
  Unlink,
  FileText,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { BankTransaction, Invoice } from '../types';

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  balance: number;
  currency: string;
  lastSynced: string;
  isConnected: boolean;
}

interface ReconciliationSummary {
  totalTransactions: number;
  matched: number;
  unmatched: number;
  totalCredits: number;
  totalDebits: number;
  difference: number;
}

interface BankReconciliationViewProps {
  invoices: Invoice[];
  onMatchTransaction: (transactionId: string, invoiceId: string) => void;
  onUnmatchTransaction: (transactionId: string) => void;
}

const mockAccounts: BankAccount[] = [
  {
    id: 'acc_1',
    bankName: 'First Bank of Nigeria',
    accountNumber: '****4521',
    accountName: 'FCMB Business Account',
    balance: 2450000,
    currency: 'NGN',
    lastSynced: '2026-08-31T10:30:00Z',
    isConnected: true,
  },
  {
    id: 'acc_2',
    bankName: 'GTBank',
    accountNumber: '****7890',
    accountName: 'FCMB Operations',
    balance: 1250000,
    currency: 'NGN',
    lastSynced: '2026-08-31T09:15:00Z',
    isConnected: true,
  },
  {
    id: 'acc_3',
    bankName: 'Access Bank',
    accountNumber: '****3456',
    accountName: 'FCMB Savings',
    balance: 500000,
    currency: 'NGN',
    lastSynced: '2026-08-30T16:45:00Z',
    isConnected: false,
  },
];

const mockTransactions: BankTransaction[] = [
  {
    id: 'txn_1',
    accountId: 'acc_1',
    reference: 'TRF/2026/0831/001',
    date: '2026-08-31',
    description: 'Payment from ABC Corp - Invoice INV-001',
    amount: 150000,
    type: 'credit',
    status: 'matched',
    invoiceId: 'inv_1',
    matched: true,
    matchedInvoiceId: 'inv_1',
  },
  {
    id: 'txn_2',
    accountId: 'acc_1',
    reference: 'TRF/2026/0831/002',
    date: '2026-08-31',
    description: 'Transfer from XYZ Ltd',
    amount: 75000,
    type: 'credit',
    status: 'unmatched',
    matched: false,
  },
  {
    id: 'txn_3',
    accountId: 'acc_1',
    reference: 'TRF/2026/0830/015',
    date: '2026-08-30',
    description: 'Office supplies payment',
    amount: 25000,
    type: 'debit',
    status: 'matched',
    matched: true,
  },
  {
    id: 'txn_4',
    accountId: 'acc_2',
    reference: 'TRF/2026/0831/003',
    date: '2026-08-31',
    description: 'Payment from DEF Enterprises',
    amount: 320000,
    type: 'credit',
    status: 'unmatched',
    matched: false,
  },
  {
    id: 'txn_5',
    accountId: 'acc_2',
    reference: 'TRF/2026/0829/008',
    date: '2026-08-29',
    description: 'Utility bill payment',
    amount: 45000,
    type: 'debit',
    status: 'matched',
    matched: true,
  },
  {
    id: 'txn_6',
    accountId: 'acc_1',
    reference: 'TRF/2026/0829/005',
    date: '2026-08-29',
    description: 'Payment from GHI Trading',
    amount: 180000,
    type: 'credit',
    status: 'matched',
    invoiceId: 'inv_3',
    matched: true,
    matchedInvoiceId: 'inv_3',
  },
];

export const BankReconciliationView: React.FC<BankReconciliationViewProps> = ({
  invoices,
  onMatchTransaction,
  onUnmatchTransaction,
}) => {
  const [selectedAccount, setSelectedAccount] = useState<string>('acc_1');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'matched' | 'unmatched'>('all');
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState<string | null>(null);
  const [selectedInvoiceForMatch, setSelectedInvoiceForMatch] = useState<string>('');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');

  const currentAccount = mockAccounts.find((a) => a.id === selectedAccount);

  const filteredTransactions = mockTransactions.filter((txn) => {
    if (txn.accountId !== selectedAccount) return false;
    if (filterStatus === 'matched' && !txn.matched) return false;
    if (filterStatus === 'unmatched' && txn.matched) return false;
    if (filterType === 'credit' && txn.type !== 'credit') return false;
    if (filterType === 'debit' && txn.type !== 'debit') return false;
    if (searchTerm && !txn.description.toLowerCase().includes(searchTerm.toLowerCase()) && !txn.reference.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const summary: ReconciliationSummary = {
    totalTransactions: filteredTransactions.length,
    matched: filteredTransactions.filter((t) => t.matched).length,
    unmatched: filteredTransactions.filter((t) => !t.matched).length,
    totalCredits: filteredTransactions.filter((t) => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0),
    totalDebits: filteredTransactions.filter((t) => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0),
    difference: filteredTransactions.reduce((sum, t) => sum + (t.type === 'credit' ? t.amount : -t.amount), 0),
  };

  const unmatchedInvoices = invoices.filter(
    (inv) => inv.status === 'pending' || inv.status === 'overdue'
  );

  const handleMatch = (transactionId: string) => {
    if (selectedInvoiceForMatch) {
      onMatchTransaction(transactionId, selectedInvoiceForMatch);
      setShowMatchModal(null);
      setSelectedInvoiceForMatch('');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Bank Reconciliation</h1>
          <p className="text-sm text-slate-400 mt-1">
            Sync bank transactions and match them with invoices
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-700">
            <Upload className="w-4 h-4" />
            Import Statement
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <RefreshCw className="w-4 h-4" />
            Sync Now
          </button>
        </div>
      </div>

      {/* Bank Account Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockAccounts.map((account) => (
          <button
            key={account.id}
            onClick={() => setSelectedAccount(account.id)}
            className={`p-4 rounded-xl border transition-all text-left ${
              selectedAccount === account.id
                ? 'bg-blue-600/10 border-blue-500/50 ring-1 ring-blue-500/30'
                : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${account.isConnected ? 'bg-emerald-500/20' : 'bg-slate-700'}`}>
                  <Building2 className={`w-5 h-5 ${account.isConnected ? 'text-emerald-400' : 'text-slate-400'}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{account.bankName}</p>
                  <p className="text-xs text-slate-400">{account.accountNumber}</p>
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${account.isConnected ? 'bg-emerald-400' : 'bg-slate-500'}`} />
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700/50">
              <p className="text-xs text-slate-400">Available Balance</p>
              <p className="text-lg font-bold text-white">{formatCurrency(account.balance)}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-blue-500/20">
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-xs text-slate-400">Total Transactions</span>
          </div>
          <p className="text-2xl font-bold text-white">{summary.totalTransactions}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-xs text-slate-400">Matched</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{summary.matched}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20">
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-xs text-slate-400">Unmatched</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">{summary.unmatched}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-purple-500/20">
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-xs text-slate-400">Net Difference</span>
          </div>
          <p className={`text-2xl font-bold ${summary.difference >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {summary.difference >= 0 ? '+' : ''}{formatCurrency(summary.difference)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="matched">Matched</option>
          <option value="unmatched">Unmatched</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Types</option>
          <option value="credit">Credits</option>
          <option value="debit">Debits</option>
        </select>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value as any)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
          <h3 className="text-sm font-medium text-white">Transactions</h3>
          <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors">
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
        <div className="divide-y divide-slate-700/50">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <Banknote className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No transactions found</p>
              <p className="text-xs text-slate-500 mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            filteredTransactions.map((txn) => (
              <div
                key={txn.id}
                className="px-4 py-3 flex items-center justify-between hover:bg-slate-700/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${txn.type === 'credit' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                    {txn.type === 'credit' ? (
                      <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{txn.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">{txn.reference}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-400">{formatDate(txn.date)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`text-sm font-bold ${txn.type === 'credit' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                    </p>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                      txn.matched
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {txn.matched ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          Matched
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3" />
                          Unmatched
                        </>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {txn.matched ? (
                      <button
                        onClick={() => onUnmatchTransaction(txn.id)}
                        className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
                        title="Unmatch"
                      >
                        <Unlink className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowMatchModal(txn.id)}
                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Match to Invoice"
                      >
                        <Link2 className="w-4 h-4" />
                      </button>
                    )}
                    <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Match Modal */}
      {showMatchModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-2">Match Transaction</h3>
            <p className="text-sm text-slate-400 mb-4">
              Select an invoice to match this transaction to.
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {unmatchedInvoices.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No pending invoices available</p>
              ) : (
                unmatchedInvoices.map((inv) => (
                  <button
                    key={inv.id}
                    onClick={() => setSelectedInvoiceForMatch(inv.id)}
                    className={`w-full p-3 rounded-lg border text-left transition-colors ${
                      selectedInvoiceForMatch === inv.id
                        ? 'bg-blue-600/20 border-blue-500/50'
                        : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{inv.invoiceNumber}</p>
                        <p className="text-xs text-slate-400">{inv.clientName}</p>
                      </div>
                      <p className="text-sm font-bold text-white">{formatCurrency(inv.total)}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowMatchModal(null);
                  setSelectedInvoiceForMatch('');
                }}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleMatch(showMatchModal)}
                disabled={!selectedInvoiceForMatch}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Confirm Match
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
