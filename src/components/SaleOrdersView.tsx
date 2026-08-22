import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Search, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Truck, 
  X, 
  Calendar, 
  Trash2, 
  DollarSign, 
  ArrowRight,
  Sparkles,
  PackageCheck
} from 'lucide-react';
import { SaleOrder, SaleOrderStatus, LineItem, Client, InventoryItem, CompanyProfile } from '../types';
import { formatCurrencyAmount } from '../data/currencies';

interface SaleOrdersViewProps {
  saleOrders: SaleOrder[];
  clients: Client[];
  inventoryItems: InventoryItem[];
  companyProfile: CompanyProfile;
  onAddSaleOrder: (order: Omit<SaleOrder, 'id' | 'orderNumber'>) => void;
  onUpdateOrderStatus: (id: string, status: SaleOrderStatus) => void;
  onConvertToInvoice: (order: SaleOrder) => void;
  onDeleteSaleOrder?: (id: string) => void;
}

export const SaleOrdersView: React.FC<SaleOrdersViewProps> = ({
  saleOrders,
  clients,
  inventoryItems,
  companyProfile,
  onAddSaleOrder,
  onUpdateOrderStatus,
  onConvertToInvoice,
  onDeleteSaleOrder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SaleOrder | null>(null);

  // Form state
  const [selectedClientId, setSelectedClientId] = useState('');
  const [orderDate, setOrderDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState<string>(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', description: 'Item / Service Delivery', qty: 1, unitPrice: 1000, taxRate: 7.5, total: 1075 }
  ]);
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Calculations
  const subtotal = items.reduce((acc, it) => acc + it.qty * it.unitPrice, 0);
  const taxAmount = items.reduce((acc, it) => acc + (it.qty * it.unitPrice * (it.taxRate / 100)), 0);
  const total = Math.max(0, subtotal + taxAmount - discount);

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
        const itemSub = updated.qty * updated.unitPrice;
        const itemTax = itemSub * (updated.taxRate / 100);
        updated.total = itemSub + itemTax;
      }
      return updated;
    }));
  };

  const handleSelectCatalogItem = (id: string, itemId: string) => {
    const catalog = inventoryItems.find((ci) => ci.id === itemId);
    if (!catalog) return;
    setItems(items.map((i) => {
      if (i.id !== id) return i;
      const itemSub = 1 * catalog.unitPrice;
      const itemTax = itemSub * (catalog.taxRate / 100);
      return {
        ...i,
        description: catalog.name,
        unitPrice: catalog.unitPrice,
        taxRate: catalog.taxRate,
        qty: 1,
        total: itemSub + itemTax,
      };
    }));
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) return;
    const client = clients.find((c) => c.id === selectedClientId);
    if (!client) return;

    onAddSaleOrder({
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      clientAddress: client.address,
      orderDate,
      expectedDeliveryDate: deliveryDate,
      items,
      subtotal,
      taxAmount,
      discount,
      total,
      status: 'confirmed',
      notes,
    });

    setIsAddModalOpen(false);
    setSelectedClientId('');
    setNotes('');
    setDiscount(0);
  };

  const filteredOrders = useMemo(() => {
    return saleOrders.filter((o) => {
      const matchSearch =
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.clientName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [saleOrders, searchQuery, statusFilter]);

  const getStatusBadge = (status: SaleOrderStatus) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">Confirmed</span>;
      case 'processing':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">Processing</span>;
      case 'shipped':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">Shipped</span>;
      case 'delivered':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">Delivered</span>;
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
            <ShoppingBag className="w-6 h-6 text-blue-600" />
            <span>Sale Orders</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage customer sales orders, fulfillment tracking, and seamless 1-click invoice conversion.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Sale Order</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Pipeline Total</div>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {formatCurrencyAmount(saleOrders.reduce((acc, o) => acc + o.total, 0), companyProfile.currencySymbol)}
          </div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1">
            {saleOrders.length} Confirmed orders
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ready for Invoicing</div>
          <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">
            {saleOrders.filter((o) => !o.invoiceGeneratedId && o.status !== 'cancelled').length} Orders
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <PackageCheck className="w-3.5 h-3.5" /> 1-Click Convert available
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">In Fulfillment</div>
          <div className="text-2xl font-black text-indigo-600 mt-1 font-mono">
            {saleOrders.filter((o) => o.status === 'processing' || o.status === 'shipped').length} Orders
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Dispatched or packaging</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order #, client..."
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
          <option value="all">All Order Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Order Date</th>
                <th className="py-3.5 px-4">Delivery Due</th>
                <th className="py-3.5 px-4">Line Items</th>
                <th className="py-3.5 px-4 text-right">Order Value</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Conversion / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No sales orders found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                      {o.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{o.clientName}</div>
                      <div className="text-[11px] text-slate-400">{o.clientEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{o.orderDate}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-semibold">{o.expectedDeliveryDate}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {o.items.length} item{o.items.length > 1 ? 's' : ''}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                      {formatCurrencyAmount(o.total, companyProfile.currencySymbol)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {getStatusBadge(o.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {o.invoiceGeneratedId ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Invoiced
                        </span>
                      ) : (
                        <button
                          onClick={() => onConvertToInvoice(o)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-md text-xs font-semibold shadow-xs transition-all"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Convert to Invoice</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Sale Order Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">New Sales Order</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer / Client *</label>
                <select
                  required
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                  <label className="block font-bold text-slate-700 mb-1">Order Date</label>
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
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900">Order Line Items</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-blue-600 hover:text-blue-700 font-bold text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Line Item
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
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
                          placeholder="Price"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-900 font-mono text-right"
                        />
                      </div>

                      <div className="col-span-2 font-mono font-bold text-slate-900 text-right pr-1">
                        {formatCurrencyAmount(item.total, companyProfile.currencySymbol)}
                      </div>

                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Summary */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">{formatCurrencyAmount(subtotal, companyProfile.currencySymbol)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax (7.5%):</span>
                  <span className="font-mono">{formatCurrencyAmount(taxAmount, companyProfile.currencySymbol)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Discount:</span>
                  <input
                    type="number"
                    step="any"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-1 bg-white border border-slate-200 rounded font-mono text-right text-xs"
                  />
                </div>
                <div className="flex justify-between text-slate-900 font-black text-sm pt-1 border-t border-slate-200">
                  <span>Total Order:</span>
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
                  Save Sale Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
