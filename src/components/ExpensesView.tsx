import React, { useState, useMemo } from 'react';
import { 
  TrendingDown, 
  Plus, 
  Search, 
  Tag, 
  CheckCircle2, 
  Clock, 
  X, 
  Building2, 
  CreditCard, 
  Receipt, 
  Filter,
  FileText,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { Expense, ExpenseCategory, ExpenseStatus, PaymentMethod, CompanyProfile } from '../types';
import { formatCurrencyAmount } from '../data/currencies';

interface ExpensesViewProps {
  expenses: Expense[];
  companyProfile: CompanyProfile;
  onAddExpense: (expense: Omit<Expense, 'id' | 'expenseNumber'>) => void;
  onDeleteExpense?: (id: string) => void;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Rent & Utilities',
  'Software & Subscriptions',
  'Marketing & Ads',
  'Salaries & Wages',
  'Travel & Logistics',
  'Office Supplies',
  'Maintenance & Repairs',
  'Professional Services',
  'Taxes & Levies',
  'Other',
];

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  companyProfile,
  onAddExpense,
  onDeleteExpense,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [category, setCategory] = useState<ExpenseCategory>('Software & Subscriptions');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [vendor, setVendor] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
  const [taxDeductible, setTaxDeductible] = useState(true);
  const [status, setStatus] = useState<ExpenseStatus>('approved');
  const [notes, setNotes] = useState('');

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor.trim() || amount <= 0) return;

    onAddExpense({
      category,
      vendor,
      amount,
      date,
      paymentMethod,
      taxDeductible,
      status,
      notes: notes || `${category} payment to ${vendor}`,
    });

    setIsAddModalOpen(false);
    setVendor('');
    setAmount(0);
    setNotes('');
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchSearch =
        exp.expenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exp.notes && exp.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCategory = selectedCategory === 'all' || exp.category === selectedCategory;
      const matchStatus = selectedStatus === 'all' || exp.status === selectedStatus;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [expenses, searchQuery, selectedCategory, selectedStatus]);

  const totalExpenseAmount = expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const taxDeductibleAmount = expenses.filter((exp) => exp.taxDeductible).reduce((acc, exp) => acc + exp.amount, 0);
  const approvedCount = expenses.filter((exp) => exp.status === 'approved').length;

  const getCategoryBadge = (cat: ExpenseCategory) => {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        {cat}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <TrendingDown className="w-6 h-6 text-rose-600" />
            <span>Operating Expenses</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Record business costs, monitor tax deductions, and categorize vendor payments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-mono font-bold text-slate-500 uppercase">Total Expenses</div>
          <div className="text-xl font-black text-rose-700 font-mono-data mt-1">
            {formatCurrencyAmount(totalExpenseAmount, companyProfile.currencySymbol)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{expenses.length} total entries</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-mono font-bold text-emerald-600 uppercase">Tax Deductible</div>
          <div className="text-xl font-black text-emerald-700 font-mono-data mt-1">
            {formatCurrencyAmount(taxDeductibleAmount, companyProfile.currencySymbol)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {Math.round((taxDeductibleAmount / (totalExpenseAmount || 1)) * 100)}% of total spend
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-mono font-bold text-blue-600 uppercase">Approved Records</div>
          <div className="text-xl font-black text-blue-700 font-mono-data mt-1">
            {approvedCount} of {expenses.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Audited & Verified</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by vendor, expense #, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="reimbursed">Reimbursed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 font-bold">Expense #</th>
                <th className="py-3.5 px-4 font-bold">Vendor / Payee</th>
                <th className="py-3.5 px-4 font-bold">Category</th>
                <th className="py-3.5 px-4 font-bold">Date</th>
                <th className="py-3.5 px-4 font-bold">Payment Method</th>
                <th className="py-3.5 px-4 font-bold text-right">Amount</th>
                <th className="py-3.5 px-4 font-bold text-center">Status</th>
                {onDeleteExpense && <th className="py-3.5 px-4 font-bold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <TrendingDown className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-xs">No expense records found.</p>
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-rose-600">
                      {exp.expenseNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{exp.vendor}</div>
                      {exp.notes && <div className="text-[11px] text-slate-400 truncate max-w-xs">{exp.notes}</div>}
                    </td>
                    <td className="py-3.5 px-4">{getCategoryBadge(exp.category)}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{exp.date}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 capitalize">
                      {exp.paymentMethod.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-700 text-sm">
                      {formatCurrencyAmount(exp.amount, companyProfile.currencySymbol)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          exp.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : exp.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {exp.status}
                      </span>
                    </td>
                    {onDeleteExpense && (
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onDeleteExpense(exp.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                          title="Delete Expense"
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

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-600" />
                <span>Record New Expense</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Vendor / Payee Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Cloud, Shell Petroleum, OfficeMart"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-rose-500"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Expense Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-rose-500"
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-rose-500"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit_card">Corporate Card</option>
                    <option value="cash">Petty Cash</option>
                    <option value="pos">POS Terminal</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Audit Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ExpenseStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-rose-500"
                  >
                    <option value="approved">Approved</option>
                    <option value="pending">Pending Approval</option>
                    <option value="reimbursed">Reimbursed</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="tax-deductible-check"
                  checked={taxDeductible}
                  onChange={(e) => setTaxDeductible(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="tax-deductible-check" className="font-semibold text-slate-700 cursor-pointer">
                  Eligible for Corporate Tax Deduction
                </label>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Purpose of expense or reference details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-rose-500"
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
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
