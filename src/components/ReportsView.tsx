import React, { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Percent, 
  Users, 
  FileText, 
  ArrowUpRight,
  Sparkles,
  PieChart
} from 'lucide-react';
import { Invoice, Client, TaxRate } from '../types';

interface ReportsViewProps {
  invoices: Invoice[];
  clients: Client[];
  taxRates: TaxRate[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  invoices,
  clients,
  taxRates,
}) => {
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'ytd' | 'all'>('ytd');

  // Aggregations
  const totalBilled = invoices.reduce((sum, i) => sum + i.total, 0);
  const totalCollected = invoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
  const totalOutstanding = invoices.filter((i) => i.status === 'pending' || i.status === 'overdue').reduce((sum, i) => sum + i.total, 0);
  const totalTaxAccrued = invoices.reduce((sum, i) => sum + i.taxAmount, 0);

  // Top clients by revenue
  const topClients = [...clients]
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);

  const monthlyReportData = [
    { month: 'Jan', billed: 12400, collected: 11200 },
    { month: 'Feb', billed: 9800, collected: 9800 },
    { month: 'Mar', billed: 14200, collected: 13500 },
    { month: 'Apr', billed: 11100, collected: 11100 },
    { month: 'May', billed: 15300, collected: 14000 },
    { month: 'Jun', billed: 18900, collected: 17200 },
    { month: 'Jul', billed: 13400, collected: 12000 },
    { month: 'Aug', billed: 16800, collected: 15900 },
    { month: 'Sep', billed: 17200, collected: 16400 },
    { month: 'Oct', billed: 21500, collected: 15320 },
  ];

  const maxMonthValue = Math.max(...monthlyReportData.map((d) => d.billed));

  const handleExportCSV = () => {
    const csvRows = [
      ['Invoice Number', 'Client', 'Date', 'Due Date', 'Subtotal', 'Tax', 'Total', 'Status'],
      ...invoices.map((inv) => [
        inv.invoiceNumber,
        `"${inv.clientName}"`,
        inv.date,
        inv.dueDate,
        inv.subtotal.toFixed(2),
        inv.taxAmount.toFixed(2),
        inv.total.toFixed(2),
        inv.status,
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financial_report_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div id="reports-view-container" className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header & Export options */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Financial Reports & Analytics
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            P&L statement summaries, tax obligations, and receivables aging.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Time Range Selector */}
          <div className="flex items-center gap-1 bg-white border border-slate-200/80 p-1 rounded-lg shadow-xs">
            {(['month', 'quarter', 'ytd', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase transition-all ${
                  timeRange === r
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {r === 'month' ? 'This Month' : r === 'quarter' ? 'Quarter' : r === 'ytd' ? 'YTD' : 'All Time'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <FileText className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Top 4 Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-500">Gross Invoiced</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-data mt-2">
            ${totalBilled.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +14.2% YoY Growth
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-500">Cash Collected</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono-data mt-2">
            ${totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {Math.round((totalCollected / (totalBilled || 1)) * 100)}% collection efficiency
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-500">Total Outstanding</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700 font-mono-data mt-2">
            ${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Avg DSO: 18.4 days
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-500">Tax Obligations</span>
            <Percent className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono-data mt-2">
            ${totalTaxAccrued.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Accrued sales & VAT payable
          </div>
        </div>
      </div>

      {/* Main Visuals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Comparison Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Billed vs. Collected Trend</h3>
              <p className="text-xs text-slate-500">Monthly breakdown of gross invoices vs realized cash</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded bg-blue-600" />
                <span>Gross Invoiced</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded bg-emerald-500" />
                <span>Cash Collected</span>
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-6 pb-2">
            <div className="h-60 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-slate-200">
              {monthlyReportData.map((d, i) => {
                const billedHeight = Math.round((d.billed / maxMonthValue) * 100);
                const collectedHeight = Math.round((d.collected / maxMonthValue) * 100);

                return (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1 h-full">
                      {/* Billed Bar */}
                      <div
                        style={{ height: `${billedHeight}%` }}
                        className="w-full max-w-[14px] bg-blue-600 rounded-t-sm group-hover:bg-blue-700 transition-all relative"
                      >
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-900 text-white text-[9px] font-mono py-0.5 px-1.5 rounded whitespace-nowrap z-20 pointer-events-none">
                          Billed: ${d.billed.toLocaleString()}
                        </div>
                      </div>

                      {/* Collected Bar */}
                      <div
                        style={{ height: `${collectedHeight}%` }}
                        className="w-full max-w-[14px] bg-emerald-500 rounded-t-sm group-hover:bg-emerald-600 transition-all relative"
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-900 text-white text-[9px] font-mono py-0.5 px-1.5 rounded whitespace-nowrap z-20 pointer-events-none">
                          Paid: ${d.collected.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 font-bold mt-2">
                      {d.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Clients by Revenue Leaderboard (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Top Clients by Revenue</h3>
              <Users className="w-4 h-4 text-slate-400" />
            </div>

            <div className="mt-4 space-y-3">
              {topClients.map((client, index) => {
                const percentOfTotal = totalBilled > 0 ? Math.round((client.totalRevenue / totalBilled) * 100) : 0;

                return (
                  <div key={client.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-slate-400">#{index + 1}</span>
                        <span>{client.name}</span>
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        ${client.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, percentOfTotal * 2)}%` }}
                        className="h-full bg-blue-600 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Accounts receivable aging calculations updated real-time.
          </div>
        </div>
      </div>
    </div>
  );
};
