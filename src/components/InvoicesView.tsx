import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Pencil,
  Zap,
  Calendar,
  User,
  X,
  ChevronDown,
  ArrowUpDown,
  SlidersHorizontal,
  RotateCcw,
  CheckSquare,
  Square,
  MinusSquare,
  Database,
  FileCode,
  Tag,
  Check,
  FileSpreadsheet,
  Layers,
  ShieldCheck,
  DollarSign
} from 'lucide-react';
import { Invoice, InvoiceStatus, Client, CompanyProfile, InventoryItem } from '../types';
import { isDateInRange, getPresetDateRange, parseDateSafe } from '../utils/dateUtils';
import { formatCurrencyAmount } from '../data/currencies';
import { getPublicInvoicePaymentUrl } from '../utils/paymentTokenUtils';

interface InvoicesViewProps {
  invoices: Invoice[];
  clients?: Client[];
  items?: InventoryItem[];
  companyProfile?: CompanyProfile;
  globalSearch?: string;
  onGlobalSearchChange?: (val: string) => void;
  onOpenCreateInvoice: () => void;
  onViewInvoice: (invoice: Invoice) => void;
  onSendInvoice: (invoice: Invoice) => void;
  onEditInvoice: (invoice: Invoice) => void;
  onMarkAsPaid: (invoiceId: string) => void;
  onDuplicateInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (invoiceId: string) => void;
  onPayOnline: (invoice: Invoice) => void;
  onOpenPublicInvoice?: (invoice: Invoice) => void;
  onMakeRecurring?: (invoice: Invoice) => void;
  onNavigateToRecurring?: () => void;
  dueRecurringCount?: number;
  onBulkMarkPaid?: (invoiceIds: string[]) => void;
  onBulkDelete?: (invoiceIds: string[]) => void;
  onBulkStatusChange?: (invoiceIds: string[], status: InvoiceStatus) => void;
}

type SortField = 'date' | 'dueDate' | 'total' | 'invoiceNumber' | 'clientName';
type SortOrder = 'asc' | 'desc';
type DateTarget = 'date' | 'dueDate';

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices,
  clients = [],
  items = [],
  companyProfile = { currencySymbol: '₦', currency: 'NGN' } as CompanyProfile,
  globalSearch = '',
  onGlobalSearchChange,
  onOpenCreateInvoice,
  onViewInvoice,
  onSendInvoice,
  onEditInvoice,
  onMarkAsPaid,
  onDuplicateInvoice,
  onDeleteInvoice,
  onPayOnline,
  onOpenPublicInvoice,
  onMakeRecurring,
  onNavigateToRecurring,
  dueRecurringCount = 0,
  onBulkMarkPaid,
  onBulkDelete,
  onBulkStatusChange,
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

  // Dropdown Popover Open States & Refs
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState<boolean>(false);
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState<boolean>(false);
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState<boolean>(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [auditExportScope, setAuditExportScope] = useState<'filtered' | 'selected' | 'all'>('filtered');
  const [auditExportType, setAuditExportType] = useState<'summary' | 'itemized'>('summary');
  const [exportToastMessage, setExportToastMessage] = useState<string | null>(null);
  const [clientSearchTerm, setClientSearchTerm] = useState<string>('');

  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const dateDropdownRef = useRef<HTMLDivElement>(null);
  const clientDropdownRef = useRef<HTMLDivElement>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(e.target as Node)) {
        setIsDateDropdownOpen(false);
      }
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(e.target as Node)) {
        setIsClientDropdownOpen(false);
      }
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target as Node)) {
        setIsExportDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, []);

  // Sorting State
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Multi-select state
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<Set<string>>(new Set());

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

  // Status metrics & options
  const statusOptions = useMemo(() => {
    const counts = { all: invoices.length, paid: 0, pending: 0, overdue: 0, draft: 0 };
    const totals = { all: 0, paid: 0, pending: 0, overdue: 0, draft: 0 };

    invoices.forEach((inv) => {
      totals.all += inv.total;
      if (inv.status === 'paid') {
        counts.paid++;
        totals.paid += inv.total;
      } else if (inv.status === 'pending') {
        counts.pending++;
        totals.pending += inv.total;
      } else if (inv.status === 'overdue') {
        counts.overdue++;
        totals.overdue += inv.total;
      } else if (inv.status === 'draft') {
        counts.draft++;
        totals.draft += inv.total;
      }
    });

    return [
      { id: 'all', label: 'All Statuses', dotColor: 'bg-slate-400', textColor: 'text-slate-700', count: counts.all, total: totals.all },
      { id: 'paid', label: 'Paid & Settled', dotColor: 'bg-emerald-500', textColor: 'text-emerald-700', count: counts.paid, total: totals.paid },
      { id: 'pending', label: 'Pending Payment', dotColor: 'bg-blue-500', textColor: 'text-blue-700', count: counts.pending, total: totals.pending },
      { id: 'overdue', label: 'Overdue Balance', dotColor: 'bg-rose-500', textColor: 'text-rose-700', count: counts.overdue, total: totals.overdue },
      { id: 'draft', label: 'Draft Invoices', dotColor: 'bg-slate-400', textColor: 'text-slate-600', count: counts.draft, total: totals.draft },
    ];
  }, [invoices]);

  // Distinct enriched clients from invoices & clients registry
  const enrichedClientOptions = useMemo(() => {
    const clientMap = new Map<string, { count: number; total: number; outstanding: number; email?: string }>();

    invoices.forEach((inv) => {
      if (inv.clientName) {
        const existing = clientMap.get(inv.clientName) || { count: 0, total: 0, outstanding: 0, email: inv.clientEmail };
        existing.count += 1;
        existing.total += inv.total;
        if (inv.status === 'pending' || inv.status === 'overdue') {
          existing.outstanding += inv.total;
        }
        clientMap.set(inv.clientName, existing);
      }
    });

    clients.forEach((c) => {
      if (!clientMap.has(c.name)) {
        clientMap.set(c.name, { count: 0, total: 0, outstanding: 0, email: c.email });
      }
    });

    return Array.from(clientMap.entries())
      .map(([name, data]) => ({
        name,
        ...data,
      }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [invoices, clients]);

  const filteredClientList = useMemo(() => {
    if (!clientSearchTerm.trim()) return enrichedClientOptions;
    const term = clientSearchTerm.toLowerCase();
    return enrichedClientOptions.filter(
      (c) => c.name.toLowerCase().includes(term) || (c.email && c.email.toLowerCase().includes(term))
    );
  }, [enrichedClientOptions, clientSearchTerm]);

  // Date Range Presets
  const DATE_PRESETS = [
    { id: 'all', label: 'All Dates' },
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'last_7_days', label: 'Last 7 Days' },
    { id: 'this_month', label: 'This Month' },
    { id: 'last_month', label: 'Last Month' },
    { id: 'this_quarter', label: 'This Quarter' },
    { id: 'last_30_days', label: 'Last 30 Days' },
    { id: 'last_90_days', label: 'Last 90 Days' },
    { id: 'this_year', label: 'This Year' },
    { id: 'last_year', label: 'Last Year' },
    { id: 'custom', label: 'Custom Range' },
  ];

  const activeDateLabel = useMemo(() => {
    const targetPrefix = dateTarget === 'dueDate' ? 'Due: ' : '';
    if (customStartDate || customEndDate) {
      return `${targetPrefix}${customStartDate || 'Start'} → ${customEndDate || 'End'}`;
    }
    if (datePreset === 'all') return 'Date Range';
    const found = DATE_PRESETS.find((p) => p.id === datePreset);
    return `${targetPrefix}${found ? found.label : datePreset}`;
  }, [datePreset, customStartDate, customEndDate, dateTarget]);

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
        const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
        const matchesClient = selectedClient === 'all' || inv.clientName === selectedClient;

        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          q === '' ||
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.clientName.toLowerCase().includes(q) ||
          inv.clientEmail.toLowerCase().includes(q) ||
          (inv.notes && inv.notes.toLowerCase().includes(q)) ||
          inv.items.some((item) => item.description.toLowerCase().includes(q));

        const targetDateStr = dateTarget === 'date' ? inv.date : inv.dueDate;
        const matchesDate = isDateInRange(targetDateStr, customStartDate, customEndDate);

        return matchesStatus && matchesClient && matchesSearch && matchesDate;
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

  // Multi-select handlers
  const handleToggleInvoice = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedInvoiceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedInvoiceIds.size === filteredInvoices.length && filteredInvoices.length > 0) {
      setSelectedInvoiceIds(new Set());
    } else {
      setSelectedInvoiceIds(new Set(filteredInvoices.map((inv) => inv.id)));
    }
  };

  const handleBulkMarkPaid = () => {
    const ids = Array.from(selectedInvoiceIds);
    if (ids.length === 0) return;
    if (onBulkMarkPaid) {
      onBulkMarkPaid(ids);
    } else {
      ids.forEach((id) => onMarkAsPaid(id));
    }
    setSelectedInvoiceIds(new Set());
  };

  const handleBulkDelete = () => {
    const ids = Array.from(selectedInvoiceIds);
    if (ids.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${ids.length} selected invoices?`)) {
      if (onBulkDelete) {
        onBulkDelete(ids);
      } else {
        ids.forEach((id) => onDeleteInvoice(id));
      }
      setSelectedInvoiceIds(new Set());
    }
  };

  const handleBulkStatusChange = (status: InvoiceStatus) => {
    const ids = Array.from(selectedInvoiceIds);
    if (ids.length === 0) return;
    if (onBulkStatusChange) {
      onBulkStatusChange(ids, status);
    }
    setSelectedInvoiceIds(new Set());
  };

  // Helper to escape CSV values according to RFC 4180
  const escapeCsvCell = (val: string | number | undefined | null): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    return `"${str.replace(/"/g, '""')}"`;
  };

  // Helper to calculate payment aging status for financial audit
  const getInvoiceAging = (inv: Invoice): string => {
    if (inv.status === 'paid') return 'Settled';
    if (inv.status === 'draft') return 'Draft (Unissued)';
    const dueDateObj = parseDateSafe(inv.dueDate);
    if (!dueDateObj) return inv.status.toUpperCase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDateObj.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - dueDateObj.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0) {
      return `${diffDays} days overdue`;
    } else if (diffDays === 0) {
      return 'Due Today';
    } else {
      return `Current (due in ${Math.abs(diffDays)} days)`;
    }
  };

  // Generic CSV file downloader with UTF-8 BOM for cross-platform Excel & spreadsheet support
  const triggerCsvDownload = (csvString: string, fileName: string) => {
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.setAttribute('download', fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(url);
  };

  // Financial Audit CSV Export Function
  const handleExportAuditCSV = (
    targetInvoices: Invoice[] = filteredInvoices,
    type: 'summary' | 'itemized' = 'summary'
  ) => {
    if (targetInvoices.length === 0) {
      alert('No invoices match the current filter selection to export.');
      return;
    }

    const timestamp = new Date().toISOString();
    const dateStamp = timestamp.slice(0, 10);
    const currency = companyProfile.currency || 'USD';

    if (type === 'summary') {
      // 1. Summary Ledger Format for Financial Auditing
      const headers = [
        'Invoice Reference #',
        'Issue Date',
        'Due Date',
        'Payment Status',
        'Aging & Audit Status',
        'Client Name',
        'Client Email',
        'Client Address',
        'Currency',
        'Line Items Count',
        'Itemized Descriptions Summary',
        'Subtotal Amount',
        'Tax Amount',
        'Discount Amount',
        'Gross Total Amount',
        'Amount Paid / Settled',
        'Balance Due / Outstanding',
        'Estimate Reference',
        'Invoice Notes & Terms',
        'Record Created Timestamp',
        'Audit Export Timestamp',
      ];

      let totalGross = 0;
      let totalTax = 0;
      let totalDiscount = 0;
      let totalSubtotal = 0;
      let totalPaidAmount = 0;
      let totalOutstandingAmount = 0;
      let totalLineItems = 0;

      const rows = targetInvoices.map((inv) => {
        const lineCount = inv.items ? inv.items.length : 0;
        const itemsSummary = inv.items
          ? inv.items.map((it) => `${it.description || 'Item'} (qty: ${it.qty || 1})`).join('; ')
          : '';
        const paidAmount = inv.status === 'paid' ? inv.total : 0;
        const outstandingAmount = inv.status === 'paid' ? 0 : inv.total;

        totalGross += inv.total;
        totalTax += inv.taxAmount;
        totalDiscount += inv.discount || 0;
        totalSubtotal += inv.subtotal;
        totalPaidAmount += paidAmount;
        totalOutstandingAmount += outstandingAmount;
        totalLineItems += lineCount;

        return [
          escapeCsvCell(inv.invoiceNumber),
          escapeCsvCell(inv.date),
          escapeCsvCell(inv.dueDate),
          escapeCsvCell(inv.status.toUpperCase()),
          escapeCsvCell(getInvoiceAging(inv)),
          escapeCsvCell(inv.clientName),
          escapeCsvCell(inv.clientEmail),
          escapeCsvCell(inv.clientAddress),
          escapeCsvCell(currency),
          escapeCsvCell(lineCount),
          escapeCsvCell(itemsSummary),
          escapeCsvCell(inv.subtotal.toFixed(2)),
          escapeCsvCell(inv.taxAmount.toFixed(2)),
          escapeCsvCell((inv.discount || 0).toFixed(2)),
          escapeCsvCell(inv.total.toFixed(2)),
          escapeCsvCell(paidAmount.toFixed(2)),
          escapeCsvCell(outstandingAmount.toFixed(2)),
          escapeCsvCell(inv.estimateRef || 'N/A'),
          escapeCsvCell(inv.notes || ''),
          escapeCsvCell(inv.createdAt || 'N/A'),
          escapeCsvCell(timestamp),
        ].join(',');
      });

      // Audit Summary Aggregate Row
      const totalsRow = [
        escapeCsvCell(`AUDIT TOTALS (${targetInvoices.length} INVOICES)`),
        escapeCsvCell(''),
        escapeCsvCell(''),
        escapeCsvCell(''),
        escapeCsvCell(''),
        escapeCsvCell(''),
        escapeCsvCell(''),
        escapeCsvCell(''),
        escapeCsvCell(currency),
        escapeCsvCell(totalLineItems),
        escapeCsvCell(''),
        escapeCsvCell(totalSubtotal.toFixed(2)),
        escapeCsvCell(totalTax.toFixed(2)),
        escapeCsvCell(totalDiscount.toFixed(2)),
        escapeCsvCell(totalGross.toFixed(2)),
        escapeCsvCell(totalPaidAmount.toFixed(2)),
        escapeCsvCell(totalOutstandingAmount.toFixed(2)),
        escapeCsvCell(''),
        escapeCsvCell(''),
        escapeCsvCell(''),
        escapeCsvCell(timestamp),
      ].join(',');

      const csvContent = [headers.map(escapeCsvCell).join(','), ...rows, totalsRow].join('\r\n');
      const filename = `Financial_Audit_Summary_Ledger_${dateStamp}.csv`;
      triggerCsvDownload(csvContent, filename);
      
      setExportToastMessage(`Audit Summary Ledger exported (${targetInvoices.length} invoices, ${formatCurrencyAmount(totalGross, companyProfile.currencySymbol)})`);
    } else {
      // 2. Granular Itemized Audit Ledger Format
      const headers = [
        'Invoice Reference #',
        'Invoice Date',
        'Invoice Due Date',
        'Invoice Status',
        'Aging Status',
        'Client Name',
        'Client Email',
        'Currency',
        'Line Item #',
        'Item Description',
        'Quantity',
        'Unit Price',
        'Tax Rate (%)',
        'Line Item Subtotal',
        'Line Item Total',
        'Invoice Grand Total',
        'Invoice Notes',
        'Audit Export Timestamp',
      ];

      const rows: string[] = [];
      let totalItemVolume = 0;

      targetInvoices.forEach((inv) => {
        if (!inv.items || inv.items.length === 0) {
          rows.push([
            escapeCsvCell(inv.invoiceNumber),
            escapeCsvCell(inv.date),
            escapeCsvCell(inv.dueDate),
            escapeCsvCell(inv.status.toUpperCase()),
            escapeCsvCell(getInvoiceAging(inv)),
            escapeCsvCell(inv.clientName),
            escapeCsvCell(inv.clientEmail),
            escapeCsvCell(currency),
            escapeCsvCell(1),
            escapeCsvCell('General Invoice Total'),
            escapeCsvCell(1),
            escapeCsvCell(inv.total.toFixed(2)),
            escapeCsvCell(0),
            escapeCsvCell(inv.subtotal.toFixed(2)),
            escapeCsvCell(inv.total.toFixed(2)),
            escapeCsvCell(inv.total.toFixed(2)),
            escapeCsvCell(inv.notes || ''),
            escapeCsvCell(timestamp),
          ].join(','));
          totalItemVolume += inv.total;
        } else {
          inv.items.forEach((item, index) => {
            const lineSubtotal = (item.unitPrice || 0) * (item.qty || 1);
            totalItemVolume += item.total || lineSubtotal;
            rows.push([
              escapeCsvCell(inv.invoiceNumber),
              escapeCsvCell(inv.date),
              escapeCsvCell(inv.dueDate),
              escapeCsvCell(inv.status.toUpperCase()),
              escapeCsvCell(getInvoiceAging(inv)),
              escapeCsvCell(inv.clientName),
              escapeCsvCell(inv.clientEmail),
              escapeCsvCell(currency),
              escapeCsvCell(index + 1),
              escapeCsvCell(item.description),
              escapeCsvCell(item.qty || 1),
              escapeCsvCell((item.unitPrice || 0).toFixed(2)),
              escapeCsvCell(item.taxRate || 0),
              escapeCsvCell(lineSubtotal.toFixed(2)),
              escapeCsvCell((item.total || lineSubtotal).toFixed(2)),
              escapeCsvCell(inv.total.toFixed(2)),
              escapeCsvCell(inv.notes || ''),
              escapeCsvCell(timestamp),
            ].join(','));
          });
        }
      });

      const csvContent = [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
      const filename = `Financial_Audit_Itemized_Ledger_${dateStamp}.csv`;
      triggerCsvDownload(csvContent, filename);

      setExportToastMessage(`Itemized Audit Ledger exported (${rows.length} line items from ${targetInvoices.length} invoices)`);
    }

    setIsExportDropdownOpen(false);
    setIsAuditModalOpen(false);

    // Clear toast message after 4.5 seconds
    setTimeout(() => {
      setExportToastMessage(null);
    }, 4500);
  };

  // Local Data Export (Full JSON Backup of Invoices, Clients, Items)
  const handleExportLocalDataBackup = () => {
    const backupData = {
      appName: 'InvoicePro Suite',
      exportDate: new Date().toISOString(),
      version: '2.5.0',
      companyProfile,
      invoices,
      clients,
      items,
      totalInvoicesCount: invoices.length,
      totalClientsCount: clients.length,
      totalCatalogItemsCount: items.length,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `invoicepro_local_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportToastMessage(`Full system data backup JSON exported successfully`);
    setTimeout(() => {
      setExportToastMessage(null);
    }, 4000);
  };

  const isAllSelected = filteredInvoices.length > 0 && selectedInvoiceIds.size === filteredInvoices.length;
  const isPartiallySelected = selectedInvoiceIds.size > 0 && selectedInvoiceIds.size < filteredInvoices.length;

  return (
    <div id="invoices-view-container" className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-7 h-7 text-blue-600" />
            <span>Invoices & Billing Ledger</span>
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Search, filter by date, execute bulk settlement workflows, and export local backup archives.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Enhanced Export for Financial Audit Dropdown */}
          <div className="relative" ref={exportDropdownRef}>
            <button
              id="btn-export-audit-csv-dropdown"
              type="button"
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-bold shadow-xs transition-all"
              title="Export filtered invoices to CSV for financial auditing"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export Audit CSV</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-200 text-emerald-900 font-mono">
                {filteredInvoices.length}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-emerald-700 transition-transform ${isExportDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Export Dropdown Popover */}
            {isExportDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in duration-100 text-left">
                <div className="px-2.5 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                  <span>Financial Audit Export</span>
                  <span className="text-[10px] font-normal text-emerald-700 font-mono">
                    {filteredInvoices.length} records
                  </span>
                </div>

                <div className="py-1 space-y-1">
                  <button
                    id="btn-export-summary-csv"
                    type="button"
                    onClick={() => handleExportAuditCSV(filteredInvoices, 'summary')}
                    className="w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-xs text-slate-700 hover:bg-emerald-50/70 hover:text-emerald-950 transition-colors text-left group"
                  >
                    <FileText className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900 group-hover:text-emerald-900">
                        Audit Summary Ledger (.csv)
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        1 row per invoice with payment aging, tax accruals, and balance totals.
                      </div>
                    </div>
                  </button>

                  <button
                    id="btn-export-itemized-csv"
                    type="button"
                    onClick={() => handleExportAuditCSV(filteredInvoices, 'itemized')}
                    className="w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-xs text-slate-700 hover:bg-emerald-50/70 hover:text-emerald-950 transition-colors text-left group"
                  >
                    <Layers className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-900 group-hover:text-blue-900">
                        Itemized Audit Breakdown (.csv)
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Granular line-by-line export of all invoiced items, unit rates, and quantities.
                      </div>
                    </div>
                  </button>

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    id="btn-open-audit-modal"
                    type="button"
                    onClick={() => {
                      setIsAuditModalOpen(true);
                      setIsExportDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-500" />
                    <span>Configure Audit Export Center...</span>
                  </button>

                  <button
                    id="btn-local-backup-json"
                    type="button"
                    onClick={() => {
                      handleExportLocalDataBackup();
                      setIsExportDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
                  >
                    <Database className="w-4 h-4 text-slate-400" />
                    <span>Full System JSON Archive</span>
                  </button>
                </div>
              </div>
            )}
          </div>

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
            {formatCurrencyAmount(hasActiveFilters ? filteredTotal : totalInvoiced, companyProfile.currencySymbol)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {hasActiveFilters ? `${filteredInvoices.length} matching of ${invoices.length} total` : `${invoices.length} total records`}
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-600 font-mono uppercase">Paid & Settled</div>
          <div className="text-xl font-black text-emerald-700 font-mono-data mt-1">
            {formatCurrencyAmount(hasActiveFilters ? filteredPaid : totalPaid, companyProfile.currencySymbol)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {(hasActiveFilters ? filteredInvoices : invoices).filter(i => i.status === 'paid').length} invoices
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-blue-600 font-mono uppercase">Pending Collection</div>
          <div className="text-xl font-black text-blue-700 font-mono-data mt-1">
            {formatCurrencyAmount(hasActiveFilters ? filteredPending : totalPending, companyProfile.currencySymbol)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {(hasActiveFilters ? filteredInvoices : invoices).filter(i => i.status === 'pending').length} awaiting payment
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-rose-600 font-mono uppercase">Overdue Balance</div>
          <div className="text-xl font-black text-rose-700 font-mono-data mt-1">
            {formatCurrencyAmount(hasActiveFilters ? filteredOverdue : totalOverdue, companyProfile.currencySymbol)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {(hasActiveFilters ? filteredInvoices : invoices).filter(i => i.status === 'overdue').length} urgent attention
          </div>
        </div>
      </div>

      {/* Floating Multi-Select Bulk Actions Bar */}
      {selectedInvoiceIds.size > 0 && (
        <div className="sticky top-4 z-40 bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center font-mono">
              {selectedInvoiceIds.size}
            </span>
            <span className="text-xs font-semibold text-slate-200">
              {selectedInvoiceIds.size} {selectedInvoiceIds.size === 1 ? 'Invoice' : 'Invoices'} Selected
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                const selectedInvs = invoices.filter((i) => selectedInvoiceIds.has(i.id));
                handleExportAuditCSV(selectedInvs, 'summary');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-emerald-400 rounded-lg text-xs font-bold transition-all shadow-xs"
              title="Export only selected invoices to CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export Selected CSV ({selectedInvoiceIds.size})</span>
            </button>

            <button
              onClick={handleBulkMarkPaid}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Mark as Paid</span>
            </button>

            {onBulkStatusChange && (
              <button
                onClick={() => handleBulkStatusChange('pending')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Mark as Pending</span>
              </button>
            )}

            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected</span>
            </button>

            <button
              onClick={() => setSelectedInvoiceIds(new Set())}
              className="px-2.5 py-1.5 text-slate-400 hover:text-white text-xs font-semibold hover:bg-slate-800 rounded-lg transition-colors"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Main Search and Advanced Filters Control Center */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-4">
        {/* Top Control Line with Search and 3 Advanced Dropdowns */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          {/* Universal Search Input */}
          <div className="relative flex-1 min-w-[240px]">
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

          {/* Advanced Filter Dropdowns Group */}
          <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">
            {/* 1. Status Filter Dropdown */}
            <div className="relative" ref={statusDropdownRef}>
              <button
                id="btn-status-filter-dropdown"
                type="button"
                onClick={() => {
                  setIsStatusDropdownOpen(!isStatusDropdownOpen);
                  setIsDateDropdownOpen(false);
                  setIsClientDropdownOpen(false);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap ${
                  filterStatus !== 'all'
                    ? 'bg-blue-50/80 border-blue-300 text-blue-800 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    filterStatus === 'paid'
                      ? 'bg-emerald-500'
                      : filterStatus === 'pending'
                      ? 'bg-blue-500'
                      : filterStatus === 'overdue'
                      ? 'bg-rose-500'
                      : filterStatus === 'draft'
                      ? 'bg-slate-400'
                      : 'bg-slate-400'
                  }`}
                />
                <span>
                  {filterStatus === 'all'
                    ? 'Status: All'
                    : `Status: ${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}`}
                </span>
                {filterStatus !== 'all' && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-200/70 text-blue-900 font-mono">
                    {statusOptions.find((s) => s.id === filterStatus)?.count || 0}
                  </span>
                )}
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    isStatusDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Status Popover Menu */}
              {isStatusDropdownOpen && (
                <div className="absolute left-0 lg:left-auto lg:right-0 mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in duration-100">
                  <div className="px-2 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                    <span>Filter By Status</span>
                    {filterStatus !== 'all' && (
                      <button
                        onClick={() => setFilterStatus('all')}
                        className="text-[10px] text-blue-600 hover:underline lowercase font-normal"
                      >
                        reset
                      </button>
                    )}
                  </div>
                  <div className="py-1 space-y-0.5">
                    {statusOptions.map((opt) => {
                      const isSelected = filterStatus === opt.id;
                      return (
                        <button
                          key={opt.id}
                          id={`dropdown-status-option-${opt.id}`}
                          type="button"
                          onClick={() => {
                            setFilterStatus(opt.id);
                            setIsStatusDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                            isSelected
                              ? 'bg-blue-50 text-blue-900 font-bold'
                              : 'text-slate-700 hover:bg-slate-50 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${opt.dotColor}`} />
                            <span>{opt.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-400 font-mono">
                              ({opt.count})
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Date Range Filter Dropdown */}
            <div className="relative" ref={dateDropdownRef}>
              <button
                id="btn-date-filter-dropdown"
                type="button"
                onClick={() => {
                  setIsDateDropdownOpen(!isDateDropdownOpen);
                  setIsStatusDropdownOpen(false);
                  setIsClientDropdownOpen(false);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap ${
                  datePreset !== 'all' || customStartDate || customEndDate
                    ? 'bg-blue-50/80 border-blue-300 text-blue-800 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{activeDateLabel}</span>
                {(datePreset !== 'all' || customStartDate || customEndDate) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                )}
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    isDateDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Date Range Popover Panel */}
              {isDateDropdownOpen && (
                <div className="absolute left-0 lg:left-auto lg:right-0 mt-1.5 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 p-3.5 z-50 animate-in fade-in duration-100 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800">Date Range Filter</span>
                    {(datePreset !== 'all' || customStartDate || customEndDate) && (
                      <button
                        onClick={() => {
                          setDatePreset('all');
                          setCustomStartDate('');
                          setCustomEndDate('');
                        }}
                        className="text-[11px] text-rose-600 hover:underline font-semibold flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset</span>
                      </button>
                    )}
                  </div>

                  {/* Date Target Selector (Issue Date vs Due Date) */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Apply Filter To
                    </label>
                    <div className="flex bg-slate-100 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => setDateTarget('date')}
                        className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
                          dateTarget === 'date'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Issue Date
                      </button>
                      <button
                        type="button"
                        onClick={() => setDateTarget('dueDate')}
                        className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
                          dateTarget === 'dueDate'
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Due Date
                      </button>
                    </div>
                  </div>

                  {/* Presets Grid */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Quick Presets
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {DATE_PRESETS.map((p) => {
                        const isSelected = datePreset === p.id && !customStartDate && !customEndDate;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              handleDatePresetChange(p.id);
                              if (p.id !== 'custom') {
                                setIsDateDropdownOpen(false);
                              }
                            }}
                            className={`py-1.5 px-2 rounded-md text-[11px] font-medium border text-center transition-all ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600 font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {p.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Date Range Picker Inputs */}
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Custom Date Range
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">From</span>
                        <input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => {
                            setCustomStartDate(e.target.value);
                            setDatePreset('custom');
                          }}
                          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">To</span>
                        <input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => {
                            setCustomEndDate(e.target.value);
                            setDatePreset('custom');
                          }}
                          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setIsDateDropdownOpen(false)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      Apply Filter
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Client Filter Dropdown */}
            <div className="relative" ref={clientDropdownRef}>
              <button
                id="btn-client-filter-dropdown"
                type="button"
                onClick={() => {
                  setIsClientDropdownOpen(!isClientDropdownOpen);
                  setIsStatusDropdownOpen(false);
                  setIsDateDropdownOpen(false);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap ${
                  selectedClient !== 'all'
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-800 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="max-w-[140px] truncate">
                  {selectedClient === 'all' ? 'All Clients' : selectedClient}
                </span>
                {selectedClient !== 'all' && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-200/70 text-emerald-900 font-mono">
                    {enrichedClientOptions.find((c) => c.name === selectedClient)?.count || 0}
                  </span>
                )}
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                    isClientDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Client Popover Menu */}
              {isClientDropdownOpen && (
                <div className="absolute left-0 lg:left-auto lg:right-0 mt-1.5 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in duration-100 space-y-2">
                  <div className="px-2 py-1 flex items-center justify-between border-b border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Filter By Client
                    </span>
                    {selectedClient !== 'all' && (
                      <button
                        onClick={() => setSelectedClient('all')}
                        className="text-[10px] text-blue-600 hover:underline lowercase font-normal"
                      >
                        reset
                      </button>
                    )}
                  </div>

                  {/* Search inside Client Dropdown */}
                  <div className="relative px-1">
                    <Search className="w-3 h-3 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search clients..."
                      value={clientSearchTerm}
                      onChange={(e) => setClientSearchTerm(e.target.value)}
                      className="w-full pl-7 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                    />
                    {clientSearchTerm && (
                      <button
                        onClick={() => setClientSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Clients List */}
                  <div className="max-h-60 overflow-y-auto space-y-0.5 pr-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClient('all');
                        setIsClientDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                        selectedClient === 'all'
                          ? 'bg-blue-50 text-blue-900 font-bold'
                          : 'text-slate-700 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                          ALL
                        </div>
                        <span>All Clients</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400 font-mono">
                          ({invoices.length})
                        </span>
                        {selectedClient === 'all' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                    </button>

                    {filteredClientList.map((client) => {
                      const isSelected = selectedClient === client.name;
                      const initials = client.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase();

                      return (
                        <button
                          key={client.name}
                          type="button"
                          onClick={() => {
                            setSelectedClient(client.name);
                            setIsClientDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-900 font-bold'
                              : 'text-slate-700 hover:bg-slate-50 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                              {initials || '?'}
                            </div>
                            <div className="text-left min-w-0">
                              <div className="truncate font-semibold text-slate-800">
                                {client.name}
                              </div>
                              {client.email && (
                                <div className="truncate text-[10px] text-slate-400">
                                  {client.email}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600 font-mono">
                              {client.count} {client.count === 1 ? 'inv' : 'invs'}
                            </span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                          </div>
                        </button>
                      );
                    })}

                    {filteredClientList.length === 0 && (
                      <div className="py-4 text-center text-xs text-slate-400">
                        No clients found matching "{clientSearchTerm}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sort Dropdown & Toggle */}
            <div className="flex items-center gap-1.5 pl-1 border-l border-slate-200">
              <select
                id="invoice-sort-field-select"
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
                title="Sort field"
              >
                <option value="date">Sort: Issue Date</option>
                <option value="dueDate">Sort: Due Date</option>
                <option value="total">Sort: Amount</option>
                <option value="clientName">Sort: Client</option>
                <option value="invoiceNumber">Sort: Invoice #</option>
              </select>

              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 transition-colors"
                title={`Order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Status Tabs and Result Counter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-100">
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

          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-900">{filteredInvoices.length}</span> of {invoices.length} invoices
          </div>
        </div>

        {/* Active Filter Chips */}
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

            {(datePreset !== 'all' || customStartDate || customEndDate) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-medium text-[11px]">
                <span>
                  {dateTarget === 'date' ? 'Issued' : 'Due'}:{' '}
                  <strong>
                    {customStartDate || customEndDate
                      ? `${customStartDate || 'Any'} → ${customEndDate || 'Any'}`
                      : DATE_PRESETS.find((p) => p.id === datePreset)?.label || datePreset}
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

      {/* Invoices Data Table with Multi-Select Checkboxes */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-mono uppercase tracking-wider text-[10px]">
              <tr>
                {/* Select All Checkbox Column */}
                <th className="py-3.5 px-4 w-10 text-center">
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className="text-slate-500 hover:text-blue-600 transition-colors p-0.5"
                    title={isAllSelected ? 'Deselect all' : 'Select all'}
                  >
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-600 fill-blue-50" />
                    ) : isPartiallySelected ? (
                      <MinusSquare className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>

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
                  <td colSpan={8} className="py-14 text-center text-slate-400">
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
                filteredInvoices.map((inv) => {
                  const isSelected = selectedInvoiceIds.has(inv.id);

                  return (
                    <tr 
                      key={inv.id} 
                      className={`hover:bg-slate-50/80 transition-colors group ${
                        isSelected ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      {/* Selection Checkbox */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={(e) => handleToggleInvoice(inv.id, e)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600 fill-blue-50" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </button>
                      </td>

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
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                        {formatCurrencyAmount(inv.total, companyProfile.currencySymbol)}
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

                          {/* Edit Button — available for ALL statuses (including paid/converted) */}
                          <button
                            id={`btn-edit-${inv.id}`}
                            onClick={() => onEditInvoice(inv)}
                            title="Edit Invoice"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
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

                          {/* Mark as Paid Quick Action */}
                          {inv.status !== 'paid' && (
                            <button
                              id={`btn-mark-paid-${inv.id}`}
                              onClick={() => onMarkAsPaid(inv.id)}
                              title="Mark as Paid"
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Overflow Menu Toggle */}
                          <div className="relative">
                            <button
                              id={`btn-menu-${inv.id}`}
                              onClick={() => setActiveMenuId(activeMenuId === inv.id ? null : inv.id)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Dropdown Menu */}
                            {activeMenuId === inv.id && (
                              <div
                                className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-30 text-left animate-in fade-in duration-100"
                                onMouseLeave={() => setActiveMenuId(null)}
                              >
                                {onOpenPublicInvoice && (
                                  <button
                                    onClick={() => {
                                      onOpenPublicInvoice(inv);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full px-3.5 py-1.5 text-xs text-blue-700 hover:bg-blue-50 flex items-center gap-2"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Open Public Invoice View</span>
                                  </button>
                                )}

                                <button
                                  onClick={() => {
                                    const url = getPublicInvoicePaymentUrl(inv.payment_token || inv.paymentToken || '');
                                    navigator.clipboard.writeText(url);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Copy Public Pay Link</span>
                                </button>

                                <div className="my-1 border-t border-slate-100" />

                                <button
                                  onClick={() => {
                                    onDuplicateInvoice(inv);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Duplicate Invoice</span>
                                </button>

                                {onMakeRecurring && (
                                  <button
                                    onClick={() => {
                                      onMakeRecurring(inv);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    <Repeat className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Make Recurring Schedule</span>
                                  </button>
                                )}

                                <div className="my-1 border-t border-slate-100" />

                                <button
                                  onClick={() => {
                                    onDeleteInvoice(inv.id);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full px-3.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                  <span>Delete Invoice</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Financial Audit Export Center Modal */}
      {isAuditModalOpen && (
        <div 
          id="audit-export-modal-backdrop"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setIsAuditModalOpen(false)}
        >
          <div 
            id="audit-export-modal"
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                    <span>Financial Audit Export Center</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-normal">
                      CSV Engine
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Generate standardized CSV ledgers for accounting, bookkeeping, and tax compliance.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAuditModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto text-xs">
              {/* 1. Export Scope Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 font-mono uppercase mb-2">
                  1. Select Audit Dataset Scope
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setAuditExportScope('filtered')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      auditExportScope === 'filtered'
                        ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 text-emerald-950'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>Current Filtered</span>
                      <span className="font-mono text-emerald-700">{filteredInvoices.length}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Invoices matching current search, status, client, and date filters.
                    </div>
                  </button>

                  {selectedInvoiceIds.size > 0 && (
                    <button
                      type="button"
                      onClick={() => setAuditExportScope('selected')}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        auditExportScope === 'selected'
                          ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 text-emerald-950'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span>Selected Only</span>
                        <span className="font-mono text-blue-700">{selectedInvoiceIds.size}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Specifically checked invoices in the ledger table.
                      </div>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setAuditExportScope('all')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      auditExportScope === 'all'
                        ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 text-emerald-950'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>All Invoices</span>
                      <span className="font-mono text-slate-700">{invoices.length}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Complete unfiltered historical billing repository.
                    </div>
                  </button>
                </div>
              </div>

              {/* Scope Financial Metrics Preview */}
              {(() => {
                const targetList = 
                  auditExportScope === 'selected'
                    ? invoices.filter(i => selectedInvoiceIds.has(i.id))
                    : auditExportScope === 'all'
                    ? invoices
                    : filteredInvoices;

                const gross = targetList.reduce((acc, i) => acc + i.total, 0);
                const tax = targetList.reduce((acc, i) => acc + i.taxAmount, 0);
                const paid = targetList.filter(i => i.status === 'paid').reduce((acc, i) => acc + i.total, 0);
                const overdue = targetList.filter(i => i.status === 'overdue').reduce((acc, i) => acc + i.total, 0);

                return (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold uppercase font-mono">
                      <span>Audit Scope Financial Metrics ({targetList.length} Invoices)</span>
                      <span>Currency: {companyProfile.currency || 'USD'}</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                        <div className="text-[10px] text-slate-400 font-bold">GROSS BILLED</div>
                        <div className="font-mono font-black text-slate-900 text-sm mt-0.5">
                          {formatCurrencyAmount(gross, companyProfile.currencySymbol)}
                        </div>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                        <div className="text-[10px] text-slate-400 font-bold">TAX ACCRUAL</div>
                        <div className="font-mono font-black text-slate-700 text-sm mt-0.5">
                          {formatCurrencyAmount(tax, companyProfile.currencySymbol)}
                        </div>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                        <div className="text-[10px] text-emerald-600 font-bold">SETTLED (PAID)</div>
                        <div className="font-mono font-black text-emerald-700 text-sm mt-0.5">
                          {formatCurrencyAmount(paid, companyProfile.currencySymbol)}
                        </div>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                        <div className="text-[10px] text-rose-600 font-bold">OVERDUE / OUTSTANDING</div>
                        <div className="font-mono font-black text-rose-700 text-sm mt-0.5">
                          {formatCurrencyAmount(overdue, companyProfile.currencySymbol)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* 2. Format Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 font-mono uppercase mb-2">
                  2. Choose Audit Report Layout
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setAuditExportType('summary')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      auditExportType === 'summary'
                        ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>Audit Summary Ledger (CSV)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      1 row per invoice. Includes issue/due dates, payment aging, client contacts, subtotal, tax amount, total gross, and balance due.
                    </p>
                    <div className="mt-2 text-[10px] font-mono text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded inline-block">
                      Recommended for accountants & balance sheet reconciliation
                    </div>
                  </div>

                  <div
                    onClick={() => setAuditExportType('itemized')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      auditExportType === 'itemized'
                        ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <Layers className="w-4 h-4 text-blue-600" />
                      <span>Itemized Line-Item Ledger (CSV)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      1 row per line item. Includes invoice reference, item description, quantity, unit price, tax rate, and itemized line subtotal.
                    </p>
                    <div className="mt-2 text-[10px] font-mono text-blue-800 bg-blue-100/60 px-2 py-0.5 rounded inline-block">
                      Recommended for sales tax & inventory audits
                    </div>
                  </div>
                </div>
              </div>

              {/* Compliance & Standards Note */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-[11px] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  All CSV files include UTF-8 Byte Order Mark (BOM) for zero-loss compatibility with Microsoft Excel, Apple Numbers, LibreOffice, and Google Sheets.
                </span>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsAuditModalOpen(false)}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  const targetList = 
                    auditExportScope === 'selected'
                      ? invoices.filter(i => selectedInvoiceIds.has(i.id))
                      : auditExportScope === 'all'
                      ? invoices
                      : filteredInvoices;
                  handleExportAuditCSV(targetList, auditExportType);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-sm transition-all"
              >
                <Download className="w-4 h-4" />
                <span>
                  Download Audit CSV (
                  {auditExportScope === 'selected'
                    ? selectedInvoiceIds.size
                    : auditExportScope === 'all'
                    ? invoices.length
                    : filteredInvoices.length}{' '}
                  Invoices)
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Confirmation Toast Notification */}
      {exportToastMessage && (
        <div 
          id="export-toast-notification"
          className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Financial Audit Export Complete</div>
            <div className="text-[11px] text-slate-300">{exportToastMessage}</div>
          </div>
          <button
            type="button"
            onClick={() => setExportToastMessage(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
