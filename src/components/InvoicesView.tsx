import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Send, 
  Eye, 
  MoreVertical, 
  CheckCircle, 
  Trash2, 
  Copy, 
  FileText,
  Clock,
  AlertCircle,
  CreditCard,
  Printer,
  Repeat,
  Zap,
  Calendar,
  User,
  X,
  ChevronDown,
  ArrowUpDown,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';
import { Invoice, InvoiceStatus, Client } from '../types';
import { isDateInRange, getPresetDateRange, parseDateSafe } from '../utils/dateUtils';

interface InvoicesViewProps {
  invoices: Invoice[];
  clients?: Client[];
  globalSearch?: string;
  onGlobalSearchChange?: (val: string) => void;
  onOpenCreateInvoice: () => void;
  onViewInvoice: (invoice: Invoice) => void;
  onSendInvoice: (invoice: Invoice) => void;
  onMarkAsPaid: (invoiceId: string) => void;
  onDuplicateInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (invoiceId: string) => void;
  onPayOnline: (invoice: Invoice) => void;
  onMakeRecurring?: (invoice: Invoice) => void;
  onNavigateToRecurring?: () => void;
  dueRecurringCount?: number;
}

type SortField = 'date' | 'dueDate' | 'total' | 'invoiceNumber' | 'clientName';
type SortOrder = 'asc' | 'desc';
type DateTarget = 'date' | 'dueDate';

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices,
  clients = [],
  globalSearch = '',
  onGlobalSearchChange,
  onOpenCreateInvoice,
  onViewInvoice,
  onSendInvoice,
  onMarkAsPaid,
  onDuplicateInvoice,
  onDeleteInvoice,
  onPayOnline,
  onMakeRecurring,
  onNavigateToRecurring,
  dueRecurringCount = 0,
}) => {
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>(globalSearch);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  
  // Date Range Filter State
  const [datePreset, setDatePreset] = useState<string>('all');
  const [dateTarget, setDateTarget] = useState<DateTarget>('date');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // Sorting State
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // UI Menus
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Sync external global search if it changes
  useEffect(() => {
    if (globalSearch !== undefined && globalSearch !== searchQuery) {
      setSearchQuery(globalSearch);
    }
  }, [globalSearch]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (onGlobalSearchChange) {
      onGlobalSearchChange(val);
    }
  };

  // Distinct client names from invoices and clients registry with counts
  const clientOptions = useMemo(() => {
    const clientMap = new Map<string, number>();
    
    // Add all clients from the invoices list
    invoices.forEach((inv) => {
      if (inv.clientName) {
        clientMap.set(inv.clientName, (clientMap.get(inv.clientName) || 0) + 1);
      }
    });

    // Ensure all clients in registry are represented even if 0 invoices
    clients.forEach((c) => {
      if (!clientMap.has(c.name)) {
        clientMap.set(c.name, 0);
      }
    });

    return Array.from(clientMap.entries()).map(([name, count]) => ({
      name,
      count,
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [invoices, clients]);

  // Handle Preset change
  const handleDatePresetChange = (preset: string) => {
    setDatePreset(preset);
    if (preset === 'all') {
      setCustomStartDate('');
      setCustomEndDate('');
    } else if (preset !== 'custom') {
      const range = getPresetDateRange(preset);
      if (range) {
        setCustomStartDate(range.startDate);
        setCustomEndDate(range.endDate);
      }
    }
  };

  // Filter and Sort Pipeline
  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((inv) => {
        // 1. Status Filter
        if (filterStatus !== 'all' && inv.status !== filterStatus) {
          return false;
        }

        // 2. Client Name Filter
        if (selectedClient !== 'all') {
          if (inv.clientName.trim().toLowerCase() !== selectedClient.trim().toLowerCase()) {
            return false;
          }
        }

        // 3. Date Range Filter
        if (customStartDate || customEndDate) {
          const targetDateField = dateTarget === 'date' ? inv.date : inv.dueDate;
          const inRange = isDateInRange(targetDateField, customStartDate, customEndDate);
          if (!inRange) {
            return false;
          }
        }

        // 4. Universal Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesId = inv.invoiceNumber.toLowerCase().includes(q);
          const matchesClient = inv.clientName.toLowerCase().includes(q);
          const matchesEmail = inv.clientEmail.toLowerCase().includes(q);
          const matchesAddress = (inv.clientAddress || '').toLowerCase().includes(q);
          const matchesRef = (inv.estimateRef || '').toLowerCase().includes(q);
          const matchesNotes = (inv.notes || '').toLowerCase().includes(q);
          const matchesItems = inv.items.some((item) =>
            item.description.toLowerCase().includes(q)
          );
          const matchesAmount = inv.total.toString().includes(q);

          if (
            !matchesId &&
            !matchesClient &&
            !matchesEmail &&
            !matchesAddress &&
            !matchesRef &&
            !matchesNotes &&
            !matchesItems &&
            !matchesAmount
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortField === 'date') {
          const dateA = parseDateSafe(a.date)?.getTime() || 0;
          const dateB = parseDateSafe(b.date)?.getTime() || 0;
          comparison = dateA - dateB;
        } else if (sortField === 'dueDate') {
          const dateA = parseDateSafe(a.dueDate)?.getTime() || 0;
          const dateB = parseDateSafe(b.dueDate)?.getTime() || 0;
          comparison = dateA - dateB;
        } else if (sortField === 'total') {
          comparison = a.total - b.total;
        } else if (sortField === 'invoiceNumber') {
          comparison = a.invoiceNumber.localeCompare(b.invoiceNumber);
        } else if (sortField === 'clientName') {
          comparison = a.clientName.localeCompare(b.clientName);
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [
    invoices,
    filterStatus,
    selectedClient,
    customStartDate,
    customEndDate,
    dateTarget,
    searchQuery,
    sortField,
    sortOrder,
  ]);

  // Financial Metrics Calculation
  const totalInvoiced = invoices.reduce((acc, i) => acc + i.total, 0);
  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((acc, i) => acc + i.total, 0);
  const totalPending = invoices.filter((i) => i.status === 'pending').reduce((acc, i) => acc + i.total, 0);
  const totalOverdue = invoices.filter((i) => i.status === 'overdue').reduce((acc, i) => acc + i.total, 0);

  // Filtered totals
  const filteredTotal = filteredInvoices.reduce((acc, i) => acc + i.total, 0);
  const filteredPaid = filteredInvoices.filter((i) => i.status === 'paid').reduce((acc, i) => acc + i.total, 0);
  const filteredPending = filteredInvoices.filter((i) => i.status === 'pending').reduce((acc, i) => acc + i.total, 0);
  const filteredOverdue = filteredInvoices.filter((i) => i.status === 'overdue').reduce((acc, i) => acc + i.total, 0);

  // Status Counts for Tabs
  const statusCounts = useMemo(() => {
    return {
      all: invoices.length,
      paid: invoices.filter((i) => i.status === 'paid').length,
      pending: invoices.filter((i) => i.status === 'pending').length,
      overdue: invoices.filter((i) => i.status === 'overdue').length,
      draft: invoices.filter((i) => i.status === 'draft').length,
    };
  }, [invoices]);

  // Check if any filter is active
  const hasActiveFilters = Boolean(
    filterStatus !== 'all' ||
    selectedClient !== 'all' ||
    searchQuery.trim() !== '' ||
    datePreset !== 'all' ||
    customStartDate !== '' ||
    customEndDate !== ''
  );

  const handleResetAllFilters = () => {
    setFilterStatus('all');
    setSelectedClient('all');
    setSearchQuery('');
    if (onGlobalSearchChange) onGlobalSearchChange('');
    setDatePreset('all');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  // Export filtered invoices as CSV
  const handleExportFilteredCSV = () => {
    if (filteredInvoices.length === 0) return;
    
    const headers = ['Invoice Number', 'Client Name', 'Client Email', 'Issue Date', 'Due Date', 'Status', 'Subtotal', 'Tax', 'Total', 'Notes'];
    const rows = filteredInvoices.map(inv => [
      inv.invoiceNumber,
      `"${inv.clientName.replace(/"/g, '""')}"`,
      inv.clientEmail,
      inv.date,
      inv.dueDate,
      inv.status,
      inv.subtotal.toFixed(2),
      inv.taxAmount.toFixed(2),
      inv.total.toFixed(2),
      `"${(inv.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `InvoicePro_Filtered_Invoices_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="invoices-view-container" className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Invoices & Billing</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Search, filter by date or client, and manage settlement workflows.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {filteredInvoices.length > 0 && (
            <button
              id="btn-export-csv"
              onClick={handleExportFilteredCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-all"
              title="Download CSV of current filtered invoices"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export CSV ({filteredInvoices.length})</span>
            </button>
          )}

          {onNavigateToRecurring && (
            <button
              onClick={onNavigateToRecurring}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-all"
            >
              <Repeat className="w-4 h-4 text-blue-600" />
              <span>Recurring Schedules</span>
            </button>
          )}

          <button
            id="btn-create-invoice-main"
            onClick={onOpenCreateInvoice}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Invoice</span>
          </button>
        </div>
      </div>

      {/* Due Recurring Schedules Alert Banner */}
      {dueRecurringCount > 0 && onNavigateToRecurring && (
        <div className="p-4 bg-blue-50/80 rounded-xl border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-blue-950 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm block">
                {dueRecurringCount} Recurring Billing {dueRecurringCount === 1 ? 'Cycle is' : 'Cycles are'} Due
              </span>
              <span className="text-blue-700 text-[11px]">
                Saved client billing patterns have reached their run date and are ready to generate new draft invoices.
              </span>
            </div>
          </div>
          <button
            onClick={onNavigateToRecurring}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg shadow-sm transition-all whitespace-nowrap self-start sm:self-auto"
          >
            View Recurring Schedules
          </button>
        </div>
      )}

      {/* Metric Mini-Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 font-mono uppercase">
            {hasActiveFilters ? 'Filtered Total' : 'Total Invoiced'}
          </div>
          <div className="text-xl font-black text-slate-900 font-mono-data mt-1">
            ${(hasActiveFilters ? filteredTotal : totalInvoiced).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {hasActiveFilters ? `${filteredInvoices.length} matching of ${invoices.length} total` : `${invoices.length} total records`}
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-600 font-mono uppercase">Paid & Settled</div>
          <div className="text-xl font-black text-emerald-700 font-mono-data mt-1">
            ${(hasActiveFilters ? filteredPaid : totalPaid).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {(hasActiveFilters ? filteredInvoices : invoices).filter(i => i.status === 'paid').length} invoices
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-blue-600 font-mono uppercase">Pending Collection</div>
          <div className="text-xl font-black text-blue-700 font-mono-data mt-1">
            ${(hasActiveFilters ? filteredPending : totalPending).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {(hasActiveFilters ? filteredInvoices : invoices).filter(i => i.status === 'pending').length} awaiting payment
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-rose-600 font-mono uppercase">Overdue Balance</div>
          <div className="text-xl font-black text-rose-700 font-mono-data mt-1">
            ${(hasActiveFilters ? filteredOverdue : totalOverdue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {(hasActiveFilters ? filteredInvoices : invoices).filter(i => i.status === 'overdue').length} urgent attention
          </div>
        </div>
      </div>

      {/* Main Search and Advanced Filters Control Center */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-4">
        {/* Top Control Line: Search Bar, Client Filter, Status Filter Toggle, & Filter Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Universal Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="invoice-search-input"
              type="text"
              placeholder="Search by invoice #, client, email, item descriptions, or notes..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200/60"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Client Filter Dropdown */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="relative min-w-[200px] flex-1 sm:flex-none">
              <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                id="invoice-client-filter"
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer"
              >
                <option value="all">All Clients ({invoices.length})</option>
                {clientOptions.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.count})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Advanced Filters (Date Range & Sort) Toggle Button */}
            <button
              id="btn-toggle-advanced-filters"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                showAdvancedFilters || datePreset !== 'all' || customStartDate || customEndDate
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Date & Sort Filters</span>
              {(datePreset !== 'all' || customStartDate || customEndDate) && (
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Expandable Advanced Date Range & Sorting Panel */}
        {showAdvancedFilters && (
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-4 animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              {/* Date Filter Target (Issue Date vs Due Date) */}
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Date Field
                </label>
                <div className="flex bg-white rounded-lg border border-slate-200 p-0.5">
                  <button
                    type="button"
                    onClick={() => setDateTarget('date')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      dateTarget === 'date'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Issue Date
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateTarget('dueDate')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      dateTarget === 'dueDate'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Due Date
                  </button>
                </div>
              </div>

              {/* Date Presets Selector */}
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Date Range Preset
                </label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    id="invoice-date-preset-select"
                    value={datePreset}
                    onChange={(e) => handleDatePresetChange(e.target.value)}
                    className="w-full pl-8 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="last_7_days">Last 7 Days</option>
                    <option value="this_month">This Month</option>
                    <option value="last_30_days">Last 30 Days</option>
                    <option value="last_90_days">Last 90 Days</option>
                    <option value="this_year">This Year</option>
                    <option value="custom">Custom Date Range</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Custom Date Range Pickers (From / To) */}
              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  From Date
                </label>
                <input
                  id="filter-start-date"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => {
                    setCustomStartDate(e.target.value);
                    setDatePreset('custom');
                  }}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="md:col-span-3 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  To Date
                </label>
                <input
                  id="filter-end-date"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => {
                    setCustomEndDate(e.target.value);
                    setDatePreset('custom');
                  }}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Sorting Row */}
            <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Sort By:
                </span>
                <div className="flex items-center gap-1.5">
                  <select
                    id="invoice-sort-field-select"
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value as SortField)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
                  >
                    <option value="date">Issue Date</option>
                    <option value="dueDate">Due Date</option>
                    <option value="total">Invoice Amount</option>
                    <option value="clientName">Client Name</option>
                    <option value="invoiceNumber">Invoice Number</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
                    title={`Sort order: currently ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                    <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
                  </button>
                </div>
              </div>

              {/* Quick Clear Filter within Advanced Panel */}
              {(datePreset !== 'all' || customStartDate || customEndDate) && (
                <button
                  onClick={() => {
                    setDatePreset('all');
                    setCustomStartDate('');
                    setCustomEndDate('');
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Date Filters</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Status Tabs and Active Filters Badges */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1 border-t border-slate-100">
          {/* Status Tab Filters */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Invoices', count: statusCounts.all },
              { id: 'paid', label: 'Paid', count: statusCounts.paid },
              { id: 'pending', label: 'Pending', count: statusCounts.pending },
              { id: 'overdue', label: 'Overdue', count: statusCounts.overdue },
              { id: 'draft', label: 'Draft', count: statusCounts.draft },
            ].map((tab) => (
              <button
                key={tab.id}
                id={`tab-filter-${tab.id}`}
                onClick={() => setFilterStatus(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  filterStatus === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    filterStatus === tab.id
                      ? 'bg-blue-700/80 text-white'
                      : 'bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Showing Count */}
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-900">{filteredInvoices.length}</span> of {invoices.length} invoices
          </div>
        </div>

        {/* Active Filter Chips / Badges Bar */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
              Active Filters:
            </span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-800 font-medium text-[11px]">
                <span>Search: <strong>"{searchQuery}"</strong></span>
                <button
                  onClick={() => handleSearchChange('')}
                  className="text-blue-600 hover:text-blue-900 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedClient !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium text-[11px]">
                <span>Client: <strong>{selectedClient}</strong></span>
                <button
                  onClick={() => setSelectedClient('all')}
                  className="text-emerald-600 hover:text-emerald-900 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filterStatus !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-50 border border-purple-200 text-purple-800 font-medium text-[11px]">
                <span>Status: <strong>{filterStatus.toUpperCase()}</strong></span>
                <button
                  onClick={() => setFilterStatus('all')}
                  className="text-purple-600 hover:text-purple-900 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {(customStartDate || customEndDate) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-medium text-[11px]">
                <span>
                  {dateTarget === 'date' ? 'Issued' : 'Due'}:{' '}
                  <strong>
                    {customStartDate || 'Any'} → {customEndDate || 'Any'}
                  </strong>
                </span>
                <button
                  onClick={() => {
                    setDatePreset('all');
                    setCustomStartDate('');
                    setCustomEndDate('');
                  }}
                  className="text-amber-700 hover:text-amber-950 ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              id="btn-clear-all-filters"
              onClick={handleResetAllFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Invoices Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-mono uppercase tracking-wider text-[10px]">
              <tr>
                <th 
                  className="py-3.5 px-4 font-bold cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                  onClick={() => {
                    if (sortField === 'invoiceNumber') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('invoiceNumber');
                      setSortOrder('asc');
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Invoice #</span>
                    {sortField === 'invoiceNumber' && (
                      <span className="text-blue-600 font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="py-3.5 px-4 font-bold cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                  onClick={() => {
                    if (sortField === 'clientName') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('clientName');
                      setSortOrder('asc');
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Client</span>
                    {sortField === 'clientName' && (
                      <span className="text-blue-600 font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="py-3.5 px-4 font-bold cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                  onClick={() => {
                    if (sortField === 'date') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('date');
                      setSortOrder('desc');
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Issued Date</span>
                    {sortField === 'date' && (
                      <span className="text-blue-600 font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="py-3.5 px-4 font-bold cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                  onClick={() => {
                    if (sortField === 'dueDate') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('dueDate');
                      setSortOrder('asc');
                    }
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Due Date</span>
                    {sortField === 'dueDate' && (
                      <span className="text-blue-600 font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="py-3.5 px-4 font-bold text-right cursor-pointer hover:bg-slate-100/80 transition-colors select-none"
                  onClick={() => {
                    if (sortField === 'total') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('total');
                      setSortOrder('desc');
                    }
                  }}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Amount</span>
                    {sortField === 'total' && (
                      <span className="text-blue-600 font-bold">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="py-3.5 px-4 font-bold text-center">Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-slate-400">
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <Search className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-slate-700 text-sm">No Matching Invoices Found</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {hasActiveFilters
                          ? 'No invoices matched your current combination of search keyword, client filter, date range, and status.'
                          : 'No invoices are present in the ledger yet.'}
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={handleResetAllFilters}
                          className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset All Filters</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Invoice ID & Reference */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-blue-600 group-hover:text-blue-700">
                        {inv.invoiceNumber}
                      </div>
                      {inv.estimateRef && (
                        <div className="text-[10px] text-slate-500 font-mono">
                          Ref: {inv.estimateRef}
                        </div>
                      )}
                    </td>

                    {/* Client info */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{inv.clientName}</div>
                      <div className="text-[11px] text-slate-400">{inv.clientEmail}</div>
                    </td>

                    {/* Issued Date */}
                    <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                      {inv.date}
                    </td>

                    {/* Due Date */}
                    <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                      {inv.dueDate}
                    </td>

                    {/* Total Amount */}
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      ${inv.total.toFixed(2)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center">
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

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 relative">
                        {/* Quick View Button */}
                        <button
                          id={`btn-view-${inv.id}`}
                          onClick={() => onViewInvoice(inv)}
                          title="View / Print PDF"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Send Email Button */}
                        <button
                          id={`btn-send-${inv.id}`}
                          onClick={() => onSendInvoice(inv)}
                          title="Send via Email"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Send className="w-4 h-4" />
                        </button>

                        {/* Pay Portal Simulation */}
                        {inv.status !== 'paid' && (
                          <button
                            id={`btn-pay-${inv.id}`}
                            onClick={() => onPayOnline(inv)}
                            title="Simulate Client Payment Portal"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors font-semibold text-[10px] flex items-center gap-1"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay</span>
                          </button>
                        )}

                        {/* More Menu */}
                        <div className="relative">
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === inv.id ? null : inv.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === inv.id && (
                            <>
                              <div
                                className="fixed inset-0 z-20"
                                onClick={() => setActiveMenuId(null)}
                              />
                              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200/80 py-1 z-30 animate-in fade-in duration-100">
                                {inv.status !== 'paid' && (
                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onMarkAsPaid(inv.id);
                                    }}
                                    className="w-full px-3 py-2 text-left text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    <span>Mark as Paid</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onDuplicateInvoice(inv);
                                  }}
                                  className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Duplicate Invoice</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onViewInvoice(inv);
                                  }}
                                  className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <Printer className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Print / PDF Preview</span>
                                </button>
                                {onMakeRecurring && (
                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      onMakeRecurring(inv);
                                    }}
                                    className="w-full px-3 py-2 text-left text-xs text-blue-700 hover:bg-blue-50 flex items-center gap-2 font-medium"
                                  >
                                    <Repeat className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Make Recurring Schedule</span>
                                  </button>
                                )}
                                <div className="border-t border-slate-100 my-1" />
                                <button
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onDeleteInvoice(inv.id);
                                  }}
                                  className="w-full px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete Invoice</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
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
