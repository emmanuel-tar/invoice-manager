import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Trash2, 
  Layers, 
  Sparkles,
  DollarSign,
  X
} from 'lucide-react';
import { InventoryItem } from '../types';
import { formatCurrencyAmount } from '../data/currencies';

interface ItemsViewProps {
  items: InventoryItem[];
  currencySymbol?: string;
  onAddItem: (item: InventoryItem) => void;
  onEditItem: (item: InventoryItem) => void;
  onDeleteItem: (itemId: string) => void;
  onUpdateStock: (itemId: string, newStock: number) => void;
}

export const ItemsView: React.FC<ItemsViewProps> = ({
  items,
  currencySymbol = '₦',
  onAddItem,
  onEditItem,
  onDeleteItem,
  onUpdateStock,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Design & Development');
  const [stock, setStock] = useState<number>(10);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);
  const [unitPrice, setUnitPrice] = useState<number>(100);
  const [costPrice, setCostPrice] = useState<number>(35);
  const [taxRate, setTaxRate] = useState<number>(10);

  const openNewModal = () => {
    setEditingItem(null);
    setName('');
    setSku(`SKU-${Math.floor(100 + Math.random() * 900)}`);
    setCategory('Design & Development');
    setStock(10);
    setLowStockThreshold(5);
    setUnitPrice(150);
    setCostPrice(50);
    setTaxRate(10);
    setIsAddModalOpen(true);
  };

  const openEditModal = (it: InventoryItem) => {
    setEditingItem(it);
    setName(it.name);
    setSku(it.sku);
    setCategory(it.category);
    setStock(it.stock);
    setLowStockThreshold(it.lowStockThreshold);
    setUnitPrice(it.unitPrice);
    setCostPrice(it.costPrice ?? Math.round(it.unitPrice * 0.35));
    setTaxRate(it.taxRate);
    setIsAddModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const status: 'in_stock' | 'low' | 'out' =
      stock <= 0 ? 'out' : stock <= lowStockThreshold ? 'low' : 'in_stock';

    if (editingItem) {
      onEditItem({
        ...editingItem,
        name,
        sku,
        category,
        stock,
        lowStockThreshold,
        unitPrice,
        costPrice,
        taxRate,
        status,
      });
    } else {
      const newItem: InventoryItem = {
        id: `item-${Date.now()}`,
        name,
        sku,
        category,
        stock,
        lowStockThreshold,
        unitPrice,
        costPrice,
        taxRate,
        status,
      };
      onAddItem(newItem);
    }
    setIsAddModalOpen(false);
  };

  const categories = ['all', ...Array.from(new Set(items.map((i) => i.category)))];

  const filteredItems = items.filter((it) => {
    const matchesCat = categoryFilter === 'all' || it.category === categoryFilter;
    const matchesSearch =
      it.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const lowStockCount = items.filter((i) => i.status === 'low' || i.status === 'out').length;
  const totalValuation = items.reduce((sum, i) => sum + i.stock * i.unitPrice, 0);

  return (
    <div id="items-view-container" className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Items & Catalog</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Standard pricing rate-card, inventory levels, and tax classifications.
          </p>
        </div>

        <button
          id="btn-add-item-main"
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Item / Service</span>
        </button>
      </div>

      {/* KPI Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 font-mono uppercase">Catalog Items</div>
          <div className="text-xl font-black text-slate-900 font-mono-data mt-1">{items.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Available for instant invoicing</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-rose-600 font-mono uppercase">Low Stock Alerts</div>
          <div className="text-xl font-black text-rose-700 font-mono-data mt-1">{lowStockCount} Items</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Requires replenishment</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-600 font-mono uppercase">Total Valuation</div>
          <div className="text-xl font-black text-emerald-700 font-mono-data mt-1">
            ${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Hardware & stocked assets</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-600 font-mono uppercase">Categories</div>
          <div className="text-xl font-black text-slate-900 font-mono-data mt-1">{categories.length - 1}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Services & product lines</div>
        </div>
      </div>

      {/* Control Filters */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat === 'all' ? 'All Catalog' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-mono uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 font-bold">Item & Description</th>
                <th className="py-3.5 px-4 font-bold">SKU</th>
                <th className="py-3.5 px-4 font-bold">Category</th>
                <th className="py-3.5 px-4 font-bold text-center">Stock Level</th>
                <th className="py-3.5 px-4 font-bold text-right">Selling Price</th>
                <th className="py-3.5 px-4 font-bold text-right">Cost Price</th>
                <th className="py-3.5 px-4 font-bold text-center">Margin %</th>
                <th className="py-3.5 px-4 font-bold text-center">Tax %</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((it) => {
                const itemCost = it.costPrice ?? Math.round(it.unitPrice * 0.35);
                const itemProfit = it.unitPrice - itemCost;
                const marginPct = it.unitPrice > 0 ? (itemProfit / it.unitPrice) * 100 : 0;

                return (
                <tr key={it.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {it.name}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-slate-500 text-[11px]">
                    {it.sku}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    {it.category}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1.5 font-mono">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          it.status === 'in_stock'
                            ? 'bg-emerald-50 text-emerald-700'
                            : it.status === 'low'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {it.stock} in stock
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                    {formatCurrencyAmount(it.unitPrice, currencySymbol)}
                  </td>

                  <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                    {formatCurrencyAmount(itemCost, currencySymbol)}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-block px-1.5 py-0.5 rounded font-mono font-bold text-[10px] ${
                      marginPct >= 50 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {marginPct.toFixed(0)}%
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono text-slate-600">
                    {it.taxRate}%
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(it)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteItem(it.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );})}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200/80">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingItem ? 'Edit Catalog Item' : 'Add Item / Service'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Item / Service Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cloud Architecture Consultation"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">SKU / Code</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Selling Price ({currencySymbol}) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cost Price ({currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    placeholder="Unit purchase cost"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tax Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Current Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Low Stock Warning At</label>
                  <input
                    type="number"
                    min="0"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg shadow-sm"
                >
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
