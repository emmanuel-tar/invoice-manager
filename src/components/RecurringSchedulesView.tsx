import React, { useState, useMemo } from 'react';
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
  RefreshCw,
  Table as TableIcon,
  LayoutGrid,
  ArrowUpDown,
  Send,
  Check,
  ChevronRight,
  Layers
} from 'lucide-react';
import { RecurringSchedule, Client } from '../types';
import { 
  calculateMRR, 
  getFrequencyLabel, 
  isScheduleDue, 
  formatDate,
  getNextRunInfo,
  BILLING_PATTERN_PRESETS
} from '../utils/recurringUtils';
import { formatCurrencyAmount } from '../data/currencies';

interface RecurringSchedulesViewProps {
  schedules: RecurringSchedule[];
  clients: Client[];
  currencySymbol?: string;
  onOpenCreateSchedule: (initialData?: Partial<RecurringSchedule>) => void;
  onEditSchedule: (schedule: RecurringSchedule) => void;
  onDeleteSchedule: (scheduleId: string) => void;
  onToggleStatus: (scheduleId: string) => void;
  onGenerateDraftNow: (schedule: RecurringSchedule) => void;
  onBatchProcessDueSchedules: () => void;
  onViewInvoiceList: () => void;
}

type ViewMode = 'table' | 'grid';
type SortOption = 'next_run' | 'mrr' | 'title' | 'amount' | 'generated_count';

export const RecurringSchedulesView: React.FC<RecurringSchedulesViewProps> = ({
  schedules,
  clients,
  currencySymbol = '$',
  onOpenCreateSchedule,
  onEditSchedule,
  onDeleteSchedule,
  onToggleStatus,
  onGenerateDraftNow,
  onBatchProcessDueSchedules,
  onViewInvoiceList,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused' | 'due'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('next_run');

  // Calculations
  const activeSchedules = schedules.filter((s) => s.status === 'active');
  const dueSchedules = schedules.filter((s) => s.status === 'active' && isScheduleDue(s.nextBillingDate));
  
  const totalMRR = activeSchedules.reduce((acc, s) => acc + calculateMRR(s.total, s.frequency), 0);
  const totalARR = totalMRR * 12;
  const totalInvoicesGenerated = schedules.reduce((acc, s) => acc + s.generatedInvoicesCount, 0);

  // Filtered and Sorted List
  const processedSchedules = useMemo(() => {
    const filtered = schedules.filter((s) => {
      const matchesSearch =
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.frequency.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterStatus === 'all') return true;
      if (filterStatus === 'active') return s.status === 'active';
      if (filterStatus === 'paused') return s.status === 'paused';
      if (filterStatus === 'due') return s.status === 'active' && isScheduleDue(s.nextBillingDate);
      return true;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'next_run') {
        const isADue = a.status === 'active' && isScheduleDue(a.nextBillingDate);
        const isBDue = b.status === 'active' && isScheduleDue(b.nextBillingDate);
        if (isADue && !isBDue) return -1;
        if (!isADue && isBDue) return 1;

        const dateA = new Date(a.nextBillingDate).getTime();
        const dateB = new Date(b.nextBillingDate).getTime();
        return dateA - dateB;
      }
      if (sortBy === 'mrr') {
        return calculateMRR(b.total, b.frequency) - calculateMRR(a.total, a.frequency);
      }
      if (sortBy === 'amount') {
        return b.total - a.total;
      }
      if (sortBy === 'generated_count') {
        return b.generatedInvoicesCount - a.generatedInvoicesCount;
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [schedules, searchQuery, filterStatus, sortBy]);

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
              id="recurring-batch-process-due-btn"
              onClick={onBatchProcessDueSchedules}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all animate-pulse"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Process Due Invoices ({dueSchedules.length})</span>
            </button>
          )}

          <button
            id="recurring-new-schedule-btn"
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
        <div id="recurring-metric-active-card" className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 font-mono uppercase">Active Schedules</span>
            <Repeat className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-data mt-1">
            {activeSchedules.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{schedules.length} total patterns</div>
        </div>

        <div id="recurring-metric-mrr-card" className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 font-mono uppercase">Normalized MRR</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono-data mt-1">
            {formatCurrencyAmount(totalMRR, currencySymbol)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Monthly recurring pace</div>
        </div>

        <div id="recurring-metric-arr-card" className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-600 font-mono uppercase">Projected ARR</span>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-700 font-mono-data mt-1">
            {formatCurrencyAmount(totalARR, currencySymbol)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Annualized recurring run-rate</div>
        </div>

        <div id="recurring-metric-drafts-card" className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
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
        <div 
          id="recurring-due-banner"
          className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 text-xs shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm block">
                {dueSchedules.length} Recurring {dueSchedules.length === 1 ? 'Schedule is' : 'Schedules are'} Ready to Generate
              </span>
              <span className="text-amber-800 text-[11px]">
                The calculated next run date has arrived for {dueSchedules.map(s => s.clientName).join(', ')}. Generate draft invoices now with one click.
              </span>
            </div>
          </div>
          <button
            onClick={onBatchProcessDueSchedules}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold rounded-lg shadow-sm transition-all whitespace-nowrap self-start sm:self-auto"
          >
            Generate All {dueSchedules.length} Drafts
          </button>
        </div>
      )}

      {/* Control Bar: Filters, Search, Sort & View Mode Switcher */}
      <div 
        id="recurring-controls-bar"
        className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: `All Schedules (${schedules.length})` },
            { id: 'active', label: `Active (${activeSchedules.length})` },
            { id: 'due', label: `Due for Run (${dueSchedules.length})` },
            { id: 'paused', label: `Paused (${schedules.filter(s => s.status === 'paused').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              id={`recurring-filter-${tab.id}-btn`}
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

        {/* Right Controls: Search, Sort, View Toggle */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Search Input */}
          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="recurring-search-input"
              type="text"
              placeholder="Search schedules, clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-medium placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              id="recurring-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="next_run">Sort: Next Run Date</option>
              <option value="mrr">Sort: Highest MRR</option>
              <option value="amount">Sort: Cycle Amount</option>
              <option value="generated_count">Sort: Drafts Count</option>
              <option value="title">Sort: Title (A-Z)</option>
            </select>
          </div>

          {/* View Mode Switcher (Table vs Grid) */}
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200/80">
            <button
              id="recurring-view-table-toggle-btn"
              type="button"
              onClick={() => setViewMode('table')}
              title="Table View (with Next Run Date Column)"
              className={`p-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Table</span>
            </button>
            <button
              id="recurring-view-grid-toggle-btn"
              type="button"
              onClick={() => setViewMode('grid')}
              title="Card Grid View"
              className={`p-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Schedules View (Table or Grid) */}
      {processedSchedules.length === 0 ? (
        <div id="recurring-empty-state" className="p-12 text-center bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-4">
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
      ) : viewMode === 'table' ? (
        /* ======================== TABLE VIEW WITH 'NEXT RUN DATE' COLUMN ======================== */
        <div 
          id="recurring-schedules-table-card" 
          className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden"
        >
          <div className="overflow-x-auto custom-scrollbar">
            <table id="recurring-schedules-table" className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 sticky top-0 border-b border-slate-200 text-slate-600 font-mono uppercase tracking-wider text-[10px] z-10">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Schedule & Client</th>
                  <th className="py-3.5 px-3 font-bold">Frequency</th>
                  <th className="py-3.5 px-4 font-bold text-right">Cycle Amount</th>
                  <th className="py-3.5 px-3 font-bold text-center">Drafts Generated</th>
                  {/* Dedicated 'Next Run Date' Column with Calculation & Visual Indicator */}
                  <th className="py-3.5 px-4 font-bold min-w-[200px] bg-blue-50/40 text-blue-900 border-l border-r border-blue-100">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>Next Run Date (Calculation)</span>
                    </div>
                  </th>
                  <th className="py-3.5 px-3 font-bold text-center">Auto-Send</th>
                  <th className="py-3.5 px-3 font-bold text-center">Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {processedSchedules.map((schedule) => {
                  const runInfo = getNextRunInfo(schedule);
                  const isDue = runInfo.isDue;
                  const mrrValue = calculateMRR(schedule.total, schedule.frequency);

                  return (
                    <tr 
                      key={schedule.id} 
                      id={`recurring-row-${schedule.id}`}
                      className={`hover:bg-slate-50/80 transition-colors group ${
                        isDue ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      {/* Schedule Title & Client */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-black flex items-center justify-center text-xs border border-slate-200 shrink-0 mt-0.5">
                            {schedule.clientAvatar || schedule.clientName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                              <span>{schedule.title}</span>
                              {isDue && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-amber-500 text-white animate-pulse">
                                  DUE
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                              {schedule.clientName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">
                              {schedule.clientEmail}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Frequency */}
                      <td className="py-3.5 px-3">
                        <span className="inline-block text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md capitalize font-mono">
                          {schedule.frequency}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">
                          Terms: Net {schedule.paymentTermsDays}d
                        </div>
                      </td>

                      {/* Cycle Amount & MRR */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="font-mono font-black text-slate-900 text-xs">
                          {formatCurrencyAmount(schedule.total, currencySymbol)}
                        </div>
                        <div className="text-[10px] text-emerald-700 font-mono font-semibold mt-0.5">
                          {formatCurrencyAmount(mrrValue, currencySymbol)}/mo
                        </div>
                      </td>

                      {/* Drafts Generated */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-mono font-bold text-[11px]">
                          <FileText className="w-3 h-3 text-slate-400" />
                          <span>{schedule.generatedInvoicesCount}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {schedule.lastGeneratedDate ? `Last: ${formatDate(schedule.lastGeneratedDate)}` : 'Never run'}
                        </div>
                      </td>

                      {/* === DEDICATED 'NEXT RUN DATE' COLUMN WITH VISUAL INDICATOR === */}
                      <td className="py-3.5 px-4 bg-blue-50/20 border-l border-r border-blue-100/70">
                        <div className="space-y-1.5">
                          {/* Visual Indicator Pill & Date */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span 
                              id={`recurring-next-run-badge-${schedule.id}`}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono border shadow-2xs ${runInfo.badgeBgColor} ${runInfo.badgeTextColor} ${runInfo.badgeBorderColor}`}
                            >
                              {runInfo.urgencyLevel === 'critical' ? (
                                <Zap className="w-3 h-3 animate-bounce" />
                              ) : runInfo.urgencyLevel === 'warning' ? (
                                <Clock className="w-3 h-3" />
                              ) : runInfo.urgencyLevel === 'upcoming' ? (
                                <Calendar className="w-3 h-3" />
                              ) : runInfo.urgencyLevel === 'paused' ? (
                                <Pause className="w-3 h-3" />
                              ) : (
                                <Clock className="w-3 h-3" />
                              )}
                              <span>{runInfo.relativeText}</span>
                            </span>

                            <span className="font-mono font-bold text-slate-900 text-xs">
                              {runInfo.dateFormatted}
                            </span>
                          </div>

                          {/* Calculated Following Cycle Projection */}
                          <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                            <span className="text-slate-400">↳</span>
                            <span>{runInfo.followingRunRelative}</span>
                          </div>
                        </div>
                      </td>

                      {/* Auto-Send Mode */}
                      <td className="py-3.5 px-3 text-center">
                        <span className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                          schedule.autoSend 
                            ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {schedule.autoSend ? 'Auto-Send' : 'Draft Review'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md font-mono ${
                            schedule.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {schedule.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`recurring-run-now-btn-${schedule.id}`}
                            onClick={() => onGenerateDraftNow(schedule)}
                            title={isDue ? 'Due for Run! Generate Draft Invoice Now' : 'Generate Draft Invoice Now'}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all shadow-2xs ${
                              isDue
                                ? 'bg-amber-600 hover:bg-amber-700 text-white font-bold animate-pulse'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            <Zap className="w-3 h-3" />
                            <span>{isDue ? 'Run Due' : 'Run'}</span>
                          </button>

                          <button
                            onClick={() => onToggleStatus(schedule.id)}
                            title={schedule.status === 'active' ? 'Pause Schedule' : 'Resume Schedule'}
                            className={`p-1 rounded-md border text-xs font-semibold transition-colors ${
                              schedule.status === 'active'
                                ? 'border-slate-200 text-slate-500 hover:bg-slate-100'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {schedule.status === 'active' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          </button>

                          <button
                            onClick={() => onEditSchedule(schedule)}
                            title="Edit Schedule"
                            className="p-1 rounded-md border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                          >
                            <Edit className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => onDeleteSchedule(schedule.id)}
                            title="Delete Schedule"
                            className="p-1 rounded-md border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ======================== CARD GRID VIEW ======================== */
        <div id="recurring-schedules-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {processedSchedules.map((schedule) => {
            const runInfo = getNextRunInfo(schedule);
            const isDue = runInfo.isDue;
            const mrrValue = calculateMRR(schedule.total, schedule.frequency);

            return (
              <div
                key={schedule.id}
                id={`recurring-card-${schedule.id}`}
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
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-slate-900 text-sm leading-tight">{schedule.title}</h4>
                          {isDue && (
                            <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-amber-500 text-white">
                              DUE
                            </span>
                          )}
                        </div>
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
                        {formatCurrencyAmount(schedule.total, currencySymbol)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 font-medium block text-[11px]">Normalized MRR</span>
                      <span className="text-xs font-bold text-emerald-700 font-mono">
                        {formatCurrencyAmount(mrrValue, currencySymbol)} / mo
                      </span>
                    </div>
                  </div>

                  {/* Schedule Details & Enhanced Next Run Date Info */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    {/* Visual Next Run Date Column Block */}
                    <div className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-100 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-blue-800 font-bold font-mono uppercase flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-600" />
                          <span>Next Run Date</span>
                        </span>
                        <span 
                          className={`text-[9px] font-bold font-mono px-1.5 py-0.2 rounded border ${runInfo.badgeBgColor} ${runInfo.badgeTextColor} ${runInfo.badgeBorderColor}`}
                        >
                          {runInfo.relativeText}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className={`font-mono font-black text-xs ${isDue ? 'text-amber-700' : 'text-slate-900'}`}>
                          {runInfo.dateFormatted}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">
                          {runInfo.followingRunRelative}
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 flex flex-col justify-between">
                      <span className="text-[10px] text-slate-500 font-bold font-mono uppercase flex items-center gap-1">
                        <FileText className="w-3 h-3 text-slate-400" />
                        <span>Drafts Generated</span>
                      </span>
                      <div className="mt-1">
                        <span className="font-mono font-bold text-slate-800 text-xs">
                          {schedule.generatedInvoicesCount} generated
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {schedule.lastGeneratedDate ? `Last: ${formatDate(schedule.lastGeneratedDate)}` : 'Never run'}
                        </div>
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
                          <span className="font-mono text-slate-800 font-medium">
                            {formatCurrencyAmount(item.total, currencySymbol)}
                          </span>
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

