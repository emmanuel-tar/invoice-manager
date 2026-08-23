import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Repeat, 
  FileSpreadsheet, 
  Users, 
  Package, 
  BarChart3, 
  Settings, 
  Sparkles, 
  CreditCard,
  Receipt,
  Boxes,
  ShoppingBag,
  ShoppingCart,
  FileCheck2,
  DollarSign,
  TrendingDown,
  ChevronRight,
  ChevronDown,
  Layers,
  Plus,
  Truck,
  FileMinus,
  AlertTriangle
} from 'lucide-react';
import { NavigationTab } from '../types';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  invoiceCount: number;
  recurringCount?: number;
  estimateCount: number;
  lowStockCount: number;
  outOfStockCount?: number;
  saleOrderCount?: number;
  paymentCount?: number;
  purchaseCount?: number;
  deliveryNoteCount?: number;
  creditNoteCount?: number;
  hiddenTabs?: NavigationTab[];
  onOpenOnboarding: () => void;
}

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: any;
  badge?: React.ReactNode | string | number | null;
  badgeColor?: string;
  isAlert?: boolean;
  alertType?: 'warning' | 'danger';
  alertTooltip?: string;
  subItems?: { label: string; tab: NavigationTab }[];
}

interface NavGroup {
  groupTitle: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  invoiceCount,
  recurringCount = 0,
  estimateCount,
  lowStockCount,
  outOfStockCount = 0,
  saleOrderCount = 0,
  paymentCount = 0,
  purchaseCount = 0,
  deliveryNoteCount = 0,
  creditNoteCount = 0,
  hiddenTabs = [],
  onOpenOnboarding,
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    payments: true,
    purchases: true,
    estimates: true,
    delivery_notes: true,
    credit_notes: true,
  });

  const toggleSection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const navGroups: NavGroup[] = [
    {
      groupTitle: 'Sales & Billing',
      items: [
        {
          id: 'dashboard' as NavigationTab,
          label: 'Dashboard',
          icon: LayoutDashboard,
          badge: null,
        },
        {
          id: 'invoices' as NavigationTab,
          label: 'Invoices',
          icon: FileText,
          badge: invoiceCount > 0 ? invoiceCount : null,
        },
        {
          id: 'estimates' as NavigationTab,
          label: 'Estimates & Quotes',
          icon: FileSpreadsheet,
          badge: estimateCount > 0 ? estimateCount : null,
          subItems: [
            { label: 'Estimate List', tab: 'estimates' as NavigationTab },
            { label: 'Add New', tab: 'estimates' as NavigationTab },
            { label: 'Quick Estimate', tab: 'estimates' as NavigationTab },
          ]
        },
        {
          id: 'delivery_notes' as NavigationTab,
          label: 'Delivery Notes',
          icon: Truck,
          badge: deliveryNoteCount > 0 ? deliveryNoteCount : null,
          subItems: [
            { label: 'Delivery Note List', tab: 'delivery_notes' as NavigationTab },
            { label: 'Create Delivery Note', tab: 'delivery_notes' as NavigationTab },
          ]
        },
        {
          id: 'credit_notes' as NavigationTab,
          label: 'Credit Notes',
          icon: FileMinus,
          badge: creditNoteCount > 0 ? creditNoteCount : null,
          subItems: [
            { label: 'Credit Note List', tab: 'credit_notes' as NavigationTab },
            { label: 'Create Credit Note', tab: 'credit_notes' as NavigationTab },
          ]
        },
        {
          id: 'sale_orders' as NavigationTab,
          label: 'Sale Orders',
          icon: ShoppingBag,
          badge: saleOrderCount > 0 ? saleOrderCount : null,
        },
        {
          id: 'recurring' as NavigationTab,
          label: 'Recurring Schedules',
          icon: Repeat,
          badge: recurringCount > 0 ? recurringCount : null,
          badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
        },
      ]
    },
    {
      groupTitle: 'Payments & Receipts',
      items: [
        {
          id: 'payments' as NavigationTab,
          label: 'Payments',
          icon: CreditCard,
          badge: paymentCount > 0 ? paymentCount : null,
          subItems: [
            { label: 'All Payments', tab: 'payments' as NavigationTab },
            { label: 'Payment by Client', tab: 'payments' as NavigationTab },
            { label: 'Payment by Amount', tab: 'payments' as NavigationTab },
          ]
        },
        {
          id: 'receipts' as NavigationTab,
          label: 'Receipts',
          icon: Receipt,
          badge: null,
        },
      ]
    },
    {
      groupTitle: 'Purchases & Vendors',
      items: [
        {
          id: 'purchases' as NavigationTab,
          label: 'Purchases',
          icon: ShoppingCart,
          badge: purchaseCount > 0 ? purchaseCount : null,
          subItems: [
            { label: 'Purchase Record List', tab: 'purchases' as NavigationTab },
            { label: 'Add New Purchase Record', tab: 'purchases' as NavigationTab },
            { label: 'Add Purchase Return', tab: 'purchases' as NavigationTab },
          ]
        },
        {
          id: 'purchase_orders' as NavigationTab,
          label: 'Purchase Orders',
          icon: FileCheck2,
          badge: null,
          subItems: [
            { label: 'Purchase Order List', tab: 'purchase_orders' as NavigationTab },
            { label: 'Add Purchase Order', tab: 'purchase_orders' as NavigationTab },
          ]
        },
      ]
    },
    {
      groupTitle: 'Inventory & Operations',
      items: [
        {
          id: 'items' as NavigationTab,
          label: 'Items & Catalog',
          icon: Package,
          isAlert: lowStockCount > 0,
          alertType: outOfStockCount > 0 ? 'danger' : 'warning',
          alertTooltip: lowStockCount > 0 
            ? `${lowStockCount} item(s) below low-stock threshold${outOfStockCount > 0 ? ` (${outOfStockCount} out of stock)` : ''}`
            : undefined,
          badge: lowStockCount > 0 ? (
            <span
              id="badge-sidebar-low-stock"
              className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full shadow-xs transition-all whitespace-nowrap ${
                currentTab === 'items'
                  ? 'bg-amber-300 text-slate-950 border border-amber-200 shadow-sm'
                  : outOfStockCount > 0
                  ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40 hover:bg-rose-500/35'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              }`}
              title={`${lowStockCount} item(s) below reorder threshold${outOfStockCount > 0 ? ` (${outOfStockCount} completely out of stock)` : ''}`}
            >
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  outOfStockCount > 0 ? 'bg-rose-400' : 'bg-amber-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                  outOfStockCount > 0 ? 'bg-rose-500' : 'bg-amber-400'
                }`}></span>
              </span>
              <AlertTriangle className={`w-3 h-3 shrink-0 ${currentTab === 'items' ? 'text-slate-950' : outOfStockCount > 0 ? 'text-rose-400' : 'text-amber-400'}`} />
              <span>Low Stock ({lowStockCount})</span>
            </span>
          ) : null,
        },
        {
          id: 'batch_tracking' as NavigationTab,
          label: 'Batch Tracking',
          icon: Boxes,
          badge: null,
        },
        {
          id: 'clients' as NavigationTab,
          label: 'Clients',
          icon: Users,
          badge: null,
        },
      ]
    },
    {
      groupTitle: 'Accounting & Ledger',
      items: [
        {
          id: 'other_income' as NavigationTab,
          label: 'Other Income',
          icon: DollarSign,
          badge: null,
          subItems: [
            { label: 'Other Income List', tab: 'other_income' as NavigationTab },
          ]
        },
        {
          id: 'expenses' as NavigationTab,
          label: 'Expenses',
          icon: TrendingDown,
          badge: null,
          subItems: [
            { label: 'Expense List', tab: 'expenses' as NavigationTab },
            { label: 'New Expense', tab: 'expenses' as NavigationTab },
          ]
        },
        {
          id: 'reports' as NavigationTab,
          label: 'Reports & Audits',
          icon: BarChart3,
          badge: null,
        },
        {
          id: 'settings' as NavigationTab,
          label: 'Settings',
          icon: Settings,
          badge: null,
        },
      ]
    }
  ];

  return (
    <aside 
      id="main-sidebar" 
      className="w-64 bg-[#0f172a] text-slate-100 flex flex-col shrink-0 h-screen sticky top-0 border-r border-slate-800/80 z-30 select-none shadow-sm"
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-sm shadow-blue-500/20 border border-blue-400/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-base tracking-tight flex items-center gap-1 text-white">
              <span>Invoice</span>
              <span className="text-blue-400 font-extrabold">Pro</span>
            </div>
            <div className="text-[9px] tracking-wider uppercase font-mono text-slate-400 font-semibold">
              ERP & Precision Ledger
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 py-3 space-y-4 overflow-y-auto custom-scrollbar">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter((item) => !hiddenTabs.includes(item.id));
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.groupTitle} className="space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono">
                {group.groupTitle}
              </div>

              {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = 
                currentTab === item.id || 
                (item.id === 'invoices' && (currentTab === 'create_invoice' || currentTab === 'send_invoice'));
              const isExpanded = expandedSections[item.id];
              const isAlertItem = Boolean(item.isAlert && !isActive);

              return (
                <div key={item.id} className="space-y-0.5">
                  <button
                    id={`nav-btn-${item.id}`}
                    onClick={() => onSelectTab(item.id)}
                    title={item.alertTooltip || item.label}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 group relative ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold shadow-sm'
                        : isAlertItem
                        ? item.alertType === 'danger'
                          ? 'text-rose-200 bg-rose-950/30 border border-rose-500/40 hover:bg-rose-900/40 hover:border-rose-500/60 shadow-xs'
                          : 'text-amber-200 bg-amber-950/25 border border-amber-500/35 hover:bg-amber-900/35 hover:border-amber-500/60 shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive 
                            ? 'text-white' 
                            : isAlertItem 
                            ? item.alertType === 'danger'
                              ? 'text-rose-400 group-hover:text-rose-300'
                              : 'text-amber-400 group-hover:text-amber-300'
                            : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.badge && (
                        typeof item.badge === 'string' || typeof item.badge === 'number' ? (
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                              item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700')
                            }`}
                          >
                            {item.badge}
                          </span>
                        ) : (
                          item.badge
                        )
                      )}

                      {item.subItems && (
                        <span
                          onClick={(e) => toggleSection(item.id, e)}
                          className="p-0.5 hover:bg-slate-700/50 rounded text-slate-400 hover:text-white"
                        >
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Sub-items rendering */}
                  {item.subItems && isExpanded && (
                    <div className="pl-7 pr-1 py-0.5 space-y-0.5 border-l border-slate-800 ml-3">
                      {item.subItems.map((sub, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => onSelectTab(sub.tab)}
                          className="w-full text-left px-2 py-1 rounded text-[11px] text-slate-400 hover:text-blue-300 hover:bg-slate-800/40 transition-colors flex items-center gap-1.5"
                        >
                          <span className="w-1 h-1 rounded-full bg-slate-500" />
                          <span className="truncate">{sub.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          );
        })}

        {/* Quick Guided Setup */}
        <div className="pt-2 px-1">
          <button
            id="btn-guided-setup-sidebar"
            onClick={onOpenOnboarding}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-left hover:bg-slate-800 hover:border-blue-500/40 transition-all shadow-xs group"
          >
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-blue-500/15 text-blue-400">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Setup Wizard</div>
                <div className="text-[10px] text-slate-400">Company & Templates</div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-200 transition-all" />
          </button>
        </div>
      </div>

      {/* Bottom Profile Bar */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 shrink-0">
        <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/50 transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center ring-1 ring-slate-700">
              EA
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-white leading-tight">Admin Desk</div>
              <div className="text-[10px] text-slate-400 font-mono truncate max-w-[110px]">Active Ledger</div>
            </div>
          </div>
          <button
            id="btn-sidebar-quick-settings"
            onClick={() => onSelectTab('settings')}
            title="Settings"
            className="p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
