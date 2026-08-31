import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  Plus, 
  Search, 
  TrendingUp, 
  CheckCircle2, 
  Calendar, 
  Building2, 
  Tag, 
  X, 
  ArrowUpRight,
  Filter,
  PieChart
} from 'lucide-react';
import { OtherIncome, IncomeCategory, PaymentMethod, CompanyProfile } from '../types';
import { formatCurrencyAmount } from '../data/currencies';

interface OtherIncomeViewProps {
  otherIncomes: OtherIncome[];
  companyProfile: CompanyProfile;
  onAddOtherIncome: (income: Omit<OtherIncome, 'id' | 'incomeNumber'>) => void;
  onDeleteOtherIncome?: (id: string) => void;
}

const INCOME_CATEGORIES: IncomeCategory[] = [
  'Interest',
  'Consulting',
  'Grants',
  'Dividends',
  'Asset Sale',
  'Royalties',
  'Other',
];

export const OtherIncomeView: React.FC<OtherIncomeViewProps> = ({
  otherIncomes,
  companyProfile,
  onAddOtherIncome,
  onDeleteOtherIncome,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [source, setSource] = useState('');
  const [category, setCategory] = useState<IncomeCategory>('Grants');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');

  const handleCreateIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || amount <= 0) return;

    onAddOtherIncome({
      source,
      category,
      amount,
      date,
      paymentMethod,
      referenceNumber: referenceNumber || `INC-REF-${Math.floor(10000 + Math.random() * 90000)}`,
      description: description || `${category} received from ${source}`,
      notes,
    });

    setIsAddModalOpen(false);
    setSource('');
    setAmount(0);
    setDescription('');
    setNotes('');
    setReferenceNumber('');
  };

  const filteredIncomes = useMemo(() => {
    return otherIncomes.filter((inc) => {
      const matchSearch =
        inc.incomeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inc.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = selectedCategory === 'all' || inc.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [otherIncomes, searchQuery, selectedCategory]);

  const totalOtherIncome = otherIncomes.reduce((acc, inc) => acc + inc.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <DollarSign className="w-6 h-6 text-emerald-600" />
            <span>Other Income Ledger</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track grants, treasury yields, consulting retainers, and non-operating revenue inflows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record Other Income</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-mono font-bold text-slate-500 uppercase">Total Other Income</div>
          <div className="text-xl font-black text-emerald-700 font-mono-data mt-1">
            {formatCurrencyAmount(totalOtherIncome, companyProfile.currencySymbol)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{otherIncomes.length} recorded inflows</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-mono font-bold text-blue-600 uppercase">Top Income Source</div>
          <div className="text-base font-bold text-slate-900 mt-1 truncate">
            {otherIncomes[0]?.source || 'None'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {otherIncomes[0] ? formatCurrencyAmount(otherIncomes[0].amount, companyProfile.currencySymbol) : '₦0.00'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-mono font-bold text-purple-600 uppercase">Active Categories</div>
          <div className="text-xl font-black text-purple-700 font-mono-data mt-1">
            {new Set(otherIncomes.map((i) => i.category)).size} Stream Types
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Diversified Cashflows</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by source, reference number, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Stream Categories</option>
            {INCOME_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 font-bold">Voucher #</th>
                <th className="py-3.5 px-4 font-bold">Source / Origin</th>
                <th className="py-3.5 px-4 font-bold">Category</th>
                <th className="py-3.5 px-4 font-bold">Date Received</th>
                <th className="py-3.5 px-4 font-bold">Ref #</th>
                <th className="py-3.5 px-4 font-bold text-right">Amount</th>
                {onDeleteOtherIncome && <th className="py-3.5 px-4 font-bold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIncomes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-xs">No other income records found.</p>
                  </td>
                </tr>
              ) : (
                filteredIncomes.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">
                      {inc.incomeNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{inc.source}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{inc.description}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {inc.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{inc.date}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{inc.referenceNumber}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700 text-sm">
                      {formatCurrencyAmount(inc.amount, companyProfile.currencySymbol)}
                    </td>
                    {onDeleteOtherIncome && (
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onDeleteOtherIncome(inc.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                          title="Delete Income Record"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <span>Log Non-Operating Revenue</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIncome} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Source / Entity</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. World Bank Grant, Treasury Yield, Asset Buyer"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={amount || ''}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date Received</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as IncomeCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                  >
                    {INCOME_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Bank Cheque</option>
                    <option value="credit_card">Card</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reference / Transaction ID</label>
                <input
                  type="text"
                  placeholder="e.g. GRANT-2026-09"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Short description of revenue origin..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Save Inflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
