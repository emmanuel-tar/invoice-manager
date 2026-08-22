import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Search, 
  Filter, 
  ArrowLeft, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  DollarSign, 
  ExternalLink,
  ChevronRight,
  FileSpreadsheet,
  Receipt
} from 'lucide-react';
import { Client, Invoice, CompanyProfile } from '../types';
import { PaymentPortalModal } from './PaymentPortalModal';
import { InvoicePrintPreviewModal } from './InvoicePrintPreviewModal';

interface ClientPortalViewProps {
  client: Client;
  invoices: Invoice[];
  companyProfile: CompanyProfile;
  onPayInvoice: (invoice: Invoice) => void;
  onExitPreview?: () => void;
  isDirectPortalMode?: boolean;
}

export const ClientPortalView: React.FC<ClientPortalViewProps> = ({
  client,
  invoices,
  companyProfile,
  onPayInvoice,
  onExitPreview,
  isDirectPortalMode = false,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<Invoice | null>(null);
  const [activePaymentInvoice, setActivePaymentInvoice] = useState<Invoice | null>(null);

  // Filter invoices strictly for this client
  const clientInvoices = useMemo(() => {
    return invoices.filter(
      (inv) =>
        inv.clientName.toLowerCase() === client.name.toLowerCase() ||
        inv.clientEmail.toLowerCase() === client.email.toLowerCase()
    );
  }, [invoices, client]);

  // Derived financial metrics
  const totalInvoiced = useMemo(() => {
    return clientInvoices.reduce((sum, inv) => sum + inv.total, 0);
  }, [clientInvoices]);

  const totalPaid = useMemo(() => {
    return clientInvoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);
  }, [clientInvoices]);

  const unpaidInvoices = useMemo(() => {
    return clientInvoices.filter((inv) => inv.status === 'pending' || inv.status === 'overdue');
  }, [clientInvoices]);

  const currentOutstanding = useMemo(() => {
    return unpaidInvoices.reduce((sum, inv) => sum + inv.total, 0);
  }, [unpaidInvoices]);

  // Filtered list based on search and status
  const displayedInvoices = useMemo(() => {
    return clientInvoices.filter((inv) => {
      const matchesStatus =
        filterStatus === 'all'
          ? true
          : filterStatus === 'unpaid'
          ? inv.status === 'pending' || inv.status === 'overdue'
          : inv.status === 'paid';

      const query = searchQuery.toLowerCase();
      const matchesQuery =
        inv.invoiceNumber.toLowerCase().includes(query) ||
        inv.items.some((i) => i.description.toLowerCase().includes(query)) ||
        (inv.notes && inv.notes.toLowerCase().includes(query));

      return matchesStatus && matchesQuery;
    });
  }, [clientInvoices, filterStatus, searchQuery]);

  // Export Statement of Account as CSV
  const handleExportStatementCSV = () => {
    const headers = ['Invoice Number', 'Issue Date', 'Due Date', 'Status', 'Total ($)', 'Notes'];
    const rows = clientInvoices.map((inv) => [
      inv.invoiceNumber,
      inv.date,
      inv.dueDate,
      inv.status.toUpperCase(),
      inv.total.toFixed(2),
      `"${(inv.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [`# Statement of Account for ${client.name}`, `Generated: ${new Date().toLocaleDateString()}`, '']
        .concat([headers.join(',')])
        .concat(rows.map((r) => r.join(',')))
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Statement_${client.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 font-sans pb-16">
      {/* Top Banner & Security Bar */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-sm tracking-wider">
              {companyProfile.name.slice(0, 2).toUpperCase() || 'IP'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white tracking-tight">{companyProfile.name}</span>
                <span className="px-1.5 py-0.2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-[10px] font-mono uppercase">
                  Client Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Statement of Account & Self-Service Invoicing</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-Bit SSL Encrypted</span>
            </div>

            {onExitPreview && (
              <button
                onClick={onExitPreview}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
                title="Return to management console"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Exit Preview</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Client Welcome & Identity Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow-sm shrink-0">
              {client.logo || client.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{client.name}</h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    currentOutstanding === 0
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {currentOutstanding === 0 ? 'Account Current' : 'Balance Outstanding'}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{client.email}</span>
                </span>
                {client.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{client.phone}</span>
                  </span>
                )}
                {client.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate max-w-[280px]">{client.address}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportStatementCSV}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors border border-slate-200"
            >
              <FileSpreadsheet className="w-4 h-4 text-slate-500" />
              <span>Export Statement</span>
            </button>

            {unpaidInvoices.length > 0 && (
              <button
                onClick={() => setActivePaymentInvoice(unpaidInvoices[0])}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay Open Invoices (${currentOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })})</span>
              </button>
            )}
          </div>
        </div>

        {/* Financial KPI Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Outstanding Balance */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs relative overflow-hidden">
            <div className="text-[11px] font-bold text-slate-500 font-mono uppercase tracking-wider">
              Current Outstanding Balance
            </div>
            <div
              className={`text-3xl font-black font-mono-data mt-2 ${
                currentOutstanding > 0 ? 'text-amber-600' : 'text-emerald-600'
              }`}
            >
              ${currentOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              {currentOutstanding > 0 ? (
                <>
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{unpaidInvoices.length} unpaid {unpaidInvoices.length === 1 ? 'invoice' : 'invoices'} pending</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>All issued invoices have been settled</span>
                </>
              )}
            </div>
          </div>

          {/* Total Paid Lifetime */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="text-[11px] font-bold text-emerald-600 font-mono uppercase tracking-wider">
              Total Paid to Date
            </div>
            <div className="text-3xl font-black text-slate-900 font-mono-data mt-2">
              ${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {clientInvoices.filter((i) => i.status === 'paid').length} settled payments
            </div>
          </div>

          {/* Total Lifetime Billed */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="text-[11px] font-bold text-slate-600 font-mono uppercase tracking-wider">
              Total Lifetime Billed
            </div>
            <div className="text-3xl font-black text-slate-900 font-mono-data mt-2">
              ${totalInvoiced.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {clientInvoices.length} total invoice records
            </div>
          </div>
        </div>

        {/* Invoices Ledger Section */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Section Header with Tabs & Search */}
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterStatus === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Invoices ({clientInvoices.length})
              </button>
              <button
                onClick={() => setFilterStatus('unpaid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterStatus === 'unpaid'
                    ? 'bg-white text-amber-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Unpaid / Open ({unpaidInvoices.length})
              </button>
              <button
                onClick={() => setFilterStatus('paid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterStatus === 'paid'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Paid ({clientInvoices.filter((i) => i.status === 'paid').length})
              </button>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search invoices or items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Invoices List / Table */}
          {displayedInvoices.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <FileText className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">No invoices match your current filter</p>
              <p className="text-xs text-slate-400">All recent invoices issued to this account will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 font-mono text-[11px] text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-5 font-bold">Invoice #</th>
                    <th className="py-3.5 px-4 font-bold">Date Issued</th>
                    <th className="py-3.5 px-4 font-bold">Due Date</th>
                    <th className="py-3.5 px-4 font-bold">Status</th>
                    <th className="py-3.5 px-4 font-bold text-right">Amount</th>
                    <th className="py-3.5 px-5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedInvoices.map((inv) => {
                    const isUnpaid = inv.status === 'pending' || inv.status === 'overdue';
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="py-4 px-5 font-mono font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span>{inv.invoiceNumber}</span>
                            {inv.estimateRef && (
                              <span className="text-[10px] text-slate-400 font-normal">
                                (Ref: {inv.estimateRef})
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-sans mt-0.5 truncate max-w-xs">
                            {inv.items.map((it) => it.description).join(', ')}
                          </div>
                        </td>

                        <td className="py-4 px-4 font-mono text-slate-600">
                          {inv.date}
                        </td>

                        <td className="py-4 px-4 font-mono text-slate-600">
                          {inv.dueDate}
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                              inv.status === 'paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : inv.status === 'overdue'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {inv.status === 'paid' && <CheckCircle2 className="w-3 h-3" />}
                            {inv.status === 'overdue' && <AlertCircle className="w-3 h-3" />}
                            {inv.status === 'pending' && <Clock className="w-3 h-3" />}
                            <span>{inv.status}</span>
                          </span>
                        </td>

                        <td className="py-4 px-4 text-right font-mono font-black text-slate-900 text-sm">
                          ${inv.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>

                        <td className="py-4 px-5 text-right space-x-2">
                          <button
                            onClick={() => setSelectedInvoiceForPrint(inv)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors inline-flex items-center gap-1"
                            title="View and print invoice breakdown"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>

                          {isUnpaid && (
                            <button
                              onClick={() => setActivePaymentInvoice(inv)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-lg text-xs transition-colors inline-flex items-center gap-1 shadow-xs"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Pay Now</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Company Contact & Banking Information Footer */}
        <div className="bg-slate-900 text-slate-300 rounded-2xl p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div>
            <div className="text-white font-bold text-sm mb-1">{companyProfile.name}</div>
            <p className="text-slate-400 leading-relaxed whitespace-pre-line">{companyProfile.address}</p>
            {companyProfile.taxId && (
              <p className="text-slate-400 font-mono mt-2">Tax / VAT ID: {companyProfile.taxId}</p>
            )}
          </div>

          <div>
            <div className="text-white font-bold text-sm mb-1">Direct Banking Information</div>
            <p className="text-slate-400">Bank: <span className="text-white font-semibold">{companyProfile.bankName || 'Chase Bank NA'}</span></p>
            <p className="text-slate-400 font-mono mt-0.5">Account: <span className="text-white">{companyProfile.accountNumber || '•••• •••• 6789'}</span></p>
            <p className="text-[11px] text-slate-500 mt-2">
              For wire transfers, please include your Invoice Number in the reference memo.
            </p>
          </div>

          <div>
            <div className="text-white font-bold text-sm mb-1">Billing Questions?</div>
            <p className="text-slate-400">
              Need clarification on any charges? Reach out directly:
            </p>
            <p className="text-blue-400 font-semibold mt-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{companyProfile.phone || 'billing@invoicepro.app'}</span>
            </p>
          </div>
        </div>
      </main>

      {/* Invoice Details & Printable View Modal */}
      <InvoicePrintPreviewModal
        document={selectedInvoiceForPrint}
        type="invoice"
        companyProfile={companyProfile}
        isOpen={Boolean(selectedInvoiceForPrint)}
        onClose={() => setSelectedInvoiceForPrint(null)}
      />

      {/* Direct Payment Modal for this client */}
      <PaymentPortalModal
        invoice={activePaymentInvoice}
        companyProfile={companyProfile}
        isOpen={Boolean(activePaymentInvoice)}
        onClose={() => setActivePaymentInvoice(null)}
        onPaymentSuccess={(invoiceId, amount) => {
          if (activePaymentInvoice) {
            onPayInvoice(activePaymentInvoice);
          }
          setActivePaymentInvoice(null);
        }}
      />
    </div>
  );
};
