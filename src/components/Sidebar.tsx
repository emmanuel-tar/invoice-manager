import React from 'react';
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
  LogOut,
  Layers,
  ChevronRight
} from 'lucide-react';
import { NavigationTab } from '../types';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  invoiceCount: number;
  recurringCount?: number;
  estimateCount: number;
  lowStockCount: number;
  onOpenOnboarding: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  invoiceCount,
  recurringCount = 0,
  estimateCount,
  lowStockCount,
  onOpenOnboarding,
}) => {
  const navItems = [
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
      id: 'recurring' as NavigationTab,
      label: 'Recurring Schedules',
      icon: Repeat,
      badge: recurringCount > 0 ? recurringCount : null,
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    },
    {
      id: 'estimates' as NavigationTab,
      label: 'Estimates',
      icon: FileSpreadsheet,
      badge: estimateCount > 0 ? estimateCount : null,
    },
    {
      id: 'clients' as NavigationTab,
      label: 'Clients',
      icon: Users,
      badge: null,
    },
    {
      id: 'items' as NavigationTab,
      label: 'Items & Catalog',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} low` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    },
    {
      id: 'reports' as NavigationTab,
      label: 'Reports',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'settings' as NavigationTab,
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside 
      id="main-sidebar" 
      className="w-64 bg-[#0f172a] text-slate-100 flex flex-col shrink-0 h-screen sticky top-0 border-r border-slate-800/80 z-30 select-none shadow-sm"
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-sm shadow-blue-500/20 border border-blue-400/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-lg tracking-tight flex items-center gap-1.5 text-white">
              <span>Invoice</span>
              <span className="text-blue-400 font-extrabold">Pro</span>
            </div>
            <div className="text-[10px] tracking-wider uppercase font-mono text-slate-400 font-semibold">
              Precision Ledger
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = 
            currentTab === item.id || 
            (item.id === 'invoices' && (currentTab === 'create_invoice' || currentTab === 'send_invoice'));

          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700')
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Quick Launch Quick Guided Setup */}
        <div className="pt-4 px-1">
          <button
            id="btn-guided-setup-sidebar"
            onClick={onOpenOnboarding}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-left hover:bg-slate-800 hover:border-blue-500/40 transition-all shadow-xs group"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400">
                <Sparkles className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Setup Wizard</div>
                <div className="text-[10px] text-slate-400">Company & Templates</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-200 transition-all" />
          </button>
        </div>
      </div>

      {/* Bottom Profile Bar */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center ring-2 ring-slate-700">
              JD
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-white leading-tight">John Doe</div>
              <div className="text-[11px] text-slate-400">john@invoicepro.io</div>
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
