import React, { useState, useMemo } from 'react';
import { 
  FileMinus, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  Calendar, 
  DollarSign, 
  FileText, 
  X, 
  ArrowDownLeft, 
  ShieldAlert, 
  Eye, 
  Trash2,
  RefreshCw,
  CreditCard
} from 'lucide-react';
import { CreditNote, CreditNoteStatus, CreditReason, Client, Invoice, LineItem } from '../types';
import { formatCurrencyAmount } from '../data/currencies';

interface CreditNotesViewProps {
  creditNotes: CreditNote[];
  invoices: Invoice[];
  clients: Client[];
  onAddCreditNote: (note: CreditNote) => void;
  onUpdateCreditNote: (note: CreditNote) => void;
  onDeleteCreditNote: (id: string) => void;
  currencyCode: string;
  currencySymbol: string;
  initialCreateOpen?: boolean;
}

const CREDIT_REASONS: CreditReason[] = [
  'Damaged / Defective Goods',
  'Pricing Error / Overbilled',
  'Order Cancellation / Return',
  'Post-Sale Discount / Rebate',
  'Service Quality Issue',
  'Other',
];

export const CreditNotesView: React.FC<CreditNotesViewProps> = ({
  creditNotes,
  invoices,
  clients,
  onAddCreditNote,
  onUpdateCreditNote,
  onDeleteCreditNote,
  currencyCode,
  currencySymbol,
  initialCreateOpen = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reasonFilter, setReasonFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(initialCreateOpen);
  const [selectedNoteForView, setSelectedNoteForView] = useState<CreditNote | null>(null);

  // Form State
  const [originalInvoiceNumber, setOriginalInvoiceNumber] = useState('');
  const [clientName, setClientName] = useState(clients[0]?.name || '');
  const [clientEmail, setClientEmail] = useState(clients[0]?.email || '');
  const [clientAddress, setClientAddress] = useState(clients[0]?.address || '');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState<CreditReason>('Pricing Error / Overbilled');
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState<LineItem[]>([
    {
      id: 'cni-1',
      description: 'Credit Adjustment for Overbilling / Item Return',
      qty: 1,
      unitPrice: 150.0,
      taxRate: 7.5,
      total: 161.25,
    }
  ]);

  const handleInvoiceSelect = (invNum: string) => {
    setOriginalInvoiceNumber(invNum);
    const foundInv = invoices.find(i => i.invoiceNumber === invNum);
    if (foundInv) {
      setClientName(foundInv.clientName);
      setClientEmail(foundInv.clientEmail || '');
      setClientAddress(foundInv.clientAddress || '');
      if (foundInv.items && foundInv.items.length > 0) {
        setItems(foundInv.items.map(item => ({
          ...item,
          id: `cni-${Date.now()}-${Math.random()}`,
        })));
      }
    }
  };

  const handleClientChange = (name: string) => {
    setClientName(name);
    const found = clients.find(c => c.name === name);
    if (found) {
      setClientEmail(found.email);
      setClientAddress(found.address);
    }
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `cni-${Date.now()}`,
        description: '',
        qty: 1,
        unitPrice: 0,
        taxRate: 7.5,
        total: 0,
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...items];
    const current = { ...updated[index], [field]: value };
    const qty = Number(current.qty) || 0;
    const unitPrice = Number(current.unitPrice) || 0;
    const taxRate = Number(current.taxRate) || 0;
    const itemSubtotal = qty * unitPrice;
    const itemTax = (itemSubtotal * taxRate) / 100;
    current.total = itemSubtotal + itemTax;
    updated[index] = current;
    setItems(updated);
  };

  // Totals calculations
  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + (Number(item.qty) || 0) * (Number(item.unitPrice) || 0), 0);
  }, [items]);

  const taxAmount = useMemo(() => {
    return items.reduce((acc, item) => {
      const lineSubtotal = (Number(item.qty) || 0) * (Number(item.unitPrice) || 0);
      return acc + (lineSubtotal * (Number(item.taxRate) || 0)) / 100;
    }, 0);
  }, [items]);

  const totalAmount = subtotal + taxAmount;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newNumber = `CN-2026-${String(creditNotes.length + 1).padStart(3, '0')}`;
    const newCreditNote: CreditNote = {
      id: `cn-${Date.now()}`,
      creditNoteNumber: newNumber,
      originalInvoiceNumber: originalInvoiceNumber || 'INV-DIRECT',
      clientName,
      clientEmail,
      clientAddress,
      issueDate,
      reason,
      items,
      subtotal,
      taxAmount,
      totalAmount,
      remainingCredit: totalAmount,
      status: 'issued',
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onAddCreditNote(newCreditNote);
    setIsCreateModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setOriginalInvoiceNumber('');
    setClientName(clients[0]?.name || '');
    setClientEmail(clients[0]?.email || '');
    setClientAddress(clients[0]?.address || '');
    setIssueDate(new Date().toISOString().split('T')[0]);
    setReason('Pricing Error / Overbilled');
    setNotes('');
    setItems([
      {
        id: 'cni-1',
        description: 'Credit Adjustment for Overbilling / Item Return',
        qty: 1,
        unitPrice: 150.0,
        taxRate: 7.5,
        total: 161.25,
      }
    ]);
  };

  const filteredNotes = useMemo(() => {
    return creditNotes.filter(cn => {
      const matchesSearch = 
        cn.creditNoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cn.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cn.originalInvoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cn.reason.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || cn.status === statusFilter;
      const matchesReason = reasonFilter === 'all' || cn.reason === reasonFilter;

      return matchesSearch && matchesStatus && matchesReason;
    });
  }, [creditNotes, searchTerm, statusFilter, reasonFilter]);

  const totalCreditIssued = useMemo(() => {
    return creditNotes.reduce((acc, c) => acc + (c.status !== 'void' ? c.totalAmount : 0), 0);
  }, [creditNotes]);

  const totalCreditAvailable = useMemo(() => {
    return creditNotes.reduce((acc, c) => acc + (c.status === 'issued' ? c.remainingCredit : 0), 0);
  }, [creditNotes]);

  const handleApplyToInvoice = (cn: CreditNote) => {
    const updated: CreditNote = {
      ...cn,
      status: 'applied',
      remainingCredit: 0,
      appliedToInvoiceId: cn.originalInvoiceNumber,
    };
    onUpdateCreditNote(updated);
    if (selectedNoteForView?.id === cn.id) {
      setSelectedNoteForView(updated);
    }
  };

  const handleMarkRefunded = (cn: CreditNote) => {
    const updated: CreditNote = {
      ...cn,
      status: 'refunded',
      remainingCredit: 0,
    };
    onUpdateCreditNote(updated);
    if (selectedNoteForView?.id === cn.id) {
      setSelectedNoteForView(updated);
    }
  };

  const getStatusBadge = (status: CreditNoteStatus) => {
    switch (status) {
      case 'issued':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Issued (Open Credit)
          </span>
        );
      case 'applied':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <ArrowDownLeft className="w-3.5 h-3.5" /> Applied to Invoice
          </span>
        );
      case 'refunded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <CreditCard className="w-3.5 h-3.5" /> Refunded to Client
          </span>
        );
      case 'void':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <AlertCircle className="w-3.5 h-3.5" /> Void / Cancelled
          </span>
        );
    }
  };

  return (
    <div id="credit-notes-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <FileMinus className="w-7 h-7 text-rose-400" />
            Credit Notes & Adjustments
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Issue formal customer credit notes for billing adjustments, goods returns, and post-sale discounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="create-credit-note-btn"
            onClick={() => {
              resetForm();
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-rose-600/20"
          >
            <Plus className="w-4 h-4" />
            Create Credit Note
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Credit Notes</span>
            <FileText className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-2">{creditNotes.length}</p>
          <span className="text-xs text-slate-500 mt-1 block">Adjustments recorded</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-400">Total Credit Amount</span>
            <DollarSign className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-300 mt-2">
            {formatCurrencyAmount(totalCreditIssued, currencyCode)}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Cumulative credits issued</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-400">Available Open Balance</span>
            <ArrowDownLeft className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-300 mt-2">
            {formatCurrencyAmount(totalCreditAvailable, currencyCode)}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Unallocated customer credit</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-400">Applied / Settled</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-300 mt-2">
            {creditNotes.filter(cn => cn.status === 'applied' || cn.status === 'refunded').length}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Fully reconciled notes</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="search-credit-notes"
            type="text"
            placeholder="Search note #, client, invoice #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {(['all', 'issued', 'applied', 'refunded', 'void'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'all' ? 'All Statuses' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Credit Notes Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Credit Note #</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Ref Invoice</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4">Issue Date</th>
                <th className="py-3.5 px-4 text-right">Credit Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredNotes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-500">
                    <FileMinus className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                    <p className="text-base font-medium text-slate-400">No credit notes found</p>
                    <p className="text-xs text-slate-500 mt-1">Create a credit note for refunds, discounts, or invoice adjustments.</p>
                  </td>
                </tr>
              ) : (
                filteredNotes.map((cn) => (
                  <tr key={cn.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-rose-300">
                      {cn.creditNoteNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-200">{cn.clientName}</div>
                      <div className="text-xs text-slate-500">{cn.clientEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-indigo-400">
                      {cn.originalInvoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-300 max-w-xs truncate">
                      {cn.reason}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {cn.issueDate}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-rose-400">
                      {formatCurrencyAmount(cn.totalAmount, currencyCode)}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(cn.status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedNoteForView(cn)}
                          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                          title="View / Print Credit Note"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {cn.status === 'issued' && (
                          <>
                            <button
                              onClick={() => handleApplyToInvoice(cn)}
                              className="p-1.5 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
                              title="Apply to Invoice Balance"
                            >
                              <ArrowDownLeft className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleMarkRefunded(cn)}
                              className="p-1.5 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-colors"
                              title="Mark as Paid Refund"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => onDeleteCreditNote(cn.id)}
                          className="p-1.5 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors"
                          title="Delete"
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

      {/* Create Credit Note Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileMinus className="w-5 h-5 text-rose-400" />
                <h3 className="text-lg font-semibold text-slate-100">Create New Credit Note</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Link to Invoice */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Original Invoice (Optional)</label>
                  <select
                    value={originalInvoiceNumber}
                    onChange={(e) => handleInvoiceSelect(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                  >
                    <option value="">-- Direct Credit (No Invoice) --</option>
                    {invoices.map(inv => (
                      <option key={inv.id} value={inv.invoiceNumber}>
                        {inv.invoiceNumber} — {inv.clientName} ({formatCurrencyAmount(inv.total, currencyCode)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Client Selection */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Client</label>
                  <select
                    value={clientName}
                    onChange={(e) => handleClientChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                    required
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Reason for Credit</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value as CreditReason)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                    required
                  >
                    {CREDIT_REASONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                {/* Issue Date */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Issue Date</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                    required
                  />
                </div>
              </div>

              {/* Items Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-slate-200">Credited Items / Adjustments</h4>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Credited Item
                  </button>
                </div>

                <div className="space-y-2.5">
                  {items.map((item, idx) => (
                    <div key={item.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-12 gap-2.5 items-center">
                      <div className="col-span-5">
                        <label className="text-[10px] text-slate-500 block mb-0.5">Description</label>
                        <input
                          type="text"
                          placeholder="Credited item description"
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-500 block mb-0.5">Qty</label>
                        <input
                          type="number"
                          placeholder="Qty"
                          value={item.qty}
                          min="1"
                          onChange={(e) => handleItemChange(idx, 'qty', parseInt(e.target.value) || 1)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-500 block mb-0.5">Rate ({currencySymbol})</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Unit Price"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                          required
                        />
                      </div>
                      <div className="col-span-2 text-right">
                        <label className="text-[10px] text-slate-500 block mb-0.5">Total</label>
                        <span className="text-xs font-semibold text-rose-400">
                          {formatCurrencyAmount(item.total, currencyCode)}
                        </span>
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 hover:bg-rose-500/20 text-rose-400 rounded transition-colors mt-3"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Summary */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal Credit:</span>
                  <span className="text-slate-200 font-medium">{formatCurrencyAmount(subtotal, currencyCode)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tax Credit Amount:</span>
                  <span className="text-slate-200 font-medium">{formatCurrencyAmount(taxAmount, currencyCode)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-rose-400 pt-2 border-t border-slate-800">
                  <span>Total Credit Note Value:</span>
                  <span>{formatCurrencyAmount(totalAmount, currencyCode)}</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Adjustment Remarks / Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Reason for granting credit, agreed commercial terms..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-rose-600/20"
                >
                  Save & Issue Credit Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View / Print Credit Note Slip Modal */}
      {selectedNoteForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl flex flex-col shadow-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileMinus className="w-5 h-5 text-rose-400" />
                <h3 className="text-lg font-semibold text-slate-100">
                  Credit Note Voucher — {selectedNoteForView.creditNoteNumber}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Voucher
                </button>
                <button
                  onClick={() => setSelectedNoteForView(null)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Credit Note Document */}
            <div className="p-8 bg-slate-950 text-slate-200 space-y-6 text-sm">
              <div className="flex justify-between items-start border-b border-slate-800 pb-6">
                <div>
                  <h2 className="text-2xl font-bold text-rose-400 tracking-tight">CREDIT NOTE</h2>
                  <p className="text-xs text-slate-400 mt-1">Official adjustment voucher and credit balance advice</p>
                  <div className="mt-3 text-xs text-slate-300">
                    <p>Reason: <strong className="text-rose-300">{selectedNoteForView.reason}</strong></p>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="text-base font-mono font-bold text-rose-300">{selectedNoteForView.creditNoteNumber}</div>
                  <div className="text-xs text-slate-400">Date: {selectedNoteForView.issueDate}</div>
                  <div className="text-xs text-slate-400">Original Inv: <span className="font-mono text-indigo-300">{selectedNoteForView.originalInvoiceNumber}</span></div>
                  <div className="pt-2">{getStatusBadge(selectedNoteForView.status)}</div>
                </div>
              </div>

              {/* Client and Account Info */}
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Credited Client</span>
                <div className="mt-2 text-sm font-semibold text-slate-100">{selectedNoteForView.clientName}</div>
                <div className="text-xs text-slate-400 mt-1">{selectedNoteForView.clientEmail}</div>
                <div className="text-xs text-slate-400 mt-0.5">{selectedNoteForView.clientAddress}</div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-medium">
                    <tr>
                      <th className="py-2.5 px-4">Item / Service Description</th>
                      <th className="py-2.5 px-4 text-center">Qty</th>
                      <th className="py-2.5 px-4 text-right">Unit Rate</th>
                      <th className="py-2.5 px-4 text-right">Credited Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {selectedNoteForView.items.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-900/40">
                        <td className="py-3 px-4 font-medium text-slate-200">{item.description}</td>
                        <td className="py-3 px-4 text-center text-slate-300">{item.qty}</td>
                        <td className="py-3 px-4 text-right text-slate-300">{formatCurrencyAmount(item.unitPrice, currencyCode)}</td>
                        <td className="py-3 px-4 text-right font-bold text-rose-400">{formatCurrencyAmount(item.total, currencyCode)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Section */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span className="text-slate-200">{formatCurrencyAmount(selectedNoteForView.subtotal, currencyCode)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Tax Adjustment:</span>
                    <span className="text-slate-200">{formatCurrencyAmount(selectedNoteForView.taxAmount, currencyCode)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-rose-400 pt-2 border-t border-slate-800">
                    <span>Total Credited:</span>
                    <span>{formatCurrencyAmount(selectedNoteForView.totalAmount, currencyCode)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 pt-1">
                    <span>Remaining Credit:</span>
                    <span className="font-semibold text-emerald-400">{formatCurrencyAmount(selectedNoteForView.remainingCredit, currencyCode)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedNoteForView.notes && (
                <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg text-xs text-slate-400">
                  <strong className="text-slate-300">Adjustment Note:</strong> {selectedNoteForView.notes}
                </div>
              )}

              {/* Authorization */}
              <div className="pt-4 border-t border-slate-800 flex justify-between items-end text-xs text-slate-500">
                <div>
                  <p>Authorized Financial Officer Signature</p>
                  <p className="font-serif italic text-slate-300 mt-2 text-sm">Finance & Billing Controller</p>
                </div>
                <div className="text-right">
                  <p>Electronically generated credit advice.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
