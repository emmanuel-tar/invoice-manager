import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  RotateCcw, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  X, 
  Calendar, 
  Building2, 
  DollarSign, 
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { PurchaseRecord, PurchaseReturn, PurchaseStatus, PurchaseReturnStatus, LineItem, CompanyProfile } from '../types';
import { formatCurrencyAmount } from '../data/currencies';

interface PurchasesViewProps {
  purchases: PurchaseRecord[];
  purchaseReturns: PurchaseReturn[];
  companyProfile: CompanyProfile;
  onAddPurchase: (record: Omit<PurchaseRecord, 'id' | 'purchaseNumber'>) => void;
  onAddPurchaseReturn: (ret: Omit<PurchaseReturn, 'id' | 'returnNumber'>) => void;
  onDeletePurchase?: (id: string) => void;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({
  purchases,
  purchaseReturns,
  companyProfile,
  onAddPurchase,
  onAddPurchaseReturn,
  onDeletePurchase,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'records' | 'returns'>('records');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Add Purchase Modal
  const [isAddPurchaseModalOpen, setIsAddPurchaseModalOpen] = useState(false);
  const [vendorName, setVendorName] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [purchaseItems, setPurchaseItems] = useState<LineItem[]>([
    { id: '1', description: 'Procured Hardware / Inventory', qty: 1, unitPrice: 500, taxRate: 7.5, total: 537.5 }
  ]);
  const [purchasePaymentStatus, setPurchasePaymentStatus] = useState<PurchaseStatus>('paid');
  const [purchaseNotes, setPurchaseNotes] = useState('');

  // Add Purchase Return Modal
  const [isAddReturnModalOpen, setIsAddReturnModalOpen] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [returnDate, setReturnDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [returnNotes, setReturnNotes] = useState('');

  // Calculations for Add Purchase
  const purSubtotal = purchaseItems.reduce((acc, it) => acc + it.qty * it.unitPrice, 0);
  const purTaxAmount = purchaseItems.reduce((acc, it) => acc + (it.qty * it.unitPrice * (it.taxRate / 100)), 0);
  const purTotal = purSubtotal + purTaxAmount;

  const handleAddPurchaseItem = () => {
    setPurchaseItems([
      ...purchaseItems,
      { id: Date.now().toString(), description: '', qty: 1, unitPrice: 0, taxRate: 7.5, total: 0 }
    ]);
  };

  const handleRemovePurchaseItem = (id: string) => {
    if (purchaseItems.length <= 1) return;
    setPurchaseItems(purchaseItems.filter((i) => i.id !== id));
  };

  const handlePurchaseItemChange = (id: string, field: keyof LineItem, val: any) => {
    setPurchaseItems(purchaseItems.map((i) => {
      if (i.id !== id) return i;
      const updated = { ...i, [field]: val };
      if (field === 'qty' || field === 'unitPrice' || field === 'taxRate') {
        const sub = updated.qty * updated.unitPrice;
        const tax = sub * (updated.taxRate / 100);
        updated.total = sub + tax;
      }
      return updated;
    }));
  };

  const handleCreatePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName || purTotal <= 0) return;

    onAddPurchase({
      vendorName,
      vendorEmail,
      vendorPhone,
      purchaseDate,
      items: purchaseItems,
      subtotal: purSubtotal,
      taxAmount: purTaxAmount,
      total: purTotal,
      status: purchasePaymentStatus,
      notes: purchaseNotes,
    });

    setIsAddPurchaseModalOpen(false);
    setVendorName('');
    setVendorEmail('');
    setPurchaseNotes('');
  };

  const handleCreateReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const purchase = purchases.find((p) => p.id === selectedPurchaseId);
    if (!purchase || refundAmount <= 0) return;

    onAddPurchaseReturn({
      purchaseId: purchase.id,
      purchaseNumber: purchase.purchaseNumber,
      vendorName: purchase.vendorName,
      returnDate,
      reason: returnReason,
      items: purchase.items,
      refundAmount,
      status: 'completed',
      notes: returnNotes,
    });

    setIsAddReturnModalOpen(false);
    setSelectedPurchaseId('');
    setReturnReason('');
    setRefundAmount(0);
  };

  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      const matchSearch =
        p.purchaseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [purchases, searchQuery, statusFilter]);

  const totalProcurement = purchases.reduce((acc, p) => acc + p.total, 0);
  const totalRefunds = purchaseReturns.reduce((acc, r) => acc + r.refundAmount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            <span>Purchases & Vendor Procurement</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log vendor acquisitions, manage inventory purchases, and record purchase returns with refunds.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddReturnModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold shadow-xs transition-all"
          >
            <RotateCcw className="w-4 h-4 text-slate-600" />
            <span>Add Purchase Return</span>
          </button>

          <button
            onClick={() => setIsAddPurchaseModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Purchase Record</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Purchase Spend</div>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {formatCurrencyAmount(totalProcurement, companyProfile.currencySymbol)}
          </div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1">
            {purchases.length} Purchase bills recorded
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Purchase Returns (Refunds)</div>
          <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">
            {formatCurrencyAmount(totalRefunds, companyProfile.currencySymbol)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <RotateCcw className="w-3.5 h-3.5" /> {purchaseReturns.length} Return claims settled
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Unpaid Vendor Dues</div>
          <div className="text-2xl font-black text-amber-600 mt-1 font-mono">
            {formatCurrencyAmount(
              purchases.filter((p) => p.status === 'unpaid').reduce((acc, p) => acc + p.total, 0),
              companyProfile.currencySymbol
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Accounts payable to vendors</div>
        </div>
      </div>

      {/* Subtab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('records')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'records'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Purchase Record List ({purchases.length})
        </button>

        <button
          onClick={() => setActiveSubTab('returns')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeSubTab === 'returns'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Purchase Return List ({purchaseReturns.length})
        </button>
      </div>

      {/* Subtab 1: Purchase Record List */}
      {activeSubTab === 'records' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search purchase #, vendor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium w-full sm:w-auto"
            >
              <option value="all">All Payment Statuses</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Purchase #</th>
                    <th className="py-3.5 px-4">Vendor</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Items Summary</th>
                    <th className="py-3.5 px-4 text-right">Subtotal</th>
                    <th className="py-3.5 px-4 text-right">Tax</th>
                    <th className="py-3.5 px-4 text-right">Total Cost</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredPurchases.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No purchase records found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredPurchases.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                          {p.purchaseNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{p.vendorName}</div>
                          <div className="text-[11px] text-slate-400">{p.vendorEmail}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{p.purchaseDate}</td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {p.items[0]?.description || 'Procured items'}
                          {p.items.length > 1 && ` (+${p.items.length - 1} more)`}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                          {formatCurrencyAmount(p.subtotal, companyProfile.currencySymbol)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                          {formatCurrencyAmount(p.taxAmount, companyProfile.currencySymbol)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                          {formatCurrencyAmount(p.total, companyProfile.currencySymbol)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              p.status === 'paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {p.status}
                          </span>
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

      {/* Subtab 2: Purchase Returns */}
      {activeSubTab === 'returns' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Return RMA #</th>
                    <th className="py-3.5 px-4">Original Purchase #</th>
                    <th className="py-3.5 px-4">Vendor</th>
                    <th className="py-3.5 px-4">Return Date</th>
                    <th className="py-3.5 px-4">Reason / Notes</th>
                    <th className="py-3.5 px-4 text-right">Refund Amount</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {purchaseReturns.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No purchase returns recorded.
                      </td>
                    </tr>
                  ) : (
                    purchaseReturns.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                          {r.returnNumber}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {r.purchaseNumber}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{r.vendorName}</td>
                        <td className="py-3.5 px-4 text-slate-600">{r.returnDate}</td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{r.reason}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 text-sm">
                          {formatCurrencyAmount(r.refundAmount, companyProfile.currencySymbol)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> {r.status}
                          </span>
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

      {/* Modal: Add New Purchase Record */}
      {isAddPurchaseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Add New Purchase Record</h3>
              </div>
              <button
                onClick={() => setIsAddPurchaseModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePurchase} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vendor / Supplier Name *</label>
                  <input
                    type="text"
                    required
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="e.g. Cisco EMEA Logistics"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vendor Email</label>
                  <input
                    type="email"
                    value={vendorEmail}
                    onChange={(e) => setVendorEmail(e.target.value)}
                    placeholder="orders@vendor.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Purchase Bill Date</label>
                  <input
                    type="date"
                    required
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Status</label>
                  <select
                    value={purchasePaymentStatus}
                    onChange={(e) => setPurchasePaymentStatus(e.target.value as PurchaseStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="paid">Paid (Fully Cleared)</option>
                    <option value="unpaid">Unpaid (Net-30 / Credit)</option>
                    <option value="partial">Partial Settlement</option>
                  </select>
                </div>
              </div>

              {/* Purchase Items */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900">Procured Items</label>
                  <button
                    type="button"
                    onClick={handleAddPurchaseItem}
                    className="text-blue-600 hover:text-blue-700 font-bold text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item Line
                  </button>
                </div>

                <div className="space-y-2">
                  {purchaseItems.map((item) => (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6">
                        <input
                          type="text"
                          required
                          placeholder="Item Description"
                          value={item.description}
                          onChange={(e) => handlePurchaseItemChange(item.id, 'description', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900"
                        />
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          required
                          placeholder="Qty"
                          value={item.qty}
                          onChange={(e) => handlePurchaseItemChange(item.id, 'qty', parseInt(e.target.value) || 1)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900 font-mono text-center"
                        />
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          step="any"
                          required
                          placeholder="Unit Cost"
                          value={item.unitPrice}
                          onChange={(e) => handlePurchaseItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900 font-mono text-right"
                        />
                      </div>

                      <div className="col-span-2 font-mono font-bold text-slate-900 text-right pr-1">
                        {formatCurrencyAmount(item.total, companyProfile.currencySymbol)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Card */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatCurrencyAmount(purSubtotal, companyProfile.currencySymbol)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax (7.5%):</span>
                  <span className="font-mono">{formatCurrencyAmount(purTaxAmount, companyProfile.currencySymbol)}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-black text-sm pt-1 border-t border-slate-200">
                  <span>Total Purchase Cost:</span>
                  <span className="font-mono text-blue-600">{formatCurrencyAmount(purTotal, companyProfile.currencySymbol)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddPurchaseModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-semibold shadow-sm"
                >
                  Save Purchase Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Purchase Return */}
      {isAddReturnModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Add Purchase Return / RMA</h3>
              </div>
              <button
                onClick={() => setIsAddReturnModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReturn} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Purchase Bill *</label>
                <select
                  required
                  value={selectedPurchaseId}
                  onChange={(e) => {
                    setSelectedPurchaseId(e.target.value);
                    const p = purchases.find((pur) => pur.id === e.target.value);
                    if (p) setRefundAmount(p.total);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">-- Select Original Purchase --</option>
                  {purchases.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.purchaseNumber} - {p.vendorName} ({formatCurrencyAmount(p.total, companyProfile.currencySymbol)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Refund Amount ({companyProfile.currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={refundAmount || ''}
                    onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Return Date</label>
                  <input
                    type="date"
                    required
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Return / RMA Issue *</label>
                <textarea
                  rows={2}
                  required
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="e.g. Defective hardware, wrong item shipped by supplier..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddReturnModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-semibold shadow-sm"
                >
                  Record Return & Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
