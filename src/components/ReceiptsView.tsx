import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  Printer, 
  Download, 
  CheckCircle2, 
  X, 
  Building2, 
  FileText, 
  Calendar, 
  User, 
  CreditCard,
  Sparkles,
  Share2
} from 'lucide-react';
import { ReceiptRecord, CompanyProfile, PaymentMethod } from '../types';
import { formatCurrencyAmount } from '../data/currencies';

interface ReceiptsViewProps {
  receipts: ReceiptRecord[];
  companyProfile: CompanyProfile;
  onAddReceipt: (receipt: Omit<ReceiptRecord, 'id' | 'receiptNumber'>) => void;
  onDeleteReceipt?: (id: string) => void;
}

export const ReceiptsView: React.FC<ReceiptsViewProps> = ({
  receipts,
  companyProfile,
  onAddReceipt,
  onDeleteReceipt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptRecord | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State
  const [formClientName, setFormClientName] = useState('');
  const [formClientEmail, setFormClientEmail] = useState('');
  const [formInvoiceNumber, setFormInvoiceNumber] = useState('');
  const [formAmount, setFormAmount] = useState<number>(0);
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formMethod, setFormMethod] = useState<PaymentMethod>('bank_transfer');
  const [formRefNumber, setFormRefNumber] = useState('');
  const [formIssuedBy, setFormIssuedBy] = useState('Finance Desk');
  const [formNotes, setFormNotes] = useState('');

  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      return (
        r.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.invoiceNumber && r.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        r.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [receipts, searchQuery]);

  const totalReceiptsAmount = receipts.reduce((acc, r) => acc + r.amount, 0);

  const handleCreateReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClientName || formAmount <= 0) return;

    onAddReceipt({
      clientName: formClientName,
      clientEmail: formClientEmail,
      invoiceNumber: formInvoiceNumber || undefined,
      amount: formAmount,
      date: formDate,
      paymentMethod: formMethod,
      referenceNumber: formRefNumber || `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      issuedBy: formIssuedBy,
      notes: formNotes,
    });

    setIsCreateModalOpen(false);
    setFormClientName('');
    setFormClientEmail('');
    setFormAmount(0);
    setFormNotes('');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-blue-600" />
            <span>Official Receipts</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate, issue, and print tamper-evident payment receipts for client records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Issue New Receipt</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Value Acknowledged</div>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {formatCurrencyAmount(totalReceiptsAmount, companyProfile.currencySymbol)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Fully certified ledger records
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Issued Receipts</div>
          <div className="text-2xl font-black text-blue-600 mt-1 font-mono">
            {receipts.length} Documents
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Unique audit series</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Issuing Authority</div>
          <div className="text-base font-bold text-slate-900 mt-1 truncate">
            {companyProfile.name}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
            Tax ID: {companyProfile.taxId}
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search receipt #, client, invoice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Receipts List */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Receipt #</th>
                <th className="py-3.5 px-4">Client Name</th>
                <th className="py-3.5 px-4">Invoice Ref</th>
                <th className="py-3.5 px-4">Payment Date</th>
                <th className="py-3.5 px-4">Method / Ref</th>
                <th className="py-3.5 px-4">Issued By</th>
                <th className="py-3.5 px-4 text-right">Amount Paid</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No receipts recorded matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      {r.receiptNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{r.clientName}</div>
                      <div className="text-[11px] text-slate-400">{r.clientEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {r.invoiceNumber || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{r.date}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 capitalize">
                        {r.paymentMethod.replace('_', ' ')}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">{r.referenceNumber}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{r.issuedBy}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                      {formatCurrencyAmount(r.amount, companyProfile.currencySymbol)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedReceipt(r)}
                        className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>View / Print</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt View & Print Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            {/* Modal Controls */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 print:hidden">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Official Payment Voucher</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Card */}
            <div className="p-5 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 space-y-4">
              <div className="text-center border-b border-slate-200 pb-3">
                <div className="font-black text-lg text-slate-900">{companyProfile.name}</div>
                <div className="text-[11px] text-slate-500">{companyProfile.address}</div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">Tax ID: {companyProfile.taxId}</div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Receipt Number</div>
                  <div className="font-mono font-bold text-blue-600">{selectedReceipt.receiptNumber}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Date Issued</div>
                  <div className="font-medium text-slate-700">{selectedReceipt.date}</div>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Received From:</span>
                  <span className="font-bold text-slate-900">{selectedReceipt.clientName}</span>
                </div>
                {selectedReceipt.invoiceNumber && (
                  <div className="flex justify-between font-mono">
                    <span className="text-slate-500">Invoice Ref:</span>
                    <span className="font-semibold text-slate-800">{selectedReceipt.invoiceNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Channel:</span>
                  <span className="font-semibold text-slate-800 capitalize">{selectedReceipt.paymentMethod.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">Transaction Ref:</span>
                  <span className="text-slate-700">{selectedReceipt.referenceNumber}</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50/80 rounded-lg border border-blue-200 text-center">
                <div className="text-[10px] uppercase font-bold text-blue-600">Amount Paid</div>
                <div className="text-2xl font-black text-blue-900 font-mono mt-0.5">
                  {formatCurrencyAmount(selectedReceipt.amount, companyProfile.currencySymbol)}
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-1 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Fully Cleared & Reconciled
                </div>
              </div>

              {selectedReceipt.notes && (
                <div className="text-[11px] text-slate-500 italic bg-white p-2.5 rounded border border-slate-200">
                  "{selectedReceipt.notes}"
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 text-center text-[10px] text-slate-400">
                Authorized By: <span className="font-semibold text-slate-600">{selectedReceipt.issuedBy}</span>
                <div className="mt-0.5">Thank you for your business.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Receipt Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Issue Official Receipt</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReceipt} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Client / Customer Name</label>
                  <input
                    type="text"
                    required
                    value={formClientName}
                    onChange={(e) => setFormClientName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Client Email</label>
                  <input
                    type="email"
                    value={formClientEmail}
                    onChange={(e) => setFormClientEmail(e.target.value)}
                    placeholder="billing@client.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
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
                    <option value="credit_card">Card</option>
                    <option value="online">Online Gateway</option>
                    <option value="pos">POS Terminal</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Invoice Ref (Optional)</label>
                  <input
                    type="text"
                    value={formInvoiceNumber}
                    onChange={(e) => setFormInvoiceNumber(e.target.value)}
                    placeholder="e.g. INV-2026-001"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reference / NIP Code</label>
                  <input
                    type="text"
                    value={formRefNumber}
                    onChange={(e) => setFormRefNumber(e.target.value)}
                    placeholder="e.g. TXN-88912"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Authorized Issuer</label>
                  <input
                    type="text"
                    value={formIssuedBy}
                    onChange={(e) => setFormIssuedBy(e.target.value)}
                    placeholder="e.g. John Doe (Finance)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Receipt Remarks</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Official memo..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-semibold shadow-sm"
                >
                  Generate Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
