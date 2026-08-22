import React, { useState, useMemo } from 'react';
import { 
  FileCheck2, 
  Plus, 
  Search, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Truck, 
  X, 
  Trash2, 
  Calendar, 
  Building2, 
  DollarSign
} from 'lucide-react';
import { PurchaseOrder, PurchaseOrderStatus, LineItem, CompanyProfile } from '../types';
import { formatCurrencyAmount } from '../data/currencies';

interface PurchaseOrdersViewProps {
  purchaseOrders: PurchaseOrder[];
  companyProfile: CompanyProfile;
  onAddPurchaseOrder: (po: Omit<PurchaseOrder, 'id' | 'poNumber'>) => void;
  onUpdatePoStatus: (id: string, status: PurchaseOrderStatus) => void;
  onDeletePurchaseOrder?: (id: string) => void;
}

export const PurchaseOrdersView: React.FC<PurchaseOrdersViewProps> = ({
  purchaseOrders,
  companyProfile,
  onAddPurchaseOrder,
  onUpdatePoStatus,
  onDeletePurchaseOrder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [vendorName, setVendorName] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorAddress, setVendorAddress] = useState('');
  const [orderDate, setOrderDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expectedDate, setExpectedDate] = useState<string>(
    new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', description: 'Procurement Supply Line', qty: 1, unitPrice: 1500, taxRate: 7.5, total: 1612.5 }
  ]);
  const [notes, setNotes] = useState('');

  // Calculations
  const subtotal = items.reduce((acc, it) => acc + it.qty * it.unitPrice, 0);
  const taxAmount = items.reduce((acc, it) => acc + (it.qty * it.unitPrice * (it.taxRate / 100)), 0);
  const total = subtotal + taxAmount;

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), description: '', qty: 1, unitPrice: 0, taxRate: 7.5, total: 0 }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((i) => i.id !== id));
  };

  const handleItemChange = (id: string, field: keyof LineItem, val: any) => {
    setItems(items.map((i) => {
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

  const handleCreatePo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorName || total <= 0) return;

    onAddPurchaseOrder({
      vendorName,
      vendorEmail,
      vendorAddress: vendorAddress || 'Primary Logistics Hub',
      orderDate,
      expectedDeliveryDate: expectedDate,
      items,
      subtotal,
      taxAmount,
      total,
      status: 'ordered',
      notes,
    });

    setIsAddModalOpen(false);
    setVendorName('');
    setVendorEmail('');
    setNotes('');
  };

  const filteredPos = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const matchSearch =
        po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        po.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || po.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [purchaseOrders, searchQuery, statusFilter]);

  const getStatusBadge = (status: PurchaseOrderStatus) => {
    switch (status) {
      case 'ordered':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">Ordered</span>;
      case 'received':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">Received In Stock</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">Draft</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileCheck2 className="w-6 h-6 text-blue-600" />
            <span>Purchase Orders (PO)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create vendor purchase orders, commit supply requests, and mark receipt into inventory.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Purchase Order</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Committed PO Pipeline</div>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {formatCurrencyAmount(purchaseOrders.reduce((acc, p) => acc + p.total, 0), companyProfile.currencySymbol)}
          </div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1">
            {purchaseOrders.length} Purchase order contracts
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Awaiting Delivery</div>
          <div className="text-2xl font-black text-amber-600 mt-1 font-mono">
            {purchaseOrders.filter((p) => p.status === 'ordered').length} POs
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1 flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" /> En route from vendor
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Fulfilled / Received</div>
          <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">
            {purchaseOrders.filter((p) => p.status === 'received').length} POs
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Checked into warehouse
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search PO #, vendor..."
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
          <option value="all">All PO Statuses</option>
          <option value="ordered">Ordered</option>
          <option value="received">Received</option>
          <option value="draft">Draft</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* PO Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">PO #</th>
                <th className="py-3.5 px-4">Vendor</th>
                <th className="py-3.5 px-4">Date Issued</th>
                <th className="py-3.5 px-4">Expected Delivery</th>
                <th className="py-3.5 px-4">Items Summary</th>
                <th className="py-3.5 px-4 text-right">PO Total</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Status Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredPos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No purchase orders found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredPos.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      {po.poNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{po.vendorName}</div>
                      <div className="text-[11px] text-slate-400">{po.vendorEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{po.orderDate}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-semibold">{po.expectedDeliveryDate}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {po.items.length} line item{po.items.length > 1 ? 's' : ''}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                      {formatCurrencyAmount(po.total, companyProfile.currencySymbol)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {getStatusBadge(po.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {po.status === 'ordered' ? (
                        <button
                          onClick={() => onUpdatePoStatus(po.id, 'received')}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md text-xs font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Received</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Logged</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add PO Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Create Purchase Order (PO)</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePo} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vendor / Supplier Name *</label>
                  <input
                    type="text"
                    required
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                    placeholder="e.g. Dell Logistics Ltd"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Vendor Email</label>
                  <input
                    type="email"
                    value={vendorEmail}
                    onChange={(e) => setVendorEmail(e.target.value)}
                    placeholder="sales@dell-emea.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">PO Date</label>
                  <input
                    type="date"
                    required
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    required
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900">Purchase Order Lines</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-blue-600 hover:text-blue-700 font-bold text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Line
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6">
                        <input
                          type="text"
                          required
                          placeholder="Item Description"
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
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
                          onChange={(e) => handleItemChange(item.id, 'qty', parseInt(e.target.value) || 1)}
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
                          onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
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
                  <span className="font-mono">{formatCurrencyAmount(subtotal, companyProfile.currencySymbol)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax (7.5%):</span>
                  <span className="font-mono">{formatCurrencyAmount(taxAmount, companyProfile.currencySymbol)}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-black text-sm pt-1 border-t border-slate-200">
                  <span>Total Purchase Order:</span>
                  <span className="font-mono text-blue-600">{formatCurrencyAmount(total, companyProfile.currencySymbol)}</span>
                </div>
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
                  Issue Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
