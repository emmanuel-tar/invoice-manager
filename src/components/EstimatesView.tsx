import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  FileSpreadsheet, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Send, 
  Eye, 
  Trash2, 
  Zap, 
  Sparkles,
  ArrowUpRight,
  X,
  Calculator,
  User,
  DollarSign
} from 'lucide-react';
import { Estimate, EstimateStatus, Client, CompanyProfile, LineItem } from '../types';
import { formatCurrencyAmount } from '../data/currencies';

interface EstimatesViewProps {
  estimates: Estimate[];
  clients: Client[];
  companyProfile: CompanyProfile;
  onOpenCreateEstimate: () => void;
  onAddQuickEstimate: (estimate: Omit<Estimate, 'id' | 'estimateNumber'>) => void;
  onOpenConvertModal: (estimate: Estimate) => void;
  onDeleteEstimate: (estimateId: string) => void;
  onViewEstimate: (estimate: Estimate) => void;
  onSendEstimate: (estimate: Estimate) => void;
}

export const EstimatesView: React.FC<EstimatesViewProps> = ({
  estimates,
  clients,
  companyProfile,
  onOpenCreateEstimate,
  onAddQuickEstimate,
  onOpenConvertModal,
  onDeleteEstimate,
  onViewEstimate,
  onSendEstimate,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isQuickEstimateModalOpen, setIsQuickEstimateModalOpen] = useState(false);

  // Quick estimate state
  const [quickClientId, setQuickClientId] = useState('');
  const [quickProjectTitle, setQuickProjectTitle] = useState('');
  const [quickAmount, setQuickAmount] = useState<number>(0);
  const [quickTaxRate, setQuickTaxRate] = useState<number>(7.5);
  const [quickValidityDays, setQuickValidityDays] = useState<number>(14);
  const [quickNotes, setQuickNotes] = useState('');

  const filteredEstimates = estimates.filter((est) => {
    const matchesStatus = filterStatus === 'all' || est.status === filterStatus;
    const matchesSearch =
      est.estimateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      est.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      est.clientEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalQuotesValue = estimates.reduce((sum, e) => sum + e.total, 0);
  const pendingCount = estimates.filter((e) => e.status === 'sent').length;
  const acceptedCount = estimates.filter((e) => e.status === 'accepted').length;
  const acceptanceRate = estimates.length > 0 ? Math.round((acceptedCount / estimates.length) * 100) : 0;

  const handleQuickEstimateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickClientId || quickAmount <= 0) return;
    const client = clients.find((c) => c.id === quickClientId);
    if (!client) return;

    const today = new Date();
    const expiry = new Date(today.getTime() + quickValidityDays * 24 * 60 * 60 * 1000);
    const taxAmt = quickAmount * (quickTaxRate / 100);
    const total = quickAmount + taxAmt;

    const items: LineItem[] = [
      {
        id: '1',
        description: quickProjectTitle || 'Professional Services Estimate',
        qty: 1,
        unitPrice: quickAmount,
        taxRate: quickTaxRate,
        total: total,
      }
    ];

    onAddQuickEstimate({
      clientName: client.name,
      clientEmail: client.email,
      clientAddress: client.address,
      date: today.toISOString().split('T')[0],
      expiryDate: expiry.toISOString().split('T')[0],
      items,
      subtotal: quickAmount,
      taxAmount: taxAmt,
      discount: 0,
      total,
      status: 'sent',
      notes: quickNotes || 'Standard Quick Quote. Valid for 14 calendar days.',
    });

    setIsQuickEstimateModalOpen(false);
    setQuickClientId('');
    setQuickProjectTitle('');
    setQuickAmount(0);
    setQuickNotes('');
  };

  return (
    <div id="estimates-view-container" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            <span>Estimates & Quotes</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create project quotes, generate 60-second quick estimates, track client approval, and convert to invoices in 1 click.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsQuickEstimateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Quick Estimate</span>
          </button>

          <button
            id="btn-create-estimate-main"
            onClick={onOpenCreateEstimate}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Estimate</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Quoted</div>
          <div className="text-xl font-black text-slate-900 font-mono mt-1">
            {formatCurrencyAmount(totalQuotesValue, companyProfile.currencySymbol)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{estimates.length} proposals created</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Awaiting Approval</div>
          <div className="text-xl font-black text-blue-700 font-mono mt-1">
            {pendingCount} Quotes
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Ready for client sign-off</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Accepted & Won</div>
          <div className="text-xl font-black text-emerald-700 font-mono mt-1">
            {acceptedCount} Quotes
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Ready for invoice billing</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Win Rate</div>
          <div className="text-xl font-black text-slate-900 font-mono mt-1">
            {acceptanceRate}%
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
            <TrendingUp className="w-3 h-3" /> Conversion tracking
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tab Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'Estimate List (All)' },
            { id: 'sent', label: 'Sent / Pending' },
            { id: 'accepted', label: 'Accepted' },
            { id: 'rejected', label: 'Declined' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search estimate or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Estimates Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Estimate #</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Date Issued</th>
                <th className="py-3.5 px-4">Expires</th>
                <th className="py-3.5 px-4 text-right">Total Quoted</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Convert / Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredEstimates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No estimates found</p>
                  </td>
                </tr>
              ) : (
                filteredEstimates.map((est) => (
                  <tr key={est.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-blue-600 group-hover:text-blue-700">
                        {est.estimateNumber}
                      </div>
                      {est.convertedToInvoiceId && (
                        <div className="text-[10px] text-blue-700 font-mono font-semibold">
                          Converted → {est.convertedToInvoiceId}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{est.clientName}</div>
                      <div className="text-[11px] text-slate-400">{est.clientEmail}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                      {est.date}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 text-[11px]">
                      {est.expiryDate}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                      {formatCurrencyAmount(est.total, companyProfile.currencySymbol)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          est.status === 'accepted'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : est.status === 'sent'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : est.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {est.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2 relative">
                        {/* Convert to Invoice Button */}
                        {!est.convertedToInvoiceId ? (
                          <button
                            id={`btn-convert-${est.id}`}
                            onClick={() => onOpenConvertModal(est)}
                            className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Convert</span>
                          </button>
                        ) : (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-semibold font-mono">
                            Invoiced
                          </span>
                        )}

                        <button
                          onClick={() => onViewEstimate(est)}
                          title="View / Print Quote"
                          className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onSendEstimate(est)}
                          title="Email Quote"
                          className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                        >
                          <Send className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onDeleteEstimate(est.id)}
                          title="Delete"
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Estimate Modal */}
      {isQuickEstimateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500 fill-current" />
                <h3 className="font-bold text-slate-900 text-base">Generate Quick Estimate (60s Quote)</h3>
              </div>
              <button
                onClick={() => setIsQuickEstimateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickEstimateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Client *</label>
                <select
                  required
                  value={quickClientId}
                  onChange={(e) => setQuickClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  <option value="">-- Select Client --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Scope / Deliverable Summary *</label>
                <input
                  type="text"
                  required
                  value={quickProjectTitle}
                  onChange={(e) => setQuickProjectTitle(e.target.value)}
                  placeholder="e.g. Enterprise Cloud Migration & Security Audit"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Base Quotation ({companyProfile.currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={quickAmount || ''}
                    onChange={(e) => setQuickAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quote Validity (Days)</label>
                  <select
                    value={quickValidityDays}
                    onChange={(e) => setQuickValidityDays(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  >
                    <option value={7}>7 Days</option>
                    <option value={14}>14 Days (Standard)</option>
                    <option value={30}>30 Days</option>
                    <option value={60}>60 Days</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs space-y-1">
                <div className="flex justify-between text-amber-900">
                  <span>Subtotal Quote:</span>
                  <span className="font-mono font-bold">{formatCurrencyAmount(quickAmount, companyProfile.currencySymbol)}</span>
                </div>
                <div className="flex justify-between text-amber-900">
                  <span>Estimated Tax (7.5%):</span>
                  <span className="font-mono">{formatCurrencyAmount(quickAmount * 0.075, companyProfile.currencySymbol)}</span>
                </div>
                <div className="flex justify-between text-amber-950 font-black text-sm pt-1 border-t border-amber-200">
                  <span>Estimated Grand Total:</span>
                  <span className="font-mono text-amber-700">{formatCurrencyAmount(quickAmount * 1.075, companyProfile.currencySymbol)}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Terms / Notes</label>
                <textarea
                  rows={2}
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  placeholder="Payment milestone terms, delivery SLA..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickEstimateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-lg font-semibold shadow-sm flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Issue Quick Estimate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
