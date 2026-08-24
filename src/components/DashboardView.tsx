import React, { useState } from 'react';
import { 
  Coins, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Plus, 
  ArrowUpRight, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Package, 
  FileSpreadsheet, 
  ArrowRight,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Invoice, Estimate, InventoryItem, Activity, NavigationTab } from '../types';
import { RevenueGrowthChart } from './RevenueGrowthChart';

interface DashboardViewProps {
  invoices: Invoice[];
  estimates: Estimate[];
  items: InventoryItem[];
  activities: Activity[];
  onNavigate: (tab: NavigationTab) => void;
  onOpenCreateInvoice: () => void;
  onOpenCreateEstimate: () => void;
  onOpenAddItem: () => void;
  onViewInvoice: (inv: Invoice) => void;
  onPayInvoice: (inv: Invoice) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  invoices,
  estimates,
  items,
  activities,
  onNavigate,
  onOpenCreateInvoice,
  onOpenCreateEstimate,
  onOpenAddItem,
  onViewInvoice,
  onPayInvoice,
}) => {
  // Calculations
  const totalInvoicesCount = invoices.length;
  const paidInvoices = invoices.filter((i) => i.status === 'paid');
  const pendingInvoices = invoices.filter((i) => i.status === 'pending');
  const overdueInvoices = invoices.filter((i) => i.status === 'overdue');

  const totalOutstanding = invoices
    .filter((i) => i.status === 'pending' || i.status === 'overdue')
    .reduce((sum, i) => sum + i.total, 0);

  const revenueThisMonth = paidInvoices.reduce((sum, i) => sum + i.total, 0);
  const lowStockCount = items.filter((i) => i.status === 'low' || i.status === 'out').length;

  return (
    <div id="dashboard-container" className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Financial Dashboard
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time ledger overview, outstanding collections, and quote conversion rates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-quick-create-invoice-dash"
            onClick={onOpenCreateInvoice}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </button>
          <button
            id="btn-quick-send-estimate-dash"
            onClick={onOpenCreateEstimate}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-emerald-50 text-slate-700 border border-emerald-200 rounded-lg text-xs font-semibold shadow-xs transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-500" />
            <span>New Estimate</span>
          </button>
        </div>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Invoices */}
        <div 
          id="kpi-total-invoices"
          onClick={() => onNavigate('invoices')}
          className="dashboard-card p-5 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              Total Invoices
            </span>
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-sm group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-mono-data">
              {totalInvoicesCount}
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +8%
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>{paidInvoices.length} Paid • {pendingInvoices.length} Pending</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Outstanding Balance */}
        <div 
          id="kpi-outstanding"
          onClick={() => onNavigate('invoices')}
          className="dashboard-card p-5 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              Outstanding
            </span>
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-mono-data">
              ₦{totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-xs text-amber-700 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>{overdueInvoices.length} Overdue ({pendingInvoices.length} Pending)</span>
          </div>
        </div>

        {/* Revenue This Month */}
        <div 
          id="kpi-revenue-month"
          onClick={() => onNavigate('reports')}
          className="dashboard-card p-5 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              Revenue (This Month)
            </span>
            <div className="p-2 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 text-white shadow-sm group-hover:scale-105 transition-transform">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 font-mono-data">
              ₦{revenueThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> +12%
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Target: ₦20,000 (76% achieved)
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div 
          id="kpi-low-stock"
          onClick={() => onNavigate('items')}
          className="dashboard-card p-5 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              Low Stock Alerts
            </span>
            <div className="p-2 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-sm group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-600 font-mono-data">
              {lowStockCount} Items
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Requires replenishment</span>
            <ArrowRight className="w-3.5 h-3.5 text-rose-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts-based Revenue Growth (2 cols) */}
        <div className="lg:col-span-2">
          <RevenueGrowthChart
            invoices={invoices}
            onNavigateToReports={() => onNavigate('reports')}
            onNavigateToInvoices={() => onNavigate('invoices')}
          />
        </div>

        {/* Invoice Status Distribution (Donut representation) */}
        <div className="dashboard-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Invoice Status Breakdown</h3>
            <p className="text-xs text-slate-500">Distribution of active collection pipeline</p>

            {/* Visual Donut representation */}
            <div className="py-6 flex items-center justify-center">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background Circle */}
                  <path
                    className="stroke-slate-100"
                    strokeWidth="4"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Paid Segment (Emerald) */}
                  <path
                    className="stroke-emerald-500"
                    strokeDasharray="60, 100"
                    strokeWidth="4"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Pending Segment (Amber) */}
                  <path
                    className="stroke-amber-500"
                    strokeDasharray="25, 100"
                    strokeDashoffset="-60"
                    strokeWidth="4"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Overdue Segment (Rose) */}
                  <path
                    className="stroke-rose-500"
                    strokeDasharray="15, 100"
                    strokeDashoffset="-85"
                    strokeWidth="4"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-slate-900 font-mono-data">
                    {totalInvoicesCount}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                    Total
                  </span>
                </div>
              </div>
            </div>

            {/* Legend Stats */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Paid ({paidInvoices.length})</span>
                </span>
                <span className="font-mono font-bold text-slate-900">
                  ₦{paidInvoices.reduce((a, b) => a + b.total, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>Pending ({pendingInvoices.length})</span>
                </span>
                <span className="font-mono font-bold text-slate-900">
                  ₦{pendingInvoices.reduce((a, b) => a + b.total, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Overdue ({overdueInvoices.length})</span>
                </span>
                <span className="font-mono font-bold text-slate-900">
                  ₦{overdueInvoices.reduce((a, b) => a + b.total, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('invoices')}
            className="w-full mt-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors text-center border border-slate-200"
          >
            Manage All Invoices
          </button>
        </div>
      </div>

      {/* Bottom Grid: Recent Invoices & Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices Table (2 cols) */}
        <div className="lg:col-span-2 dashboard-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Recent Invoices</h3>
              <p className="text-xs text-slate-500">Latest generated bills and payment records</p>
            </div>
            <button
              onClick={() => onNavigate('invoices')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                  <th className="pb-3 font-semibold">Invoice</th>
                  <th className="pb-3 font-semibold">Client</th>
                  <th className="pb-3 font-semibold">Due Date</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                  <th className="pb-3 font-semibold text-center">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.slice(0, 5).map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-3 font-mono font-bold text-blue-600">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 font-medium text-slate-900">
                      {inv.clientName}
                    </td>
                    <td className="py-3 text-slate-500 font-mono text-[11px]">
                      {inv.dueDate}
                    </td>
                    <td className="py-3 text-right font-mono font-bold text-slate-900">
                      ₦{inv.total.toFixed(2)}
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          inv.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : inv.status === 'pending'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : inv.status === 'overdue'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewInvoice(inv)}
                          title="View Invoice"
                          className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                        {inv.status !== 'paid' && (
                          <button
                            onClick={() => onPayInvoice(inv)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[10px] font-semibold shadow-xs"
                          >
                            Pay
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed (1 col) */}
        <div className="dashboard-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base">Recent Activity</h3>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Live Log</span>
            </div>

            <div className="space-y-4">
              {activities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs group">
                  <div className="mt-0.5 shrink-0">
                    {act.type === 'payment' && (
                      <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {act.type === 'overdue' && (
                      <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
                        <AlertCircle className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {act.type === 'warning' && (
                      <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {(act.type === 'estimate_sent' || act.type === 'converted') && (
                      <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600 border border-teal-100">
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                      </div>
                    )}
                    {act.type === 'invoice_created' && (
                      <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-800 leading-snug">
                      <span className="font-semibold">{act.title}</span>{' '}
                      {act.highlightText && (
                        <span className="font-semibold text-blue-600">{act.highlightText} </span>
                      )}
                      {act.description}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                      {act.timeAgo}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigate('estimates')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-500" />
              <span>Review Estimates Pipeline</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
