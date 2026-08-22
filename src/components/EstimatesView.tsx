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
  MoreVertical, 
  Send, 
  Eye, 
  Trash2, 
  Layers, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { Estimate, EstimateStatus, Client } from '../types';

interface EstimatesViewProps {
  estimates: Estimate[];
  clients: Client[];
  onOpenCreateEstimate: () => void;
  onOpenConvertModal: (estimate: Estimate) => void;
  onDeleteEstimate: (estimateId: string) => void;
  onViewEstimate: (estimate: Estimate) => void;
  onSendEstimate: (estimate: Estimate) => void;
}

export const EstimatesView: React.FC<EstimatesViewProps> = ({
  estimates,
  clients,
  onOpenCreateEstimate,
  onOpenConvertModal,
  onDeleteEstimate,
  onViewEstimate,
  onSendEstimate,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

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

  return (
    <div id="estimates-view-container" className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Estimates & Quotes</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Create project quotes, track client acceptance, and convert to invoices in 1 click.
          </p>
        </div>

        <button
          id="btn-create-estimate-main"
          onClick={onOpenCreateEstimate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Estimate</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 font-mono uppercase">Total Quoted</div>
          <div className="text-xl font-black text-slate-900 font-mono-data mt-1">
            ${totalQuotesValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{estimates.length} proposals created</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-blue-600 font-mono uppercase">Awaiting Approval</div>
          <div className="text-xl font-black text-blue-700 font-mono-data mt-1">
            {pendingCount} Quotes
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Ready for client sign-off</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-600 font-mono uppercase">Accepted & Won</div>
          <div className="text-xl font-black text-emerald-700 font-mono-data mt-1">
            {acceptedCount} Quotes
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Ready for invoice billing</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-600 font-mono uppercase">Win Rate</div>
          <div className="text-xl font-black text-slate-900 font-mono-data mt-1">
            {acceptanceRate}%
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
            <TrendingUp className="w-3 h-3" /> Industry benchmark ~65%
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tab Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Estimates' },
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
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Estimates Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-mono uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 font-bold">Estimate #</th>
                <th className="py-3.5 px-4 font-bold">Client</th>
                <th className="py-3.5 px-4 font-bold">Date Issued</th>
                <th className="py-3.5 px-4 font-bold">Expires</th>
                <th className="py-3.5 px-4 font-bold text-right">Total Quoted</th>
                <th className="py-3.5 px-4 font-bold text-center">Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Convert / Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
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

                    <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                      {est.date}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                      {est.expiryDate}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      ${est.total.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
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
                            <span>Convert to Invoice</span>
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
    </div>
  );
};
