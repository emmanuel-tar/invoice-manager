import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Repeat, 
  Calendar, 
  Clock, 
  Sparkles, 
  Building2, 
  DollarSign, 
  Check, 
  HelpCircle,
  Package
} from 'lucide-react';
import { 
  RecurringSchedule, 
  RecurringFrequency, 
  Client, 
  InventoryItem, 
  TaxRate, 
  LineItem, 
  BillingPatternPreset 
} from '../types';
import { 
  BILLING_PATTERN_PRESETS, 
  calculateNextBillingDate, 
  toISODateString, 
  getFrequencyLabel 
} from '../utils/recurringUtils';

interface CreateRecurringScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (schedule: RecurringSchedule) => void;
  clients: Client[];
  itemsCatalog: InventoryItem[];
  taxRates: TaxRate[];
  initialSchedule?: Partial<RecurringSchedule> | null;
}

export const CreateRecurringScheduleModal: React.FC<CreateRecurringScheduleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clients,
  itemsCatalog,
  taxRates,
  initialSchedule,
}) => {
  if (!isOpen) return null;

  const defaultStartDate = toISODateString(new Date());

  const [title, setTitle] = useState(initialSchedule?.title || 'Monthly Service Retainer');
  const [selectedClientId, setSelectedClientId] = useState(initialSchedule?.clientId || (clients[0]?.id || ''));
  const [frequency, setFrequency] = useState<RecurringFrequency>(initialSchedule?.frequency || 'monthly');
  const [startDate, setStartDate] = useState(initialSchedule?.startDate || defaultStartDate);
  const [nextBillingDate, setNextBillingDate] = useState(
    initialSchedule?.nextBillingDate || calculateNextBillingDate(defaultStartDate, 'monthly')
  );
  const [endDate, setEndDate] = useState(initialSchedule?.endDate || '');
  const [paymentTermsDays, setPaymentTermsDays] = useState<number>(initialSchedule?.paymentTermsDays || 14);
  const [autoSend, setAutoSend] = useState<boolean>(initialSchedule?.autoSend ?? false);
  const [notes, setNotes] = useState(initialSchedule?.notes || '');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const [items, setItems] = useState<LineItem[]>(() => {
    if (initialSchedule?.items && initialSchedule.items.length > 0) {
      return initialSchedule.items;
    }
    return [
      {
        id: `item-init-1`,
        description: 'Monthly Retainer & Ongoing Support',
        qty: 1,
        unitPrice: 1500,
        taxRate: 10,
        total: 1650,
      },
    ];
  });

  // Recalculate next billing date when frequency or start date changes
  const handleStartDateChange = (newStart: string) => {
    setStartDate(newStart);
    setNextBillingDate(calculateNextBillingDate(newStart, frequency));
  };

  const handleFrequencyChange = (newFreq: RecurringFrequency) => {
    setFrequency(newFreq);
    setNextBillingDate(calculateNextBillingDate(startDate, newFreq));
  };

  // Load a preset template
  const handleApplyPreset = (preset: BillingPatternPreset) => {
    setSelectedPresetId(preset.id);
    setTitle(preset.title);
    setFrequency(preset.frequency);
    setPaymentTermsDays(preset.paymentTermsDays);
    setNextBillingDate(calculateNextBillingDate(startDate, preset.frequency));
    
    const formattedItems: LineItem[] = preset.suggestedItems.map((si, idx) => ({
      ...si,
      id: `item-preset-${Date.now()}-${idx}`,
    }));
    setItems(formattedItems);
  };

  // Item modifications
  const handleAddItem = () => {
    const defaultTax = taxRates.find(t => t.isDefault)?.rate || 10;
    const newItem: LineItem = {
      id: `item-${Date.now()}`,
      description: '',
      qty: 1,
      unitPrice: 0,
      taxRate: defaultTax,
      total: 0,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleItemChange = (id: string, field: keyof LineItem, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        const lineSubtotal = (Number(updated.qty) || 0) * (Number(updated.unitPrice) || 0);
        const tax = lineSubtotal * ((Number(updated.taxRate) || 0) / 100);
        updated.total = lineSubtotal + tax;
        return updated;
      })
    );
  };

  const handleSelectCatalogItem = (itemId: string, lineId: string) => {
    const catItem = itemsCatalog.find((c) => c.id === itemId);
    if (!catItem) return;
    handleItemChange(lineId, 'description', catItem.name);
    handleItemChange(lineId, 'unitPrice', catItem.unitPrice);
    handleItemChange(lineId, 'taxRate', catItem.taxRate);
  };

  // Financial calculations
  const subtotal = items.reduce((acc, item) => acc + (Number(item.qty) || 0) * (Number(item.unitPrice) || 0), 0);
  const taxAmount = items.reduce((acc, item) => {
    const lineSubtotal = (Number(item.qty) || 0) * (Number(item.unitPrice) || 0);
    return acc + lineSubtotal * ((Number(item.taxRate) || 0) / 100);
  }, 0);
  const total = subtotal + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];
    if (!selectedClient) return;

    const schedule: RecurringSchedule = {
      id: initialSchedule?.id || `sched-${Date.now()}`,
      title: title.trim() || `${selectedClient.name} Recurring Schedule`,
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      clientEmail: selectedClient.email,
      clientAddress: selectedClient.address,
      clientAvatar: selectedClient.logo || selectedClient.name.slice(0, 2).toUpperCase(),
      frequency,
      startDate,
      nextBillingDate,
      endDate: endDate || undefined,
      paymentTermsDays: Number(paymentTermsDays) || 14,
      items,
      subtotal,
      taxAmount,
      discount: 0,
      total,
      autoSend,
      status: initialSchedule?.status || 'active',
      generatedInvoicesCount: initialSchedule?.generatedInvoicesCount || 0,
      lastGeneratedDate: initialSchedule?.lastGeneratedDate,
      notes: notes.trim() || undefined,
      createdAt: initialSchedule?.createdAt || new Date().toISOString(),
    };

    onSave(schedule);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full shadow-2xl border border-slate-200/80 my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Repeat className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {initialSchedule?.id ? 'Edit Recurring Schedule' : 'New Recurring Billing Schedule'}
              </h3>
              <p className="text-xs text-slate-400">
                Define automatic generation cycles for client recurring retainers and services
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Quick Preset Pattern Selector */}
          {!initialSchedule?.id && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>Quick Billing Pattern Presets (Optional)</span>
                </label>
                <span className="text-[11px] text-slate-400">Loads industry standard items & frequencies</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {BILLING_PATTERN_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      selectedPresetId === preset.id
                        ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-[11px] truncate">{preset.title}</div>
                    <div className="text-[10px] text-blue-600 font-medium capitalize mt-0.5">{preset.frequency}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Basic Schedule Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Schedule Title / Plan Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Monthly Design Retainer"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Select Client <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
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
          </div>

          {/* Frequency & Date Configuration */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-4">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Billing Cycle & Frequency Cadence</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-600 mb-1">Billing Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => handleFrequencyChange(e.target.value as RecurringFrequency)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="weekly">Weekly (Every 7 Days)</option>
                  <option value="biweekly">Bi-Weekly (Every 14 Days)</option>
                  <option value="monthly">Monthly (Every 1 Month)</option>
                  <option value="quarterly">Quarterly (Every 3 Months)</option>
                  <option value="annually">Annually (Every 12 Months)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Cycle Start Date</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Next Run Billing Date</label>
                <input
                  type="date"
                  required
                  value={nextBillingDate}
                  onChange={(e) => setNextBillingDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-blue-900 font-mono font-bold text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-medium text-slate-600 mb-1">Payment Terms (Days for Due Date)</label>
                <select
                  value={paymentTermsDays}
                  onChange={(e) => setPaymentTermsDays(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value={0}>Due upon receipt (0 days)</option>
                  <option value={7}>Net 7 Days</option>
                  <option value={14}>Net 14 Days (Standard)</option>
                  <option value={30}>Net 30 Days</option>
                  <option value={60}>Net 60 Days</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Schedule End Date (Optional)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="Ongoing indefinite"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Line Items Builder */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-blue-600" />
                <span>Recurring Billing Items & Services</span>
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3 bg-white rounded-lg border border-slate-200/80 shadow-xs space-y-2"
                >
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-600 text-[11px]">Item #{index + 1}</span>
                        {itemsCatalog.length > 0 && (
                          <select
                            onChange={(e) => handleSelectCatalogItem(e.target.value, item.id)}
                            defaultValue=""
                            className="text-[10px] text-blue-600 bg-blue-50/50 px-2 py-0.5 rounded border border-blue-200 font-medium"
                          >
                            <option value="" disabled>
                              + Autofill from Catalog...
                            </option>
                            {itemsCatalog.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name} (${cat.unitPrice})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Description of service or subscription item"
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="mt-6 p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] font-medium text-slate-500 block mb-0.5">Quantity</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        required
                        value={item.qty}
                        onChange={(e) => handleItemChange(item.id, 'qty', Number(e.target.value))}
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-900 font-mono text-center focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-medium text-slate-500 block mb-0.5">Unit Price ($)</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(item.id, 'unitPrice', Number(e.target.value))}
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-900 font-mono text-center focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] font-medium text-slate-500 block mb-0.5">Tax Rate (%)</span>
                      <select
                        value={item.taxRate}
                        onChange={(e) => handleItemChange(item.id, 'taxRate', Number(e.target.value))}
                        className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-900 font-mono text-center focus:bg-white focus:outline-none"
                      >
                        {taxRates.map((t) => (
                          <option key={t.id} value={t.rate}>
                            {t.name} ({t.rate}%)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Subtotal Summary Card */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between">
              <span className="text-slate-600 font-medium">Recurring Cycle Total:</span>
              <div className="text-right">
                <span className="text-base font-bold text-slate-900 font-mono">
                  ${total.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400 block font-mono">
                  (Subtotal ${subtotal.toFixed(2)} + Tax ${taxAmount.toFixed(2)})
                </span>
              </div>
            </div>
          </div>

          {/* Automation & Delivery Options */}
          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
            <div className="font-semibold text-slate-800">Generation & Automation Workflow</div>
            
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={!autoSend}
                onChange={(e) => setAutoSend(!e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="font-semibold text-slate-800 block">
                  Generate as Draft Invoice (Recommended)
                </span>
                <span className="text-slate-500 text-[11px]">
                  Automatically creates a new draft invoice in your ledger for review before emailing.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSend}
                onChange={(e) => setAutoSend(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="font-semibold text-slate-800 block">
                  Auto-Dispatch to Client Email Immediately
                </span>
                <span className="text-slate-500 text-[11px]">
                  Automatically marks status as pending and sends invoice link directly on billing date.
                </span>
              </div>
            </label>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Internal Notes / Agreement Terms (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Master Services Agreement #2026-A signed July 1st. Automatic billing on 1st of month."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{initialSchedule?.id ? 'Save Changes' : 'Create Recurring Schedule'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
