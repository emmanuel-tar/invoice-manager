import React, { useState } from 'react';
import {
  CheckCircle2,
  FileText,
  Truck,
  FileMinus,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  BadgeCheck,
  XCircle,
} from 'lucide-react';
import { ApprovableDoc, WorkflowUser } from '../types';
import { ROLE_LABELS, userDisplayName } from '../utils/rbac';

interface ApprovalsViewProps {
  queue: ApprovableDoc[];
  currentUser: WorkflowUser;
  canApprove: boolean;
  onDecide: (type: 'invoice' | 'purchase_order' | 'credit_note', id: string, approve: boolean, notes?: string) => void;
  onNavigate: (tab: any) => void;
}

export const ApprovalsView: React.FC<ApprovalsViewProps> = ({
  queue,
  currentUser,
  canApprove,
  onDecide,
  onNavigate,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'invoice' | 'purchase_order' | 'credit_note'>('all');
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = queue.filter((d) => filterType === 'all' || d.type === filterType);

  const typeMeta: Record<string, { label: string; icon: any; accent: string }> = {
    invoice: { label: 'Invoice', icon: FileText, accent: 'text-blue-600 bg-blue-50 border-blue-100' },
    purchase_order: { label: 'Purchase Order', icon: Truck, accent: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
    credit_note: { label: 'Credit Note', icon: FileMinus, accent: 'text-amber-600 bg-amber-50 border-amber-100' },
  };

  const tabs = [
    { id: 'all' as const, label: 'All Requests', count: queue.length },
    { id: 'invoice' as const, label: 'Invoices', count: queue.filter((d) => d.type === 'invoice').length },
    { id: 'purchase_order' as const, label: 'Purchase Orders', count: queue.filter((d) => d.type === 'purchase_order').length },
    { id: 'credit_note' as const, label: 'Credit Notes', count: queue.filter((d) => d.type === 'credit_note').length },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            Approval Workflow
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Review documents submitted for approval before they are released.
          </p>
        </div>
      </div>

      {/* Role context banner */}
      <div className="dashboard-card p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 text-white text-xs font-bold flex items-center justify-center">
          {userDisplayName(currentUser)}
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-slate-800">{currentUser?.name}</div>
          <div className="text-xs text-slate-500">
            {currentUser?.role && ROLE_LABELS[currentUser.role]}
            {canApprove ? ' — you can approve or reject pending documents' : ' — approvals require an Owner or Admin role'}
          </div>
        </div>
        <div className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${canApprove ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
          {canApprove ? 'Approver' : 'Read-only'}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setFilterType(t.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === t.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {t.label} <span className="opacity-70">({t.count})</span>
          </button>
        ))}
      </div>
{/* Empty state */}
      {filtered.length === 0 ? (
        <div className="dashboard-card p-10 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <BadgeCheck className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mt-4">All caught up</h3>
          <p className="text-sm text-slate-500 mt-1">
            No documents are awaiting approval right now.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((doc) => {
            const meta = typeMeta[doc.type];
            const Icon = meta.icon;
            const isOpen = openId === doc.id;
            return (
              <div key={`${doc.type}-${doc.id}`} className="dashboard-card p-5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${meta.accent}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        {doc.number}
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-700">
                          Pending
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
                        {meta.label} • {doc.clientName}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-black text-slate-900 font-mono-data">
                        ₦{doc.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">Amount</div>
                    </div>
                    {canApprove ? (
                      <button
                        onClick={() => setOpenId(isOpen ? null : doc.id)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1"
                      >
                        {isOpen ? 'Close' : 'Review'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-semibold">
                        Awaiting approver
                      </span>
                    )}
                  </div>
                </div>

                {isOpen && canApprove && (
                  <div className="mt-4 pt-3 space-y-3">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-start gap-2 text-xs text-slate-600">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                      <span>
                        Requested by <span className="font-semibold">{doc.approval?.requestedBy || 'Unknown'}</span>.
                        {doc.approval?.requestedAt && (
                          <span className="font-mono"> submitted {new Date(doc.approval.requestedAt).toLocaleString()}</span>
                        )}
                      </span>
                    </div>
                    <textarea
                      value={reviewNotes[doc.id] || ''}
                      onChange={(e) => setReviewNotes({ ...reviewNotes, [doc.id]: e.target.value })}
                      placeholder="Add review notes (optional)"
                      rows={2}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => onDecide(doc.type, doc.id, true, reviewNotes[doc.id])}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve & Release
                      </button>
                      <button
                        onClick={() => onDecide(doc.type, doc.id, false, reviewNotes[doc.id])}
                        className="flex-1 py-2.5 bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                      >
                        <AlertCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};