import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Send, 
  Save, 
  Eye, 
  UserPlus, 
  Package, 
  FileText, 
  DollarSign, 
  Sparkles,
  Calculator
} from 'lucide-react';
import { Invoice, Client, InventoryItem, LineItem, CompanyProfile } from '../types';
import { generatePaymentToken } from '../utils/paymentTokenUtils';

interface CreateInvoiceViewProps {
  clients: Client[];
  items: InventoryItem[];
  companyProfile: CompanyProfile;
  onSaveInvoice: (invoice: Invoice, action: 'save' | 'send') => void;
  onCancel: () => void;
  onOpenAddClient: () => void;
  onPreviewInvoice: (invoice: Invoice) => void;
  initialInvoiceData?: Partial<Invoice>;
}

export const CreateInvoiceView: React.FC<CreateInvoiceViewProps> = ({
  clients,
  items,
  companyProfile,
  onSaveInvoice,
  onCancel,
  onOpenAddClient,
  onPreviewInvoice,
  initialInvoiceData,
}) => {
  // Form State
  const [selectedClientId, setSelectedClientId] = useState<string>(
    initialInvoiceData?.clientName 
      ? clients.find(c => c.name === initialInvoiceData.clientName)?.id || clients[0]?.id || ''
      : clients[0]?.id || ''
  );

  const [invoiceNumber, setInvoiceNumber] = useState<string>(
    initialInvoiceData?.invoiceNumber || `INV-${Math.floor(1000 + Math.random() * 9000)}`
  );

  const [date, setDate] = useState<string>(
    initialInvoiceData?.date || new Date().toISOString().split('T')[0]
  );

  const [dueDate, setDueDate] = useState<string>(
    initialInvoiceData?.dueDate || 
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const [estimateRef, setEstimateRef] = useState<string>(
    initialInvoiceData?.estimateRef || ''
  );

  const [notes, setNotes] = useState<string>(
    initialInvoiceData?.notes || 'Payment is due within 14 days of invoice date. Thank you for your business!'
  );

  const [discountPercent, setDiscountPercent] = useState<number>(
    initialInvoiceData?.discount ? Number(initialInvoiceData.discount) : 0
  );

  const [lineItems, setLineItems] = useState<LineItem[]>(
    initialInvoiceData?.items && initialInvoiceData.items.length > 0
      ? initialInvoiceData.items
      : [
          {
            id: 'line-1',
            description: 'Web Design Services',
            qty: 1,
            unitPrice: 1500.0,
            taxRate: companyProfile.defaultTaxRate,
            total: 1500.0 * (1 + companyProfile.defaultTaxRate / 100),
          },
        ]
  );

  // Selected client object
  const currentClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  // Helper calculations
  const calculateLineTotal = (qty: number, unitPrice: number, taxRate: number) => {
    const base = (qty || 0) * (unitPrice || 0);
    const tax = base * ((taxRate || 0) / 100);
    return base + tax;
  };

  const handleItemChange = (id: string, field: keyof LineItem, value: any) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        // Recalculate total if qty, price or tax changed
        if (field === 'qty' || field === 'unitPrice' || field === 'taxRate') {
          updated.total = calculateLineTotal(
            Number(field === 'qty' ? value : updated.qty),
            Number(field === 'unitPrice' ? value : updated.unitPrice),
            Number(field === 'taxRate' ? value : updated.taxRate)
          );
        }
        return updated;
      })
    );
  };

  const handleSelectItemFromCatalog = (lineId: string, itemId: string) => {
    const found = items.find((i) => i.id === itemId);
    if (!found) return;
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== lineId) return item;
        return {
          ...item,
          description: found.name,
          unitPrice: found.unitPrice,
          taxRate: found.taxRate,
          total: calculateLineTotal(item.qty, found.unitPrice, found.taxRate),
        };
      })
    );
  };

  const handleAddLineItem = () => {
    const newItem: LineItem = {
      id: `line-${Date.now()}`,
      description: '',
      qty: 1,
      unitPrice: 0,
      taxRate: companyProfile.defaultTaxRate,
      total: 0,
    };
    setLineItems([...lineItems, newItem]);
  };

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((i) => i.id !== id));
  };

  // Subtotal & Totals
  const subtotal = lineItems.reduce((sum, item) => sum + (item.qty * item.unitPrice), 0);
  const discountAmount = (subtotal * (discountPercent || 0)) / 100;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const totalTaxAmount = lineItems.reduce((sum, item) => {
    const itemSub = item.qty * item.unitPrice;
    return sum + (itemSub * (item.taxRate / 100));
  }, 0);
  const grandTotal = discountedSubtotal + totalTaxAmount;

  const buildInvoiceObject = (status: 'draft' | 'pending'): Invoice => {
    const existingToken = initialInvoiceData?.payment_token || initialInvoiceData?.paymentToken;
    const paymentToken = existingToken || generatePaymentToken(invoiceNumber, currentClient?.name);

    return {
      id: initialInvoiceData?.id || `inv-${Date.now()}`,
      invoiceNumber,
      payment_token: paymentToken,
      paymentToken: paymentToken,
      clientName: currentClient?.name || 'Unknown Client',
      clientEmail: currentClient?.email || '',
      clientAddress: currentClient?.address || '',
      clientAvatar: currentClient?.logo || 'CL',
      date,
      dueDate,
      items: lineItems,
      subtotal,
      taxAmount: totalTaxAmount,
      discount: discountAmount,
      total: grandTotal,
      status: status,
      notes,
      estimateRef: estimateRef || undefined,
      createdAt: initialInvoiceData?.createdAt || new Date().toISOString(),
    };
  };

  const handleSave = (action: 'save' | 'send') => {
    const invoice = buildInvoiceObject(action === 'save' ? 'draft' : 'pending');
    onSaveInvoice(invoice, action);
  };

  return (
    <div id="create-invoice-container" className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {initialInvoiceData?.id ? 'Edit Invoice' : 'Create New Invoice'}
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Ref: <span className="font-bold text-blue-600">{invoiceNumber}</span>
              {estimateRef && <span className="text-slate-600 font-bold ml-2">• Converted from {estimateRef}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-preview-invoice-builder"
            onClick={() => onPreviewInvoice(buildInvoiceObject('pending'))}
            className="flex items-center gap-2 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-all"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>Preview PDF</span>
          </button>

          <button
            id="btn-save-draft"
            onClick={() => handleSave('save')}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all"
          >
            <Save className="w-4 h-4 text-slate-500" />
            <span>Save Draft</span>
          </button>

          <button
            id="btn-save-and-send"
            onClick={() => handleSave('send')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Save & Send</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client & Invoice Meta Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Invoice & Client Details</span>
              </h3>
              <button
                type="button"
                onClick={onOpenAddClient}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ New Client</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Client Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Bill To Client *
                </label>
                <select
                  id="select-invoice-client"
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.contactPerson})
                    </option>
                  ))}
                </select>
                {currentClient && (
                  <div className="mt-2 space-y-1.5">
                    <div className="p-2.5 bg-slate-50/80 rounded-lg border border-slate-100 text-[11px] text-slate-500 space-y-0.5">
                      <div className="font-semibold text-slate-700">{currentClient.email}</div>
                      <div className="truncate">{currentClient.address}</div>
                    </div>
                    {currentClient.notes && (
                      <div className="p-2 rounded-lg bg-amber-50/80 border border-amber-200/70 text-[11px] text-amber-900">
                        <div className="font-bold flex items-center gap-1 text-amber-800 uppercase tracking-wider text-[10px] mb-0.5">
                          <span>Client Directive &amp; Notes:</span>
                        </div>
                        <div 
                          className="rich-notes-content line-clamp-3 text-slate-700" 
                          dangerouslySetInnerHTML={{ __html: currentClient.notes }} 
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Meta details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Invoice #
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Estimate Ref (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. EST-2023-041"
                    value={estimateRef}
                    onChange={(e) => setEstimateRef(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <span>Line Items & Services</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {lineItems.length} {lineItems.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                    <th className="pb-2 font-bold w-5/12">Description / Catalog Pick</th>
                    <th className="pb-2 font-bold w-20 text-center">Qty</th>
                    <th className="pb-2 font-bold w-28 text-right">Unit Price</th>
                    <th className="pb-2 font-bold w-20 text-center">Tax %</th>
                    <th className="pb-2 font-bold w-28 text-right">Total</th>
                    <th className="pb-2 font-bold w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lineItems.map((item, idx) => (
                    <tr key={item.id} className="group">
                      <td className="py-2.5 pr-2">
                        <div className="space-y-1">
                          <input
                            type="text"
                            placeholder="Item description..."
                            value={item.description}
                            onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:bg-white"
                          />
                          <select
                            onChange={(e) => handleSelectItemFromCatalog(item.id, e.target.value)}
                            defaultValue=""
                            className="w-full px-2 py-1 bg-slate-100/70 border border-slate-200 rounded text-[10px] text-slate-600"
                          >
                            <option value="" disabled>
                              ⚡ Fill from Catalog...
                            </option>
                            {items.map((catItem) => (
                              <option key={catItem.id} value={catItem.id}>
                                {catItem.name} (${catItem.unitPrice.toFixed(2)})
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      <td className="py-2.5 px-2">
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) => handleItemChange(item.id, 'qty', Math.max(1, Number(e.target.value)))}
                          className="w-full text-center px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900"
                        />
                      </td>

                      <td className="py-2.5 px-2">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(item.id, 'unitPrice', Number(e.target.value))}
                            className="w-full pl-6 pr-2 py-1.5 text-right bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900"
                          />
                        </div>
                      </td>

                      <td className="py-2.5 px-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.taxRate}
                          onChange={(e) => handleItemChange(item.id, 'taxRate', Number(e.target.value))}
                          className="w-full text-center px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700"
                        />
                      </td>

                      <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-900">
                        ${item.total.toFixed(2)}
                      </td>

                      <td className="py-2.5 pl-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(item.id)}
                          disabled={lineItems.length <= 1}
                          className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-slate-400 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              id="btn-add-line-item"
              onClick={handleAddLineItem}
              className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Line Item</span>
            </button>
          </div>

          {/* Notes & Terms */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Notes & Payment Instructions</h3>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter bank wire details, terms, or customer message..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Right 1 Col: Calculations & Summary Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-5 sticky top-20">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Calculator className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">Invoice Summary</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono font-bold text-slate-900">${subtotal.toFixed(2)}</span>
              </div>

              {/* Discount Input */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600">Discount %</span>
                <div className="flex items-center gap-1.5 w-24">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full text-right px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                  />
                  <span className="text-slate-400 font-mono">%</span>
                </div>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-700">
                  <span>Discount Applied</span>
                  <span className="font-mono font-bold">-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-slate-600">
                <span>Estimated Taxes</span>
                <span className="font-mono font-bold text-slate-900">${totalTaxAmount.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
                <span className="font-black text-slate-900 text-sm">Grand Total</span>
                <span className="font-mono font-black text-2xl text-blue-600">
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Quick Actions inside Summary */}
            <div className="pt-4 border-t border-slate-100 space-y-2.5">
              <button
                type="button"
                onClick={() => handleSave('send')}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Save & Dispatch Email</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave('save')}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Save as Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
