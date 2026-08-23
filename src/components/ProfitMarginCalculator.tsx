import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent, 
  Package, 
  Sliders, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  Layers, 
  ArrowRight, 
  Target, 
  RefreshCw,
  ShoppingBag,
  HelpCircle,
  BarChart3
} from 'lucide-react';
import { Invoice, InventoryItem, PurchaseRecord } from '../types';
import { formatCurrencyAmount } from '../data/currencies';

interface ProfitMarginCalculatorProps {
  invoices: Invoice[];
  items: InventoryItem[];
  purchases?: PurchaseRecord[];
  currencySymbol?: string;
  onNavigateToInvoices?: () => void;
  onNavigateToItems?: () => void;
  onNavigateToPurchases?: () => void;
}

export type TimeFilter = 'all' | 'this_month' | 'last_30_days' | 'quarter' | 'year';
export type CostMethod = 'catalog_cogs' | 'purchases_ledger';

export const ProfitMarginCalculator: React.FC<ProfitMarginCalculatorProps> = ({
  invoices,
  items,
  purchases = [],
  currencySymbol = '₦',
  onNavigateToInvoices,
  onNavigateToItems,
  onNavigateToPurchases,
}) => {
  // Calculator Interactive States
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [costMethod, setCostMethod] = useState<CostMethod>('catalog_cogs');
  const [defaultCostRatio, setDefaultCostRatio] = useState<number>(35); // Fallback cost % of selling price if item has no costPrice
  const [costAdjustmentPercent, setCostAdjustmentPercent] = useState<number>(0); // What-if cost variance: -20% to +30%
  const [targetMarginGoal, setTargetMarginGoal] = useState<number>(55); // Target gross margin %
  const [showItemizedBreakdown, setShowItemizedBreakdown] = useState<boolean>(false);
  const [showScenarioPlanner, setShowScenarioPlanner] = useState<boolean>(false);
  const [itemSearchQuery, setItemSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'profit' | 'revenue' | 'margin' | 'qty'>('profit');

  // Filter paid invoices based on time frame
  const filteredPaidInvoices = useMemo(() => {
    const paid = invoices.filter((i) => i.status === 'paid');
    const now = new Date();

    if (timeFilter === 'all') return paid;

    return paid.filter((inv) => {
      const invDate = new Date(inv.date || inv.createdAt);
      if (isNaN(invDate.getTime())) return true;

      if (timeFilter === 'this_month') {
        return (
          invDate.getFullYear() === now.getFullYear() &&
          invDate.getMonth() === now.getMonth()
        );
      }
      if (timeFilter === 'last_30_days') {
        const diffDays = (now.getTime() - invDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 0 && diffDays <= 30;
      }
      if (timeFilter === 'quarter') {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const invQuarter = Math.floor(invDate.getMonth() / 3);
        return (
          invDate.getFullYear() === now.getFullYear() &&
          currentQuarter === invQuarter
        );
      }
      if (timeFilter === 'year') {
        return invDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [invoices, timeFilter]);

  // Catalog item lookup map for fast O(1) matching
  const catalogItemMap = useMemo(() => {
    const map = new Map<string, InventoryItem>();
    items.forEach((item) => {
      map.set(item.name.toLowerCase().trim(), item);
      if (item.sku) map.set(item.sku.toLowerCase().trim(), item);
      map.set(item.id, item);
    });
    return map;
  }, [items]);

  // Itemized aggregation of all sold items in paid invoices
  const itemizedSalesAnalysis = useMemo(() => {
    const itemMap = new Map<string, {
      name: string;
      sku: string;
      category: string;
      qtySold: number;
      revenue: number;
      unitCost: number;
      totalCost: number;
      grossProfit: number;
      marginPercent: number;
      isExactMatch: boolean;
    }>();

    filteredPaidInvoices.forEach((inv) => {
      inv.items.forEach((line) => {
        const descKey = line.description.toLowerCase().trim();
        const matchedItem = catalogItemMap.get(descKey) || 
          Array.from(catalogItemMap.values()).find((catItem) => 
            descKey.includes(catItem.name.toLowerCase()) || 
            catItem.name.toLowerCase().includes(descKey)
          );

        // Determine unit cost
        let unitCost = 0;
        let isExact = false;
        if (matchedItem && typeof matchedItem.costPrice === 'number' && matchedItem.costPrice > 0) {
          unitCost = matchedItem.costPrice;
          isExact = true;
        } else if (matchedItem && matchedItem.unitPrice > 0) {
          unitCost = matchedItem.unitPrice * (defaultCostRatio / 100);
        } else {
          unitCost = line.unitPrice * (defaultCostRatio / 100);
        }

        // Apply scenario cost adjustment multiplier
        const adjustedUnitCost = unitCost * (1 + costAdjustmentPercent / 100);
        const lineRevenue = line.total || (line.qty * line.unitPrice);
        const lineTotalCost = line.qty * adjustedUnitCost;

        const groupKey = matchedItem ? matchedItem.id : line.description;

        if (itemMap.has(groupKey)) {
          const existing = itemMap.get(groupKey)!;
          existing.qtySold += line.qty;
          existing.revenue += lineRevenue;
          existing.totalCost += lineTotalCost;
          existing.grossProfit = existing.revenue - existing.totalCost;
          existing.marginPercent = existing.revenue > 0 ? (existing.grossProfit / existing.revenue) * 100 : 0;
        } else {
          const profit = lineRevenue - lineTotalCost;
          const margin = lineRevenue > 0 ? (profit / lineRevenue) * 100 : 0;

          itemMap.set(groupKey, {
            name: matchedItem ? matchedItem.name : line.description,
            sku: matchedItem ? matchedItem.sku : 'N/A',
            category: matchedItem ? matchedItem.category : 'General Services',
            qtySold: line.qty,
            revenue: lineRevenue,
            unitCost: adjustedUnitCost,
            totalCost: lineTotalCost,
            grossProfit: profit,
            marginPercent: margin,
            isExactMatch: isExact,
          });
        }
      });
    });

    return Array.from(itemMap.values());
  }, [filteredPaidInvoices, catalogItemMap, defaultCostRatio, costAdjustmentPercent]);

  // Purchases ledger calculation
  const totalPurchasesLedgerCost = useMemo(() => {
    const sum = purchases.reduce((acc, p) => acc + p.subtotal, 0);
    return sum * (1 + costAdjustmentPercent / 100);
  }, [purchases, costAdjustmentPercent]);

  // Core Financial Aggregates
  const totalRevenue = useMemo(() => {
    return filteredPaidInvoices.reduce((sum, i) => sum + i.total, 0);
  }, [filteredPaidInvoices]);

  const totalCatalogCOGS = useMemo(() => {
    return itemizedSalesAnalysis.reduce((sum, item) => sum + item.totalCost, 0);
  }, [itemizedSalesAnalysis]);

  // Selected Cost based on method
  const totalItemPurchaseCost = costMethod === 'catalog_cogs' ? totalCatalogCOGS : totalPurchasesLedgerCost;

  // Gross Profit = Total Paid Invoice Revenue - Item Purchase Costs
  const totalGrossProfit = totalRevenue - totalItemPurchaseCost;
  
  // Gross Profit Margin (%) = (Gross Profit / Revenue) * 100
  const grossProfitMargin = totalRevenue > 0 ? (totalGrossProfit / totalRevenue) * 100 : 0;

  // Markup (%) = (Gross Profit / Purchase Cost) * 100
  const markupPercent = totalItemPurchaseCost > 0 ? (totalGrossProfit / totalItemPurchaseCost) * 100 : 0;

  // Target Margin Calculations
  const requiredRevenueForTarget = targetMarginGoal < 100 && targetMarginGoal >= 0
    ? totalItemPurchaseCost / (1 - targetMarginGoal / 100)
    : 0;
  const revenueDifferenceForTarget = requiredRevenueForTarget - totalRevenue;

  // Filtered & Sorted Itemized Table
  const filteredItemizedList = useMemo(() => {
    return itemizedSalesAnalysis
      .filter((it) => 
        it.name.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
        it.sku.toLowerCase().includes(itemSearchQuery.toLowerCase()) ||
        it.category.toLowerCase().includes(itemSearchQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (sortBy === 'profit') return b.grossProfit - a.grossProfit;
        if (sortBy === 'revenue') return b.revenue - a.revenue;
        if (sortBy === 'margin') return b.marginPercent - a.marginPercent;
        if (sortBy === 'qty') return b.qtySold - a.qtySold;
        return 0;
      });
  }, [itemizedSalesAnalysis, itemSearchQuery, sortBy]);

  // Reset simulator
  const handleResetSimulator = () => {
    setCostAdjustmentPercent(0);
    setDefaultCostRatio(35);
  };

  return (
    <div 
      id="profit-margin-calculator-card" 
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 md:p-7 space-y-6 transition-all"
    >
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Profit Margin Calculator
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                COGS Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Estimates total gross profit by subtracting item purchase costs from paid invoice revenue.
            </p>
          </div>
        </div>

        {/* Time Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/80 self-start sm:self-auto overflow-x-auto text-xs font-semibold">
          {[
            { id: 'all' as TimeFilter, label: 'All Time' },
            { id: 'this_month' as TimeFilter, label: 'This Month' },
            { id: 'last_30_days' as TimeFilter, label: 'Last 30d' },
            { id: 'quarter' as TimeFilter, label: 'Quarter' },
            { id: 'year' as TimeFilter, label: 'Year' },
          ].map((tf) => (
            <button
              key={tf.id}
              onClick={() => setTimeFilter(tf.id)}
              className={`px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap ${
                timeFilter === tf.id
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main KPI Matrix (4-Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Paid Invoice Revenue */}
        <div 
          id="profit-calc-revenue-card"
          className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 hover:border-slate-300 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
              Total Paid Revenue
            </span>
            <div className="p-1.5 rounded-lg bg-blue-100/80 text-blue-700">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 font-mono-data">
              {formatCurrencyAmount(totalRevenue, currencySymbol)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>{filteredPaidInvoices.length} Paid Invoices</span>
              <span className="text-emerald-600 font-semibold font-mono">Settled</span>
            </div>
          </div>
        </div>

        {/* 2. Item Purchase Costs (COGS) */}
        <div 
          id="profit-calc-cogs-card"
          className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 hover:border-slate-300 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
              Item Purchase Costs
            </span>
            <div className="p-1.5 rounded-lg bg-amber-100/80 text-amber-700">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-900 font-mono-data">
              {formatCurrencyAmount(totalItemPurchaseCost, currencySymbol)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
              <span>
                {costMethod === 'catalog_cogs' ? 'Catalog COGS' : 'Purchases Ledger'}
              </span>
              {costAdjustmentPercent !== 0 && (
                <span className={`text-[10px] font-bold font-mono px-1 rounded ${costAdjustmentPercent > 0 ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {costAdjustmentPercent > 0 ? `+${costAdjustmentPercent}%` : `${costAdjustmentPercent}%`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3. Estimated Gross Profit */}
        <div 
          id="profit-calc-gross-profit-card"
          className={`p-4 rounded-xl border space-y-2 transition-all ${
            totalGrossProfit >= 0 
              ? 'bg-emerald-50/60 border-emerald-200/90 text-emerald-950' 
              : 'bg-rose-50/60 border-rose-200/90 text-rose-950'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono opacity-80">
              Total Gross Profit
            </span>
            <div className={`p-1.5 rounded-lg ${totalGrossProfit >= 0 ? 'bg-emerald-200/80 text-emerald-800' : 'bg-rose-200/80 text-rose-800'}`}>
              {totalGrossProfit >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            </div>
          </div>
          <div>
            <div className={`text-2xl font-black font-mono-data ${totalGrossProfit >= 0 ? 'text-emerald-900' : 'text-rose-900'}`}>
              {formatCurrencyAmount(totalGrossProfit, currencySymbol)}
            </div>
            <div className="text-[11px] opacity-80 mt-1 flex items-center justify-between">
              <span>Revenue - Purchase Costs</span>
              <span className="font-mono font-bold">
                Markup: {markupPercent.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* 4. Gross Profit Margin (%) */}
        <div 
          id="profit-calc-margin-card"
          className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-2 shadow-xs"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
              Gross Profit Margin
            </span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-emerald-400">
              <Percent className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-400 font-mono-data">
                {grossProfitMargin.toFixed(1)}%
              </span>
              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                grossProfitMargin >= 50 
                  ? 'bg-emerald-500/20 text-emerald-300' 
                  : grossProfitMargin >= 30 
                  ? 'bg-amber-500/20 text-amber-300' 
                  : 'bg-rose-500/20 text-rose-300'
              }`}>
                {grossProfitMargin >= 50 ? 'Strong' : grossProfitMargin >= 30 ? 'Moderate' : 'Low'}
              </span>
            </div>

            {/* Visual Gauge Bar */}
            <div className="mt-2.5 w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
              <div 
                className={`h-full transition-all duration-500 ${
                  grossProfitMargin >= 50 ? 'bg-emerald-400' : grossProfitMargin >= 30 ? 'bg-amber-400' : 'bg-rose-400'
                }`}
                style={{ width: `${Math.min(Math.max(grossProfitMargin, 0), 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between font-mono">
              <span>0%</span>
              <span>Target: {targetMarginGoal}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Scenario Simulator Accordion */}
      <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-3.5 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-500" />
            <span className="font-bold text-slate-900">Calculation Configuration & Cost Basis:</span>
            <div className="inline-flex rounded-lg bg-white border border-slate-200 p-0.5">
              <button
                type="button"
                onClick={() => setCostMethod('catalog_cogs')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  costMethod === 'catalog_cogs'
                    ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Item Catalog Cost Price (COGS)
              </button>
              {purchases.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCostMethod('purchases_ledger')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    costMethod === 'purchases_ledger'
                      ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Purchases Ledger ({purchases.length})
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowScenarioPlanner(!showScenarioPlanner)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                showScenarioPlanner 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-emerald-600" />
              <span>What-If Scenario & Target Margin</span>
              {showScenarioPlanner ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => setShowItemizedBreakdown(!showItemizedBreakdown)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                showItemizedBreakdown 
                  ? 'bg-blue-50 border-blue-300 text-blue-800 font-bold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Itemized Line-Item Breakdown ({itemizedSalesAnalysis.length})</span>
              {showItemizedBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expanded Scenario Simulator */}
        {showScenarioPlanner && (
          <div className="pt-3 border-t border-slate-200/80 space-y-4 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cost Variance Slider */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Purchase Cost Variance Simulator</span>
                  </span>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                    costAdjustmentPercent === 0 
                      ? 'bg-slate-100 text-slate-700' 
                      : costAdjustmentPercent > 0 
                      ? 'bg-rose-100 text-rose-800' 
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {costAdjustmentPercent > 0 ? `+${costAdjustmentPercent}% (Inflation)` : costAdjustmentPercent < 0 ? `${costAdjustmentPercent}% (Supplier Discount)` : 'Baseline (0%)'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Simulate how changes in supplier procurement prices or shipping costs impact your bottom line.
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-[11px] font-mono text-slate-400">-20%</span>
                  <input
                    type="range"
                    min="-20"
                    max="30"
                    step="1"
                    value={costAdjustmentPercent}
                    onChange={(e) => setCostAdjustmentPercent(Number(e.target.value))}
                    className="flex-1 accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <span className="text-[11px] font-mono text-slate-400">+30%</span>
                  {costAdjustmentPercent !== 0 && (
                    <button
                      type="button"
                      onClick={handleResetSimulator}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                      title="Reset to baseline"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Target Margin Goal Calculator */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="font-bold flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-blue-500" />
                    <span>Target Margin Goal Seeker</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="10"
                      max="95"
                      value={targetMarginGoal}
                      onChange={(e) => setTargetMarginGoal(Math.min(95, Math.max(5, Number(e.target.value))))}
                      className="w-14 px-2 py-0.5 text-right font-mono font-bold bg-slate-50 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="font-mono font-bold text-slate-700">%</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Calculates the required revenue to hit your target profit margin given current purchase costs.
                </p>
                <div className="p-2 bg-blue-50/70 border border-blue-200/70 rounded-lg flex items-center justify-between text-[11px]">
                  <span className="text-blue-900 font-medium">Required Revenue:</span>
                  <div className="text-right font-mono font-bold text-blue-950">
                    {formatCurrencyAmount(requiredRevenueForTarget, currencySymbol)}
                    <span className={`text-[10px] ml-1.5 ${revenueDifferenceForTarget > 0 ? 'text-amber-700 font-semibold' : 'text-emerald-700 font-semibold'}`}>
                      ({revenueDifferenceForTarget > 0 ? `+${formatCurrencyAmount(revenueDifferenceForTarget, currencySymbol)} needed` : 'Goal achieved!'})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Itemized Table Breakdown */}
        {showItemizedBreakdown && (
          <div className="pt-3 border-t border-slate-200/80 space-y-3 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-slate-600" />
                <span className="font-bold text-slate-900 text-xs">
                  Line-Item Profitability Breakdown ({filteredItemizedList.length} Items Sold)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Filter by item or SKU..."
                  value={itemSearchQuery}
                  onChange={(e) => setItemSearchQuery(e.target.value)}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs w-48 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                >
                  <option value="profit">Sort: Highest Profit</option>
                  <option value="revenue">Sort: Highest Revenue</option>
                  <option value="margin">Sort: Highest Margin %</option>
                  <option value="qty">Sort: Most Units Sold</option>
                </select>
              </div>
            </div>

            {filteredItemizedList.length > 0 ? (
              <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 max-h-72 custom-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/90 sticky top-0 border-b border-slate-200 text-slate-500 font-mono uppercase tracking-wider text-[10px] z-10">
                    <tr>
                      <th className="py-2.5 px-3 font-semibold">Item & SKU</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Qty Sold</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Revenue</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Unit Purchase Cost</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Total Purchase Cost</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Gross Profit</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Margin %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredItemizedList.map((item, idx) => (
                      <tr key={`${item.name}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2 px-3">
                          <div className="font-bold text-slate-900">{item.name}</div>
                          <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                            <span>{item.sku}</span>
                            <span>•</span>
                            <span>{item.category}</span>
                            {item.isExactMatch && (
                              <span className="text-[9px] px-1 bg-emerald-50 text-emerald-700 rounded font-semibold">
                                Verified Cost
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-3 text-center font-mono font-semibold text-slate-700">
                          {item.qtySold}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          {formatCurrencyAmount(item.revenue, currencySymbol)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-slate-600">
                          {formatCurrencyAmount(item.unitCost, currencySymbol)}
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-amber-900 font-semibold">
                          {formatCurrencyAmount(item.totalCost, currencySymbol)}
                        </td>
                        <td className={`py-2 px-3 text-right font-mono font-bold ${item.grossProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {formatCurrencyAmount(item.grossProfit, currencySymbol)}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            item.marginPercent >= 50 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : item.marginPercent >= 30 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {item.marginPercent.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
                No matching items sold in paid invoices for this selection.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Navigation Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Calculation is based on settled paid invoices. Unpaid or pending invoices are excluded to reflect realized gross profits.
          </span>
        </div>

        <div className="flex items-center gap-3">
          {onNavigateToItems && (
            <button
              type="button"
              onClick={onNavigateToItems}
              className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>Manage Item Costs in Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
