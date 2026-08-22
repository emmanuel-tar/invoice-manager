import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  FileSpreadsheet, 
  Save, 
  Send,
  UserPlus
} from 'lucide-react';
import { Estimate, Client, InventoryItem, LineItem, CompanyProfile } from '../types';

interface CreateEstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  items: InventoryItem[];
  companyProfile: CompanyProfile;
  onSaveEstimate: (estimate: Estimate) => void;
}

export const CreateEstimateModal: React.FC<CreateEstimateModalProps> = ({
  isOpen,
  onClose,
  clients,
  items,
  companyProfile,
  onSaveEstimate,
}) => {
  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];
  const defaultExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [clientId, setClientId] = useState<string>(clients[0]?.id || '');
  const [estimateNumber, setEstimateNumber] = useState<string>(`EST-2023-${Math.floor(100 + Math.random() * 900)}`);
  const [date, setDate] = useState<string>(today);
  const [expiryDate, setExpiryDate] = useState<string>(defaultExpiry);
  const [notes, setNotes] = useState<string>('Valid for 30 days from issue date. Net 30 terms upon acceptance.');
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: 'line-1',
      description: 'Web Design Services',
      qty: 1,
      unitPrice: 1500,
      taxRate: 10,
      total: 1650,
    },
  ]);

  const selectedClient = clients.find((c) => c.id === clientId) || clients[0];

  const handleItemChange = (id: string, field: keyof LineItem, val: any) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: val };
        const q = Number(field === 'qty' ? val : updated.qty) || 0;
        const p = Number(field === 'unitPrice' ? val : updated.unitPrice) || 0;
        const t = Number(field === 'taxRate' ? val : updated.taxRate) || 0;
        updated.total = q * p + (q * p * t) / 100;
        return updated;
      })
    );
  };

  const handleSelectCatalog = (lineId: string, itemId: string) => {
    const it = items.find((i) => i.id === itemId);
    if (!it) return;
    setLineItems((prev) =>
      prev.map((l) => {
        if (l.id !== lineId) return l;
        return {
          ...l,
          description: it.name,
          unitPrice: it.unitPrice,
          taxRate: it.taxRate,
          total: l.qty * it.unitPrice + (l.qty * it.unitPrice * it.taxRate) / 100,
        };
      })
    );
  };

  const addLine = () => {
    setLineItems([
      ...lineItems,
      {
        id: `line-${Date.now()}`,
        description: '',
        qty: 1,
        unitPrice: 0,
        taxRate: 10,
        total: 0,
      },
    ]);
  };

  const removeLine = (id: string) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((l) => l.id !== id));
  };

  const subtotal = lineItems.reduce((acc, i) => acc + i.qty * i.unitPrice, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const taxAmount = lineItems.reduce((acc, i) => acc + (i.qty * i.unitPrice * i.taxRate) / 100, 0);
  const grandTotal = subtotal - discountAmount + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEstimate: Estimate = {
      id: `est-${Date.now()}`,
      estimateNumber,
      clientName: selectedClient.name,
      clientEmail: selectedClient.email,
      clientAddress: selectedClient.address,
      clientAvatar: selectedClient.logo || 'CL',
      date,
      expiryDate,
      items: lineItems,
      subtotal,
      taxAmount,
      discount: discountAmount,
      total: grandTotal,
      status: 'sent',
      notes,
    };
    onSaveEstimate(newEstimate);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl border border-slate-200/80 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Create New Estimate / Quote</h3>
              <p className="text-xs text-slate-500 font-mono">Precision estimate with line item pricing</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-4 text-xs">
          {/* Client & Date details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Client *</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.contactPerson})
                  </option>
                ))}
              </select>
              {selectedClient?.notes && (
                <div 
                  className="mt-1.5 p-2 rounded-md bg-amber-50/80 border border-amber-200/60 text-[10px] text-slate-700 line-clamp-2 rich-notes-content" 
                  dangerouslySetInnerHTML={{ __html: selectedClient.notes }} 
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Estimate #</label>
                <input
                  type="text"
                  value={estimateNumber}
                  onChange={(e) => setEstimateNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Valid Until</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Line items */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-700">Line Items & Scope</label>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {lineItems.map((item) => (
                <div key={item.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-2">
                  <div className="grid grid-cols-12 gap-2">
                    <input
                      type="text"
                      placeholder="Item description..."
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      className="col-span-5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <select
                      onChange={(e) => handleSelectCatalog(item.id, e.target.value)}
                      defaultValue=""
                      className="col-span-7 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="" disabled>⚡ Fill from Catalog...</option>
                      {items.map((it) => (
                        <option key={it.id} value={it.id}>{it.name} (${it.unitPrice})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-3">
                      <span className="text-[10px] text-slate-400 block font-mono">Qty</span>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => handleItemChange(item.id, 'qty', Math.max(1, Number(e.target.value)))}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-center font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                    <div className="col-span-4">
                      <span className="text-[10px] text-slate-400 block font-mono">Unit Price ($)</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(item.id, 'unitPrice', Number(e.target.value))}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-right font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                    <div className="col-span-4 text-right">
                      <span className="text-[10px] text-slate-400 block font-mono">Total</span>
                      <span className="font-mono font-bold text-slate-900 text-xs">${item.total.toFixed(2)}</span>
                    </div>
                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => removeLine(item.id)}
                        disabled={lineItems.length <= 1}
                        className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addLine}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Service</span>
            </button>
          </div>

          {/* Totals Summary */}
          <div className="p-3.5 bg-slate-900 text-white rounded-lg flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-blue-400 uppercase font-semibold">Estimated Total</div>
              <div className="text-xl font-black font-mono-data mt-0.5">${grandTotal.toFixed(2)}</div>
            </div>
            <div className="text-right text-[11px] text-slate-300 font-mono">
              <div>Subtotal: ${subtotal.toFixed(2)}</div>
              <div>Taxes: ${taxAmount.toFixed(2)}</div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg shadow-sm transition-all"
            >
              Create & Send Estimate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
