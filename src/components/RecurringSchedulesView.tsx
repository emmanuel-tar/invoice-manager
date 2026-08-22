import React, { useState } from 'react';
import { 
  Repeat, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  DollarSign, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles,
  Zap,
  TrendingUp,
  FileText,
  Building,
  RefreshCw
} from 'lucide-react';
import { RecurringSchedule, Client } from '../types';
import { 
  calculateMRR, 
  getFrequencyLabel, 
  isScheduleDue, 
  formatDate,
  BILLING_PATTERN_PRESETS
} from '../utils/recurringUtils';

interface RecurringSchedulesViewProps {
  schedules: RecurringSchedule[];
  clients: Client[];
  onOpenCreateSchedule: (initialData?: Partial<RecurringSchedule>) => void;
  onEditSchedule: (schedule: RecurringSchedule) => void;
  onDeleteSchedule: (scheduleId: string) => void;
  onToggleStatus: (scheduleId: string) => void;
  onGenerateDraftNow: (schedule: RecurringSchedule) => void;
  onBatchProcessDueSchedules: () => void;
  onViewInvoiceList: () => void;
}

export const RecurringSchedulesView: React.FC<RecurringSchedulesViewProps> = ({
  schedules,
  clients,
  onOpenCreateSchedule,
  onEditSchedule,
  onDeleteSchedule,
  onToggleStatus,
  onGenerateDraftNow,
  onBatchProcessDueSchedules,
  onViewInvoiceList,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'due'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculations
  const activeSchedules = schedules.filter((s) => s.status === 'active');
  const dueSchedules = schedules.filter((s) => s.status === 'active' && isScheduleDue(s.nextBillingDate));
  
  const totalMRR = activeSchedules.reduce((acc, s) => acc + calculateMRR(s.total, s.frequency), 0);
  const totalARR = totalMRR * 12;
  const totalInvoicesGenerated = schedules.reduce((acc, s) => acc + s.generatedInvoicesCount, 0);

  // Filtered List
  const filteredSchedules = schedules.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.clientEmail.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return s.status === 'active';
    if (filterStatus === 'paused') return s.status === 'paused';
    if (filterStatus === 'due') return s.status === 'active' && isScheduleDue(s.nextBillingDate);
    return true;
  });

  return (
    <div id="recurring-schedules-view" className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Recurring Schedules</h2>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold font-mono">
              Auto-Pilot
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Automate routine billing patterns and generate ready-to-review draft invoices on schedule.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          {dueSchedules.length > 0 && (
            <button
              onClick={onBatchProcessDueSchedules}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all animate-pulse"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Process Due Invoices ({dueSchedules.length})</span>
            </button>
          )}

          <button
            onClick={() => onOpenCreateSchedule()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Recurring Schedule</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 font-mono uppercase">Active Schedules</span>
            <Repeat className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-data mt-1">
            {activeSchedules.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{schedules.length} total patterns</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 font-mono uppercase">Normalized MRR</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono-data mt-1">
            ${totalMRR.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Monthly recurring pace</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-600 font-mono uppercase">Projected ARR</span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-700 font-mono-data mt-1">
            ${totalARR.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Annualized recurring run-rate</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-600 font-mono uppercase">Auto-Generated Drafts</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700 font-mono-data mt-1">
            {totalInvoicesGenerated}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Invoices created from schedules</div>
        </div>
      </div>

      {/* Due Schedules Notice Banner */}
      {dueSchedules.length > 0 && (
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm block">
                {dueSchedules.length} Recurring {dueSchedules.length === 1 ? 'Schedule is' : 'Schedules are'} Ready to Generate
              </span>
              <span className="text-amber-800 text-[11px]">
                The billing date has arrived for {dueSchedules.map(s => s.clientName).join(', ')}. Generate draft invoices now with one click.
              </span>
            </div>
          </div>
          <button
            onClick={onBatchProcessDueSchedules}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm transition-all whitespace-nowrap self-start sm:self-auto"
          >
            Generate All {dueSchedules.length} Drafts
          </button>
        </div>
      )}

      {/* Control Bar: Filters & Search */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: `All Schedules (${schedules.length})` },
            { id: 'active', label: `Active (${activeSchedules.length})` },
            { id: 'due', label: `Due for Run (${dueSchedules.length})` },
            { id: 'paused', label: `Paused (${schedules.filter(s => s.status === 'paused').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
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

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search schedules or clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Schedules List Grid */}
      {filteredSchedules.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Repeat className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">No Recurring Schedules Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Set up automated billing patterns for clients on weekly, monthly, quarterly, or annual retainers.
            </p>
          </div>
          <button
            onClick={() => onOpenCreateSchedule()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Schedule</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredSchedules.map((schedule) => {
            const isDue = schedule.status === 'active' && isScheduleDue(schedule.nextBillingDate);
            const mrrValue = calculateMRR(schedule.total, schedule.frequency);

            return (
              <div
                key={schedule.id}
                className={`bg-white rounded-xl border transition-all duration-150 p-5 shadow-xs flex flex-col justify-between relative ${
                  isDue 
                    ? 'border-amber-300 ring-1 ring-amber-200/70 bg-gradient-to-b from-amber-50/20 to-white' 
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {/* Card Top Row */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 font-black flex items-center justify-center text-sm border border-slate-200 shrink-0">
                        {schedule.clientAvatar || schedule.clientName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm leading-tight">{schedule.title}</h4>
                        <div className="text-xs text-slate-500 font-medium">{schedule.clientName}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md font-mono ${
                          schedule.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {schedule.status}
                      </span>
                      <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md capitalize font-mono">
                        {schedule.frequency}
                      </span>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 font-medium block text-[11px]">Cycle Amount</span>
                      <span className="text-base font-black text-slate-900 font-mono">
                        ${schedule.total.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 font-medium block text-[11px]">Normalized MRR</span>
                      <span className="text-xs font-bold text-emerald-700 font-mono">
                        ${mrrValue.toFixed(2)} / mo
                      </span>
                    </div>
                  </div>

                  {/* Schedule Details & Run Info */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-mono uppercase">Next Run Date</span>
                        <span className={`font-mono font-bold ${isDue ? 'text-amber-700' : 'text-slate-800'}`}>
                          {formatDate(schedule.nextBillingDate)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-mono uppercase">Total Drafts</span>
                        <span className="font-mono font-bold text-slate-800">
                          {schedule.generatedInvoicesCount} generated
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Line items preview */}
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block mb-1">
                      Billing Items ({schedule.items.length}):
                    </span>
                    <div className="space-y-1">
                      {schedule.items.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex justify-between text-[11px] text-slate-600">
                          <span className="truncate max-w-[200px]">{item.qty}x {item.description}</span>
                          <span className="font-mono text-slate-800 font-medium">${item.total.toFixed(2)}</span>
                        </div>
                      ))}
                      {schedule.items.length > 2 && (
                        <div className="text-[10px] text-slate-400">
                          +{schedule.items.length - 2} more line items
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onToggleStatus(schedule.id)}
                      title={schedule.status === 'active' ? 'Pause Schedule' : 'Resume Schedule'}
                      className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors flex items-center gap-1 ${
                        schedule.status === 'active'
                          ? 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {schedule.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>

                    <button
                      onClick={() => onEditSchedule(schedule)}
                      title="Edit Schedule"
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteSchedule(schedule.id)}
                      title="Delete Schedule"
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onGenerateDraftNow(schedule)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-xs ${
                      isDue
                        ? 'bg-amber-600 hover:bg-amber-700 text-white font-bold'
                        : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Generate Draft Now</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
