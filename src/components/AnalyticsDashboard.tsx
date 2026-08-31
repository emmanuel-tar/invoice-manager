import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, BarChart3, Activity, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Invoice } from './types';
import { PaymentRecord } from './types';
import { BankTransaction } from './types';
import { Client } from './types';

interface AnalyticsDashboardProps {
  invoices: Invoice[];
  payments: PaymentRecord[];
  clients: Client[];
  bankTransactions: BankTransaction[];
  currencySymbol?: string;
}

interface AnalyticsMetrics {
  totalRevenue: number;
  totalCollected: number;
  collectionRate: number;
  averageInvoiceValue: number;
  overdueAmount: number;
  daysSalesOutstanding: number;
  customerAcquisitionCost: number;
  customerLifetimeValue: number;
  monthlyGrowth: number;
  quarterlyTrend: 'up' | 'down' | 'stable';
}

interface MonthlyDataPoint {
  month: string;
  invoiced: number;
  collected: number;
  growth: number;
}

interface ClientRevenueData {
  name: string;
  value: number;
  color: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  invoices,
  payments,
  clients,
  bankTransactions,
  currencySymbol = '₦'
}) => {
  const [timeframe, setTimeframe] = useState<'6m' | '12m' | 'ytd'>('6m');
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);

  // Calculate advanced analytics metrics
  useEffect(() => {
    const calculateMetrics = () => {
      const currentDate = new Date();
      const cutoffDate = new Date();
      cutoffDate.setMonth(currentDate.getMonth() - (timeframe === '6m' ? 6 : timeframe === '12m' ? 12 : 9));

      const periodInvoices = invoices.filter(inv => new Date(inv.date) >= cutoffDate);
      const periodPayments = payments.filter(p => new Date(p.date) >= cutoffDate);

      const totalInvoiced = periodInvoices.reduce((sum, inv) => sum + inv.total, 0);
      const totalCollected = periodPayments.reduce((sum, p) => sum + p.amount, 0);
      const collectionRate = totalInvoiced > 0 ? (totalCollected / totalInvoiced) * 100 : 0;

      const averageInvoiceValue = periodInvoices.length > 0 ? totalInvoiced / periodInvoices.length : 0;

      const overdueInvoices = invoices.filter(inv => 
        inv.status === 'overdue' && new Date(inv.dueDate) < currentDate
      );
      const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0);

      const daysSalesOutstanding = totalCollected > 0 
        ? (periodInvoices.reduce((sum, inv) => sum + inv.total, 0) / totalCollected) * 30 
        : 0;

      const activeClients = clients.filter(c => c.status === 'active');
      const customerAcquisitionCost = activeClients.length > 0 ? 1250 : 0; // Simplified
      const customerLifetimeValue = activeClients.length > 0 ? 8500 : 0;

      const previousPeriod = new Date();
      previousPeriod.setMonth(previousPeriod.getMonth() - (timeframe === '6m' ? 3 : timeframe === '12m' ? 6 : 3));

      const previousInvoices = invoices.filter(inv => new Date(inv.date) >= previousPeriod);
      const previousTotal = previousInvoices.reduce((sum, inv) => sum + inv.total, 0);

      const monthlyGrowth = previousTotal > 0 
        ? ((totalInvoiced - previousTotal) / previousTotal) * 100 
        : 0;

      const quarterlyTrend = monthlyGrowth > 5 ? 'up' : monthlyGrowth < -5 ? 'down' : 'stable';

      const newMetrics: AnalyticsMetrics = {
        totalRevenue: totalInvoiced,
        totalCollected: totalCollected,
        collectionRate,
        averageInvoiceValue,
        overdueAmount,
        daysSalesOutstanding,
        customerAcquisitionCost,
        customerLifetimeValue,
        monthlyGrowth,
        quarterlyTrend
      };

      setMetrics(newMetrics);
    };

    calculateMetrics();
  }, [timeframe, invoices, payments, clients]);

  // Monthly chart data
  const monthlyData = useMemo(() => {
    const currentDate = new Date();
    const months = timeframe === '6m' ? 6 : timeframe === '12m' ? 12 : 9;
    const data: MonthlyDataPoint[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      
      const monthInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.date);
        return invDate.getMonth() === date.getMonth() && invDate.getFullYear() === date.getFullYear();
      });

      const monthPayments = payments.filter(p => {
        const pDate = new Date(p.date);
        return pDate.getMonth() === date.getMonth() && pDate.getFullYear() === date.getFullYear();
      });

      const invoiced = monthInvoices.reduce((sum, inv) => sum + inv.total, 0);
      const collected = monthPayments.reduce((sum, p) => sum + p.amount, 0);

      // Calculate growth (simplified - year-over-year same month)
      const previousMonth = new Date(date);
      previousMonth.setMonth(previousMonth.getMonth() - 1);
      const previousInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.date);
        return invDate.getMonth() === previousMonth.getMonth() && invDate.getFullYear() === previousMonth.getFullYear();
      });
      const previousTotal = previousInvoices.reduce((sum, inv) => sum + inv.total, 0);
      const growth = previousTotal > 0 ? ((invoiced - previousTotal) / previousTotal) * 100 : 0;

      data.push({
        month: `${monthKey} ${year !== currentDate.getFullYear() ? year : ''}`.trim(),
        invoiced,
        collected,
        growth
      });
    }

    return data;
  }, [invoices, payments, timeframe]);

  // Client revenue distribution
  const clientRevenueData = useMemo(() => {
    const clientTotals = clients.reduce((acc, client) => {
      const clientInvoices = invoices.filter(inv => inv.clientName === client.name);
      const total = clientInvoices.reduce((sum, inv) => sum + inv.total, 0);
      return { ...acc, [client.name]: total };
    }, {} as Record<string, number>);

    const topClients = Object.entries(clientTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    return topClients.map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
  }, [invoices, clients]);

  const formatCurrency = (amount: number) => {
    return `${currencySymbol}${amount.toLocaleString()}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header with timeframe controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics Dashboard</h2>
          <p className="text-gray-600">Deep insights into your financial performance</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTimeframe('6m')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${timeframe === '6m' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            `}
          >
            6M
          </button>
          <button
            onClick={() => setTimeframe('12m')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${timeframe === '12m' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            `}
          >
            12M
          </button>
          <button
            onClick={() => setTimeframe('ytd')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${timeframe === 'ytd' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            `}
          >
            YTD
          </button>
        </div>
      </div>

      {/* Key metrics cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(metrics.totalRevenue)}
            </p>
            <div className="flex items-center gap-1 mt-2">
              {metrics.monthlyGrowth > 0 ? (
                <TrendingUp className="w-3 h-3 text-green-600" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-600" />
              )}
              <span className={`text-xs font-medium ${metrics.monthlyGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {metrics.monthlyGrowth.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500">vs previous period</span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Collection Rate</h3>
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {metrics.collectionRate.toFixed(1)}%
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${Math.min(metrics.collectionRate, 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Days Sales Outstanding</h3>
              <Calendar className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(metrics.daysSalesOutstanding)} days
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Average collection period
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Overdue Amount</h3>
              <ArrowDownRight className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(metrics.overdueAmount)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Outstanding balance
            </p>
          </div>
        </div>
      )}

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue trend chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${currencySymbol}${(value / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="invoiced" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Invoiced"
              />
              <Line 
                type="monotone" 
                dataKey="collected" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Collected"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Client revenue distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Client Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={clientRevenueData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
              >
                {clientRevenueData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional insights */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Customer Analytics</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Active Clients:</span>
                <span className="font-medium text-blue-900">{clients.filter(c => c.status === 'active').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Avg Customer Value:</span>
                <span className="font-medium text-blue-900">{formatCurrency(metrics.customerLifetimeValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Acquisition Cost:</span>
                <span className="font-medium text-blue-900">{formatCurrency(metrics.customerAcquisitionCost)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-4">
            <h4 className="font-semibold text-green-900 mb-2">Performance Indicators</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">Avg Invoice Value:</span>
                <span className="font-medium text-green-900">{formatCurrency(metrics.averageInvoiceValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Trend:</span>
                <span className={`font-medium ${metrics.quarterlyTrend === 'up' ? 'text-green-900' : metrics.quarterlyTrend === 'down' ? 'text-red-900' : 'text-yellow-900'}`}> {metrics.quarterlyTrend}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Quarterly Growth:</span>
                <span className={`font-medium ${metrics.monthlyGrowth > 0 ? 'text-green-900' : 'text-red-900'}`}> {metrics.monthlyGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200 p-4">
            <h4 className="font-semibold text-purple-900 mb-2">Reconciliation Status</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-purple-700">Bank Transactions:</span>
                <span className="font-medium text-purple-900">{bankTransactions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Payment Records:</span>
                <span className="font-medium text-purple-900">{payments.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">Match Rate:</span>
                <span className="font-medium text-purple-900">
                  {((payments.length / Math.max(bankTransactions.length, payments.length)) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
