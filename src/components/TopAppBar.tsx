import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Plus, 
  FileText, 
  FileSpreadsheet, 
  UserPlus, 
  PackagePlus, 
  HelpCircle, 
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  X
} from 'lucide-react';
import { NavigationTab, Activity } from '../types';

interface TopAppBarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  activities: Activity[];
  onOpenCreateInvoice: () => void;
  onOpenCreateEstimate: () => void;
  onOpenAddClient: () => void;
  onOpenAddItem: () => void;
  onOpenOnboarding: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  currentTab,
  onSelectTab,
  activities,
  onOpenCreateInvoice,
  onOpenCreateEstimate,
  onOpenAddClient,
  onOpenAddItem,
  onOpenOnboarding,
  searchTerm,
  onSearchChange,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Overview Dashboard';
      case 'invoices':
        return 'Invoices & Billing';
      case 'create_invoice':
        return 'Create New Invoice';
      case 'estimates':
        return 'Estimates & Quotes';
      case 'send_invoice':
        return 'Send & Review Invoice';
      case 'clients':
        return 'Client Management';
      case 'items':
        return 'Items & Catalog';
      case 'reports':
        return 'Financial Reports & Analytics';
      case 'settings':
        return 'System & Tax Settings';
      case 'onboarding':
        return 'Setup Wizard';
      default:
        return 'InvoicePro';
    }
  };

  return (
    <>
      <header 
        id="top-app-bar" 
        className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs"
      >
        {/* Left: Page Title & Breadcrumb */}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{getPageTitle()}</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Precision Ledger • Real-time Financial Engine
            </p>
          </div>
        </div>

        {/* Center: Universal Search Input */}
        <div className="flex-1 max-w-md mx-6 hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="top-global-search"
              type="text"
              placeholder="Search invoices, clients, estimates, items..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0052cc]/20 focus:border-[#0052cc] transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions, Notifications, User */}
        <div className="flex items-center gap-3">
          {/* Quick Create Dropdown */}
          <div className="relative">
            <button
              id="btn-quick-create-menu"
              onClick={() => setShowCreateDropdown(!showCreateDropdown)}
              className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New</span>
            </button>

            {showCreateDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowCreateDropdown(false)} 
                />
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200/80 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <button
                    id="menu-opt-new-invoice"
                    onClick={() => {
                      setShowCreateDropdown(false);
                      onOpenCreateInvoice();
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  >
                    <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">New Invoice</div>
                      <div className="text-[10px] text-slate-400">Bill a client directly</div>
                    </div>
                  </button>

                  <button
                    id="menu-opt-new-estimate"
                    onClick={() => {
                      setShowCreateDropdown(false);
                      onOpenCreateEstimate();
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  >
                    <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">New Estimate</div>
                      <div className="text-[10px] text-slate-400">Send quote for approval</div>
                    </div>
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    id="menu-opt-new-client"
                    onClick={() => {
                      setShowCreateDropdown(false);
                      onOpenAddClient();
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-slate-400" />
                    <span>Add New Client</span>
                  </button>

                  <button
                    id="menu-opt-new-item"
                    onClick={() => {
                      setShowCreateDropdown(false);
                      onOpenAddItem();
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  >
                    <PackagePlus className="w-3.5 h-3.5 text-slate-400" />
                    <span>Add Item / Service</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Help button */}
          <button
            id="btn-help-modal"
            onClick={() => setShowHelpModal(true)}
            title="Help & Workflow Guide"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors relative"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              id="btn-notifications-bell"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
            </button>

            {showNotifications && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNotifications(false)} 
                />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-3 z-50 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <div className="text-xs font-bold text-slate-900">Activity Notifications</div>
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {activities.length} Recent
                    </span>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {activities.map((act) => (
                      <div 
                        key={act.id} 
                        className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs transition-colors flex items-start gap-2.5"
                      >
                        <div className="mt-0.5">
                          {act.type === 'payment' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                          {act.type === 'overdue' && <AlertCircle className="w-4 h-4 text-rose-600" />}
                          {act.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600" />}
                          {act.type === 'estimate_sent' && <FileSpreadsheet className="w-4 h-4 text-teal-600" />}
                          {act.type === 'invoice_created' && <FileText className="w-4 h-4 text-blue-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-800 text-[11px]">
                            {act.title}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {act.description}
                          </div>
                          <div className="text-[9px] text-slate-400 font-mono mt-1">
                            {act.timeAgo}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">InvoicePro Workflow Guide</h3>
                  <p className="text-xs text-slate-500">How to manage your end-to-end billing lifecycle</p>
                </div>
              </div>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">1</div>
                <div>
                  <div className="font-bold text-slate-900">Create & Send Estimates</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Draft quotes for clients with customized line items, discounts, and expiry dates.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">2</div>
                <div>
                  <div className="font-bold text-slate-900">1-Click Convert to Invoice</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Once approved, seamlessly convert any estimate into a ready-to-bill invoice with item carryover and reference tracking.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">3</div>
                <div>
                  <div className="font-bold text-slate-900">Email & Online Payment Portal</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Send polished emails with PDF attachments and direct online payment links for immediate settlement.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
