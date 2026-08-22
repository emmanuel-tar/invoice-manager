import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  User, 
  Building2, 
  FileText, 
  DollarSign, 
  Calendar,
  X,
  Printer,
  ChevronDown,
  Layers
} from 'lucide-react';
import { PaymentRecord, PaymentMethod, Client, Invoice, CompanyProfile } from '../types';
import { formatCurrencyAmount } from '../data/currencies';

interface PaymentsViewProps {
  payments: PaymentRecord[];
  clients: Client[];
  invoices: Invoice[];
  companyProfile: CompanyProfile;
  onAddPayment: (payment: Omit<PaymentRecord, 'id' | 'paymentNumber'>) => void;
  onDeletePayment?: (id: string) => void;
  onViewReceipt?: (payment: PaymentRecord) => void;
  initialSubTab?: 'all' | 'by_client' | 'by_amount';
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  clients,
  invoices,
  companyProfile,
  onAddPayment,
  onDeletePayment,
  onViewReceipt,
  initialSubTab = 'all',
}) => {
  const [subTab, setSubTab] = useState<'all' | 'by_client' | 'by_amount'>(initialSubTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [amountRange, setAmountRange] = useState<'all' | 'high' | 'mid' | 'low'>('all');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formInvoiceId, setFormInvoiceId] = useState('');
  const [formClientId, setFormClientId] = useState('');
  const [formAmount, setFormAmount] = useState<number>(0);
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formMethod, setFormMethod] = useState<PaymentMethod>('bank_transfer');
  const [formRefNumber, setFormRefNumber] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Handle invoice auto-fill in Add Modal
  const handleInvoiceChange = (invId: string) => {
    setFormInvoiceId(invId);
    const inv = invoices.find((i) => i.id === invId);
    if (inv) {
      setFormAmount(inv.total);
      const client = clients.find((c) => c.name.toLowerCase() === inv.clientName.toLowerCase());
      if (client) setFormClientId(client.id);
    }
  };

  const handleCreatePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formAmount <= 0) return;

    const matchedInvoice = invoices.find((i) => i.id === formInvoiceId);
    const matchedClient = clients.find((c) => c.id === formClientId) || 
      (matchedInvoice ? clients.find((c) => c.name.toLowerCase() === matchedInvoice.clientName.toLowerCase()) : null);

    const clientName = matchedClient ? matchedClient.name : (matchedInvoice ? matchedInvoice.clientName : 'Direct Client');
    const clientEmail = matchedClient ? matchedClient.email : (matchedInvoice ? matchedInvoice.clientEmail : '');

    onAddPayment({
      invoiceId: formInvoiceId || 'direct-payment',
      invoiceNumber: matchedInvoice ? matchedInvoice.invoiceNumber : 'DIRECT-PAY',
      clientId: matchedClient ? matchedClient.id : 'client-misc',
      clientName,
      clientEmail,
      amount: formAmount,
      date: formDate,
      method: formMethod,
      referenceNumber: formRefNumber || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      status: 'completed',
      notes: formNotes,
    });

    setIsAddModalOpen(false);
    setFormAmount(0);
    setFormNotes('');
    setFormRefNumber('');
  };

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchSearch = 
        p.paymentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchMethod = selectedMethod === 'all' || p.method === selectedMethod;
      const matchStatus = selectedStatus === 'all' || p.status === selectedStatus;
      const matchClient = selectedClientId === 'all' || p.clientId === selectedClientId;

      let matchAmount = true;
      if (amountRange === 'high') matchAmount = p.amount >= 10000;
      if (amountRange === 'mid') matchAmount = p.amount >= 3000 && p.amount < 10000;
      if (amountRange === 'low') matchAmount = p.amount < 3000;

      return matchSearch && matchMethod && matchStatus && matchClient && matchAmount;
    });
  }, [payments, searchQuery, selectedMethod, selectedStatus, selectedClientId, amountRange]);

  // Grouped by Client
  const paymentsByClient = useMemo(() => {
    const map = new Map<string, { clientName: string; clientEmail: string; count: number; total: number; payments: PaymentRecord[] }>();
    payments.forEach((p) => {
      const key = p.clientId || p.clientName;
      if (!map.has(key)) {
        map.set(key, {
          clientName: p.clientName,
          clientEmail: p.clientEmail,
          count: 0,
          total: 0,
          payments: [],
        });
      }
      const entry = map.get(key)!;
      entry.count += 1;
      entry.total += p.amount;
      entry.payments.push(p);
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [payments]);

  // Grouped by Amount Tiers
  const amountTiers = useMemo(() => {
    const major = payments.filter((p) => p.amount >= 10000);
    const mid = payments.filter((p) => p.amount >= 3000 && p.amount < 10000);
    const small = payments.filter((p) => p.amount < 3000);
    return {
      major: { label: 'High Value (≥₦10,000 / $10,000+)', list: major, total: major.reduce((acc, p) => acc + p.amount, 0) },
      mid: { label: 'Standard Mid Tier (₦3,000 - ₦9,999)', list: mid, total: mid.reduce((acc, p) => acc + p.amount, 0) },
      small: { label: 'Micro & Small Settlements (<₦3,000)', list: small, total: small.reduce((acc, p) => acc + p.amount, 0) },
    };
  }, [payments]);

  const totalCollected = payments.reduce((acc, p) => acc + (p.status === 'completed' ? p.amount : 0), 0);
  const pendingCollection = payments.reduce((acc, p) => acc + (p.status === 'pending' ? p.amount : 0), 0);

  const getMethodBadge = (method: PaymentMethod) => {
    switch (method) {
      case 'bank_transfer':
        return <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-semibold">Bank Wire / NIP</span>;
      case 'credit_card':
        return <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[11px] font-semibold">Debit / Card</span>;
      case 'online':
        return <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold">Online Gateway</span>;
      case 'pos':
        return <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-semibold">POS Terminal</span>;
      case 'cash':
        return <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 text-[11px] font-semibold">Cash</span>;
      case 'cheque':
        return <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">Cheque</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-blue-600" />
            <span>Payments & Collections</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track, audit, and reconcile client settlements across wire transfers, cards, and POS.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Cleared Receipts</div>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {formatCurrencyAmount(totalCollected, companyProfile.currencySymbol)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled & credited
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">In-Transit / Pending</div>
          <div className="text-2xl font-black text-amber-600 mt-1 font-mono">
            {formatCurrencyAmount(pendingCollection, companyProfile.currencySymbol)}
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Awaiting bank confirmation
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Settlements</div>
          <div className="text-2xl font-black text-blue-600 mt-1 font-mono">
            {payments.length} Records
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Across all registered channels</div>
        </div>
      </div>

      {/* Subtabs Bar: All Payments | Payment by Client | Payment by Amount */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSubTab('all')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            subTab === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Payments ({payments.length})
        </button>

        <button
          onClick={() => setSubTab('by_client')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            subTab === 'by_client'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Payment by Client ({paymentsByClient.length})
        </button>

        <button
          onClick={() => setSubTab('by_amount')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            subTab === 'by_amount'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Payment by Amount (Tiered)
        </button>
      </div>

      {/* Subtab 1: All Payments */}
      {subTab === 'all' && (
        <div className="space-y-4">
          {/* Filter Toolbar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search payment #, client, reference..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto">
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
              >
                <option value="all">All Methods</option>
                <option value="bank_transfer">Bank Wire</option>
                <option value="credit_card">Card</option>
                <option value="online">Online</option>
                <option value="pos">POS</option>
                <option value="cash">Cash</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Payment #</th>
                    <th className="py-3.5 px-4">Client</th>
                    <th className="py-3.5 px-4">Invoice Ref</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Method</th>
                    <th className="py-3.5 px-4">Reference</th>
                    <th className="py-3.5 px-4 text-right">Amount</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        No payments found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                          {payment.paymentNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{payment.clientName}</div>
                          <div className="text-[11px] text-slate-400">{payment.clientEmail}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {payment.invoiceNumber}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{payment.date}</td>
                        <td className="py-3.5 px-4">{getMethodBadge(payment.method)}</td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                          {payment.referenceNumber}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                          {formatCurrencyAmount(payment.amount, companyProfile.currencySymbol)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              payment.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : payment.status === 'pending'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => onViewReceipt && onViewReceipt(payment)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 rounded-md text-[11px] font-semibold transition-colors"
                          >
                            Receipt
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Payment by Client */}
      {subTab === 'by_client' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentsByClient.map((group) => (
              <div key={group.clientName} className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-100">
                      {group.clientName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{group.clientName}</h4>
                      <p className="text-[11px] text-slate-400">{group.clientEmail}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                    {group.count} payments
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Cumulative Paid:</span>
                  <span className="text-base font-black font-mono text-emerald-600">
                    {formatCurrencyAmount(group.total, companyProfile.currencySymbol)}
                  </span>
                </div>

                <div className="space-y-1 pt-1">
                  {group.payments.slice(0, 3).map((p) => (
                    <div key={p.id} className="p-2 rounded-lg bg-slate-50 text-[11px] flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-mono text-slate-600">
                        <span>{p.paymentNumber}</span>
                        <span className="text-slate-400">({p.date})</span>
                      </div>
                      <div className="font-mono font-bold text-slate-800">
                        {formatCurrencyAmount(p.amount, companyProfile.currencySymbol)}
                      </div>
                    </div>
                  ))}
                  {group.payments.length > 3 && (
                    <div className="text-[10px] text-center text-slate-400 pt-1">
                      + {group.payments.length - 3} more transaction records
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 3: Payment by Amount (Tiered) */}
      {subTab === 'by_amount' && (
        <div className="space-y-6">
          {Object.entries(amountTiers).map(([tierKey, tier]) => (
            <div key={tierKey} className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{tier.label}</h3>
                  <p className="text-xs text-slate-500">{tier.list.length} transactions in this tier</p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Tier Subtotal</div>
                  <div className="text-base font-black font-mono text-blue-600">
                    {formatCurrencyAmount(tier.total, companyProfile.currencySymbol)}
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {tier.list.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No transactions recorded in this tier bracket.
                  </div>
                ) : (
                  tier.list.map((p) => (
                    <div key={p.id} className="p-3.5 hover:bg-slate-50/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="font-mono font-bold text-blue-600">{p.paymentNumber}</div>
                        <div>
                          <div className="font-semibold text-slate-900">{p.clientName}</div>
                          <div className="text-[10px] text-slate-400">
                            Inv: {p.invoiceNumber} • Ref: {p.referenceNumber} • Date: {p.date}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {getMethodBadge(p.method)}
                        <span className="font-mono font-black text-sm text-slate-900">
                          {formatCurrencyAmount(p.amount, companyProfile.currencySymbol)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Record Payment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Record Inbound Payment</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePaymentSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Invoice (Optional)</label>
                <select
                  value={formInvoiceId}
                  onChange={(e) => handleInvoiceChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">-- Direct Payment (No Invoice Linked) --</option>
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} - {inv.clientName} ({formatCurrencyAmount(inv.total, companyProfile.currencySymbol)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Client Entity</label>
                <select
                  value={formClientId}
                  onChange={(e) => setFormClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">-- Select Client --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Amount Received ({companyProfile.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formAmount || ''}
                    onChange={(e) => setFormAmount(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="bank_transfer">Bank Wire / NIP</option>
                    <option value="credit_card">Debit / Credit Card</option>
                    <option value="online">Online Portal</option>
                    <option value="pos">POS Terminal</option>
                    <option value="cash">Cash Settlement</option>
                    <option value="cheque">Bank Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bank Reference / NIP Ref</label>
                  <input
                    type="text"
                    value={formRefNumber}
                    onChange={(e) => setFormRefNumber(e.target.value)}
                    placeholder="e.g. ZEN-NIP-99824"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Audit Notes / Directives</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Optional memo or bank branch remarks..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-semibold shadow-sm"
                >
                  Confirm & Reconcile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
