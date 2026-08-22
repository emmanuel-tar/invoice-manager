import React, { useState, useEffect } from 'react';
import { 
  NavigationTab, 
  Invoice, 
  Estimate, 
  Client, 
  InventoryItem, 
  CompanyProfile, 
  TaxRate, 
  Activity,
  RecurringSchedule
} from './types';
import { 
  initialCompanyProfile, 
  initialTaxRates, 
  initialClients, 
  initialInventoryItems, 
  initialInvoices, 
  initialEstimates, 
  initialActivities,
  initialRecurringSchedules
} from './data/mockData';

// Components
import { Sidebar } from './components/Sidebar';
import { TopAppBar } from './components/TopAppBar';
import { DashboardView } from './components/DashboardView';
import { InvoicesView } from './components/InvoicesView';
import { RecurringSchedulesView } from './components/RecurringSchedulesView';
import { CreateInvoiceView } from './components/CreateInvoiceView';
import { EstimatesView } from './components/EstimatesView';
import { SendInvoiceView } from './components/SendInvoiceView';
import { ClientsView } from './components/ClientsView';
import { ItemsView } from './components/ItemsView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';

// Modals
import { ConvertToInvoiceModal } from './components/ConvertToInvoiceModal';
import { ConvertSuccessModal } from './components/ConvertSuccessModal';
import { OnboardingWizard } from './components/OnboardingWizard';
import { InvoicePrintPreviewModal } from './components/InvoicePrintPreviewModal';
import { PaymentPortalModal } from './components/PaymentPortalModal';
import { CreateEstimateModal } from './components/CreateEstimateModal';
import { CreateRecurringScheduleModal } from './components/CreateRecurringScheduleModal';
import { AddClientModal } from './components/AddClientModal';
import { ClientPortalView } from './components/ClientPortalView';
import { ToastContainer, ToastMessage } from './components/Toast';
import { generateInvoiceFromSchedule, isScheduleDue } from './utils/recurringUtils';
import { extractPortalTokenFromUrl, getClientByPortalToken, getClientPortalUrl } from './utils/portalUtils';

export function App() {
  // Main Data States with localStorage fallback
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(() => {
    const saved = localStorage.getItem('invoicepro_company');
    return saved ? JSON.parse(saved) : initialCompanyProfile;
  });
  const [taxRates, setTaxRates] = useState<TaxRate[]>(() => {
    const saved = localStorage.getItem('invoicepro_taxes');
    return saved ? JSON.parse(saved) : initialTaxRates;
  });
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('invoicepro_invoices');
    return saved ? JSON.parse(saved) : initialInvoices;
  });
  const [estimates, setEstimates] = useState<Estimate[]>(() => {
    const saved = localStorage.getItem('invoicepro_estimates');
    return saved ? JSON.parse(saved) : initialEstimates;
  });
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('invoicepro_clients');
    return saved ? JSON.parse(saved) : initialClients;
  });
  const [items, setItems] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('invoicepro_items');
    return saved ? JSON.parse(saved) : initialInventoryItems;
  });
  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem('invoicepro_activities');
    return saved ? JSON.parse(saved) : initialActivities;
  });
  const [recurringSchedules, setRecurringSchedules] = useState<RecurringSchedule[]>(() => {
    const saved = localStorage.getItem('invoicepro_recurring_schedules');
    return saved ? JSON.parse(saved) : initialRecurringSchedules;
  });

  // Modal & View States
  const [selectedInvoiceForSend, setSelectedInvoiceForSend] = useState<Invoice | null>(null);
  const [editingInvoiceData, setEditingInvoiceData] = useState<Partial<Invoice> | undefined>(undefined);
  const [previewDoc, setPreviewDoc] = useState<{ doc: Invoice | Estimate; type: 'invoice' | 'estimate' } | null>(null);
  const [convertTargetEstimate, setConvertTargetEstimate] = useState<Estimate | null>(null);
  const [convertSuccessData, setConvertSuccessData] = useState<{ invoice: Invoice; estimate: Estimate } | null>(null);
  const [paymentPortalInvoice, setPaymentPortalInvoice] = useState<Invoice | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isCreateEstimateOpen, setIsCreateEstimateOpen] = useState<boolean>(false);
  const [isAddClientOpen, setIsAddClientOpen] = useState<boolean>(false);
  const [isCreateRecurringModalOpen, setIsCreateRecurringModalOpen] = useState<boolean>(false);
  const [editingRecurringSchedule, setEditingRecurringSchedule] = useState<Partial<RecurringSchedule> | null>(null);
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [portalClient, setPortalClient] = useState<Client | null>(null);
  const [isDirectPortalMode, setIsDirectPortalMode] = useState<boolean>(false);

  // Check URL parameters or hash for direct secure client portal link
  useEffect(() => {
    const checkUrlForPortal = () => {
      const token = extractPortalTokenFromUrl();
      if (token) {
        const matched = getClientByPortalToken(clients, token);
        if (matched) {
          setPortalClient(matched);
          setIsDirectPortalMode(true);
        }
      }
    };

    checkUrlForPortal();
    window.addEventListener('hashchange', checkUrlForPortal);
    window.addEventListener('popstate', checkUrlForPortal);
    return () => {
      window.removeEventListener('hashchange', checkUrlForPortal);
      window.removeEventListener('popstate', checkUrlForPortal);
    };
  }, [clients]);

  // Persist states
  useEffect(() => {
    localStorage.setItem('invoicepro_company', JSON.stringify(companyProfile));
  }, [companyProfile]);
  useEffect(() => {
    localStorage.setItem('invoicepro_taxes', JSON.stringify(taxRates));
  }, [taxRates]);
  useEffect(() => {
    localStorage.setItem('invoicepro_invoices', JSON.stringify(invoices));
  }, [invoices]);
  useEffect(() => {
    localStorage.setItem('invoicepro_estimates', JSON.stringify(estimates));
  }, [estimates]);
  useEffect(() => {
    localStorage.setItem('invoicepro_clients', JSON.stringify(clients));
  }, [clients]);
  useEffect(() => {
    localStorage.setItem('invoicepro_items', JSON.stringify(items));
  }, [items]);
  useEffect(() => {
    localStorage.setItem('invoicepro_activities', JSON.stringify(activities));
  }, [activities]);
  useEffect(() => {
    localStorage.setItem('invoicepro_recurring_schedules', JSON.stringify(recurringSchedules));
  }, [recurringSchedules]);

  // Toast Helper
  const showToast = (title: string, description?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      title,
      description,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Activity Logger Helper
  const addActivity = (
    type: Activity['type'],
    title: string,
    description: string,
    highlightText?: string,
    amount?: number
  ) => {
    const newAct: Activity = {
      id: `act-${Date.now()}`,
      type,
      title,
      description,
      highlightText,
      timeAgo: 'Just now',
      timestamp: Date.now(),
      amount,
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  // --- Handlers ---
  const handleSaveInvoice = (invoice: Invoice, action: 'save' | 'send') => {
    // Check if updating existing or inserting
    const existingIndex = invoices.findIndex((i) => i.id === invoice.id);
    let updatedInvoices: Invoice[];
    if (existingIndex >= 0) {
      updatedInvoices = [...invoices];
      updatedInvoices[existingIndex] = invoice;
    } else {
      updatedInvoices = [invoice, ...invoices];
    }
    setInvoices(updatedInvoices);

    // Update Client metrics
    setClients((prev) =>
      prev.map((c) => {
        if (c.name === invoice.clientName) {
          return {
            ...c,
            invoiceCount: c.invoiceCount + (existingIndex >= 0 ? 0 : 1),
            outstanding: invoice.status === 'paid' ? c.outstanding : c.outstanding + invoice.total,
          };
        }
        return c;
      })
    );

    addActivity(
      'invoice_created',
      `Invoice ${invoice.invoiceNumber}`,
      `created for ${invoice.clientName} ($${invoice.total.toFixed(2)}).`,
      invoice.invoiceNumber
    );

    if (action === 'send') {
      setSelectedInvoiceForSend(invoice);
      setCurrentTab('send_invoice');
    } else {
      showToast('Invoice Saved', `Invoice ${invoice.invoiceNumber} saved as ${invoice.status}.`);
      setCurrentTab('invoices');
    }
    setEditingInvoiceData(undefined);
  };

  const handleSendInvoiceSuccess = (
    invoiceId: string,
    emailDetails: { to: string; subject: string }
  ) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    showToast(
      'Invoice Dispatched',
      `Sent to ${emailDetails.to} successfully with PDF & Payment Link.`
    );
    if (inv) {
      addActivity(
        'invoice_created',
        `Dispatched ${inv.invoiceNumber}`,
        `sent to ${emailDetails.to}.`,
        inv.invoiceNumber
      );
    }
    setCurrentTab('invoices');
  };

  const handleMarkAsPaid = (invoiceId: string) => {
    const target = invoices.find((i) => i.id === invoiceId);
    if (!target) return;

    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invoiceId ? { ...inv, status: 'paid' } : inv))
    );

    // Update Client record
    setClients((prev) =>
      prev.map((c) => {
        if (c.name === target.clientName) {
          return {
            ...c,
            outstanding: Math.max(0, c.outstanding - target.total),
            totalRevenue: c.totalRevenue + target.total,
            status: 'active',
          };
        }
        return c;
      })
    );

    addActivity(
      'payment',
      'Payment Settled',
      `received for Invoice #${target.invoiceNumber}.`,
      `$${target.total.toFixed(2)}`,
      target.total
    );

    showToast('Payment Recorded', `Invoice ${target.invoiceNumber} marked as paid.`);
  };

  const handleDuplicateInvoice = (invoice: Invoice) => {
    const dup: Invoice = {
      ...invoice,
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
    setEditingInvoiceData(dup);
    setCurrentTab('create_invoice');
    showToast('Invoice Cloned', `Cloned as new draft ${dup.invoiceNumber}`);
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    const target = invoices.find((i) => i.id === invoiceId);
    setInvoices((prev) => prev.filter((i) => i.id !== invoiceId));
    showToast('Invoice Deleted', `Invoice ${target?.invoiceNumber || ''} was deleted.`, 'info');
  };

  // Convert Estimate To Invoice
  const handleConfirmConvertEstimate = (options: {
    estimate: Estimate;
    invoiceNumber: string;
    date: string;
    dueDate: string;
    carryOverItems: boolean;
    includeRefNote: boolean;
  }) => {
    const est = options.estimate;
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: options.invoiceNumber,
      clientName: est.clientName,
      clientEmail: est.clientEmail,
      clientAddress: est.clientAddress,
      clientAvatar: est.clientAvatar,
      date: options.date,
      dueDate: options.dueDate,
      items: options.carryOverItems ? [...est.items] : [],
      subtotal: est.subtotal,
      taxAmount: est.taxAmount,
      discount: est.discount || 0,
      total: est.total,
      status: 'pending',
      estimateRef: est.estimateNumber,
      notes: options.includeRefNote
        ? `Based on Estimate ${est.estimateNumber}. ${est.notes || ''}`
        : est.notes,
      createdAt: new Date().toISOString(),
    };

    // Update estimates state to accepted & link invoice
    setEstimates((prev) =>
      prev.map((e) =>
        e.id === est.id
          ? { ...e, status: 'accepted', convertedToInvoiceId: newInvoice.invoiceNumber }
          : e
      )
    );

    // Insert Invoice
    setInvoices((prev) => [newInvoice, ...prev]);

    // Update Client Outstanding
    setClients((prev) =>
      prev.map((c) =>
        c.name === est.clientName
          ? { ...c, outstanding: c.outstanding + newInvoice.total, invoiceCount: c.invoiceCount + 1 }
          : c
      )
    );

    // Close convert modal
    setConvertTargetEstimate(null);

    // Log Activity
    addActivity(
      'converted',
      'Estimate Converted',
      `${est.estimateNumber} converted to ${newInvoice.invoiceNumber}.`,
      newInvoice.invoiceNumber
    );

    // Show Success Modal
    setConvertSuccessData({ invoice: newInvoice, estimate: est });
  };

  // Estimate Handlers
  const handleSaveEstimate = (est: Estimate) => {
    setEstimates((prev) => [est, ...prev]);
    showToast('Estimate Created', `Estimate ${est.estimateNumber} sent to ${est.clientName}.`);
    addActivity(
      'estimate_sent',
      'Estimate Sent',
      `${est.estimateNumber} created for ${est.clientName} ($${est.total.toFixed(2)}).`,
      est.estimateNumber
    );
  };

  const handleDeleteEstimate = (id: string) => {
    setEstimates((prev) => prev.filter((e) => e.id !== id));
    showToast('Estimate Removed', 'The quote record has been removed.', 'info');
  };

  // Client Handlers
  const handleAddClient = (client: Client) => {
    setClients((prev) => [client, ...prev]);
    showToast('Client Registered', `${client.name} added to client directory.`);
  };

  const handleEditClient = (client: Client) => {
    setClients((prev) => prev.map((c) => (c.id === client.id ? client : c)));
    showToast('Client Updated', `${client.name} details saved.`);
  };

  const handleDeleteClient = (clientId: string) => {
    setClients((prev) => prev.filter((c) => c.id !== clientId));
    showToast('Client Removed', 'Client deleted from directory.', 'info');
  };

  const handleSendReminder = (client: Client) => {
    showToast(
      'Reminder Dispatched',
      `Overdue statement and payment links dispatched to ${client.email}.`
    );
  };

  const handleUpdateClientToken = (clientId: string, newToken: string) => {
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? {
              ...c,
              portalToken: newToken,
              portalTokenCreatedAt: new Date().toISOString(),
            }
          : c
      )
    );
    showToast('Secure Key Regenerated', 'Client portal URL has been refreshed with a new unique token.');
  };

  const handleSendPortalEmail = (client: Client, portalUrl: string) => {
    showToast('Portal Link Dispatched', `Direct access link emailed to ${client.email}`);
    addActivity(
      'invoice_created',
      'Shared Client Portal',
      `Direct portal link sent to ${client.name} (${client.email}).`,
      client.name
    );
  };

  const handlePayFromPortal = (invoice: Invoice) => {
    handleMarkAsPaid(invoice.id);
  };

  // Item Handlers
  const handleAddItem = (item: InventoryItem) => {
    setItems((prev) => [item, ...prev]);
    showToast('Item Added', `${item.name} is now available in billing catalog.`);
  };

  const handleEditItem = (item: InventoryItem) => {
    setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)));
    showToast('Item Updated', `${item.name} catalog record updated.`);
  };

  const handleDeleteItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    showToast('Item Deleted', 'Item removed from catalog.', 'info');
  };

  const handleUpdateStock = (itemId: string, newStock: number) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== itemId) return i;
        const status = newStock <= 0 ? 'out' : newStock <= i.lowStockThreshold ? 'low' : 'in_stock';
        return { ...i, stock: newStock, status };
      })
    );
  };

  // Taxes
  const handleAddTaxRate = (rate: TaxRate) => {
    setTaxRates((prev) => [...prev, rate]);
    showToast('Tax Bracket Created', `${rate.name} (${rate.rate}%) added.`);
  };

  const handleDeleteTaxRate = (id: string) => {
    setTaxRates((prev) => prev.filter((t) => t.id !== id));
    showToast('Tax Bracket Deleted', 'Tax rate removed.', 'info');
  };

  const handleSetDefaultTaxRate = (id: string) => {
    setTaxRates((prev) =>
      prev.map((t) => ({ ...t, isDefault: t.id === id }))
    );
    const target = taxRates.find((t) => t.id === id);
    if (target) {
      setCompanyProfile((prev) => ({ ...prev, defaultTaxRate: target.rate }));
    }
    showToast('Default Tax Updated', 'New default rate configured.');
  };

  // Online Payment Simulation Handler
  const handlePaymentSuccess = (invoiceId: string, paidAmount: number) => {
    handleMarkAsPaid(invoiceId);
  };

  // --- Recurring Schedule Handlers ---
  const handleSaveRecurringSchedule = (schedule: RecurringSchedule) => {
    const existingIndex = recurringSchedules.findIndex((s) => s.id === schedule.id);
    let updated: RecurringSchedule[];
    if (existingIndex >= 0) {
      updated = [...recurringSchedules];
      updated[existingIndex] = schedule;
      showToast('Schedule Updated', `Recurring schedule "${schedule.title}" updated.`);
    } else {
      updated = [schedule, ...recurringSchedules];
      showToast('Schedule Created', `New recurring schedule "${schedule.title}" created for ${schedule.clientName}.`);
    }
    setRecurringSchedules(updated);
    addActivity(
      'recurring_generated',
      schedule.title,
      `Recurring billing schedule configured for ${schedule.clientName} ($${schedule.total.toFixed(2)} / ${schedule.frequency}).`,
      schedule.frequency.toUpperCase()
    );
    setEditingRecurringSchedule(null);
  };

  const handleDeleteRecurringSchedule = (scheduleId: string) => {
    const target = recurringSchedules.find((s) => s.id === scheduleId);
    setRecurringSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
    showToast('Schedule Deleted', `Recurring schedule removed.`, 'info');
  };

  const handleToggleRecurringStatus = (scheduleId: string) => {
    setRecurringSchedules((prev) =>
      prev.map((s) => {
        if (s.id === scheduleId) {
          const newStatus = s.status === 'active' ? 'paused' : 'active';
          showToast(
            newStatus === 'active' ? 'Schedule Resumed' : 'Schedule Paused',
            `Recurring schedule "${s.title}" is now ${newStatus}.`
          );
          return { ...s, status: newStatus };
        }
        return s;
      })
    );
  };

  const handleGenerateDraftNow = (schedule: RecurringSchedule) => {
    const { invoice, updatedSchedule } = generateInvoiceFromSchedule(schedule);

    // Add invoice to invoices list
    setInvoices((prev) => [invoice, ...prev]);

    // Update schedule state
    setRecurringSchedules((prev) =>
      prev.map((s) => (s.id === schedule.id ? updatedSchedule : s))
    );

    // Update Client metrics
    setClients((prev) =>
      prev.map((c) => {
        if (c.name === invoice.clientName) {
          return {
            ...c,
            invoiceCount: c.invoiceCount + 1,
            outstanding: c.outstanding + invoice.total,
          };
        }
        return c;
      })
    );

    // Log Activity
    addActivity(
      'invoice_created',
      `Auto-Generated Draft ${invoice.invoiceNumber}`,
      `created from recurring schedule "${schedule.title}" for ${invoice.clientName} ($${invoice.total.toFixed(2)}).`,
      'Draft Generated',
      invoice.total
    );

    showToast(
      'Draft Invoice Generated',
      `Invoice ${invoice.invoiceNumber} created for ${invoice.clientName} ($${invoice.total.toFixed(2)}). Ready in your Invoices ledger.`
    );
  };

  const handleBatchProcessDueSchedules = () => {
    const due = recurringSchedules.filter((s) => s.status === 'active' && isScheduleDue(s.nextBillingDate));
    if (due.length === 0) {
      showToast('All Schedules Up-To-Date', 'No recurring schedules are currently due for billing.', 'info');
      return;
    }

    const newInvoices: Invoice[] = [];
    const updatedSchedulesMap = new Map<string, RecurringSchedule>();

    due.forEach((sched) => {
      const { invoice, updatedSchedule } = generateInvoiceFromSchedule(sched);
      newInvoices.push(invoice);
      updatedSchedulesMap.set(sched.id, updatedSchedule);

      addActivity(
        'invoice_created',
        `Auto-Generated ${invoice.invoiceNumber}`,
        `created from recurring pattern for ${invoice.clientName} ($${invoice.total.toFixed(2)}).`,
        'Recurring Draft',
        invoice.total
      );
    });

    setInvoices((prev) => [...newInvoices, ...prev]);
    setRecurringSchedules((prev) =>
      prev.map((s) => (updatedSchedulesMap.has(s.id) ? updatedSchedulesMap.get(s.id)! : s))
    );

    showToast(
      'Batch Invoices Created',
      `Generated ${newInvoices.length} draft invoices from due recurring schedules.`
    );
  };

  const handleMakeRecurringFromInvoice = (invoice: Invoice) => {
    const matchingClient = clients.find((c) => c.name === invoice.clientName || c.email === invoice.clientEmail);
    const partialSchedule: Partial<RecurringSchedule> = {
      title: `${invoice.clientName} Recurring Services`,
      clientId: matchingClient?.id || clients[0]?.id || '',
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      clientAddress: invoice.clientAddress,
      clientAvatar: invoice.clientAvatar,
      frequency: 'monthly',
      paymentTermsDays: 14,
      items: invoice.items,
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      total: invoice.total,
      autoSend: false,
      notes: `Based on billing pattern from invoice ${invoice.invoiceNumber}.`,
    };
    setEditingRecurringSchedule(partialSchedule);
    setIsCreateRecurringModalOpen(true);
  };

  const lowStockCount = items.filter((i) => i.status === 'low' || i.status === 'out').length;
  const activeRecurringCount = recurringSchedules.filter((s) => s.status === 'active').length;
  const dueRecurringCount = recurringSchedules.filter((s) => s.status === 'active' && isScheduleDue(s.nextBillingDate)).length;

  // Render standalone secure Client Portal if active
  if (portalClient) {
    return (
      <div id="invoicepro-client-portal-root" className="min-h-screen bg-slate-100 text-slate-900">
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        <ClientPortalView
          client={portalClient}
          invoices={invoices}
          companyProfile={companyProfile}
          onPayInvoice={handlePayFromPortal}
          onExitPreview={() => {
            setPortalClient(null);
            setIsDirectPortalMode(false);
            if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
              window.history.replaceState(null, '', window.location.pathname);
            }
          }}
          isDirectPortalMode={isDirectPortalMode}
        />
      </div>
    );
  }

  return (
    <div id="invoicepro-app" className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden antialiased">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Main Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab === 'invoices') {
            setEditingInvoiceData(undefined);
          }
          setCurrentTab(tab);
        }}
        invoiceCount={invoices.length}
        recurringCount={activeRecurringCount}
        estimateCount={estimates.length}
        lowStockCount={lowStockCount}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header Bar */}
        <TopAppBar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          activities={activities}
          onOpenCreateInvoice={() => {
            setEditingInvoiceData(undefined);
            setCurrentTab('create_invoice');
          }}
          onOpenCreateEstimate={() => setIsCreateEstimateOpen(true)}
          onOpenAddClient={() => setIsAddClientOpen(true)}
          onOpenAddItem={() => setCurrentTab('items')}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          searchTerm={globalSearch}
          onSearchChange={setGlobalSearch}
        />

        {/* Dynamic Route / View Rendering */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {currentTab === 'dashboard' && (
            <DashboardView
              invoices={invoices}
              estimates={estimates}
              items={items}
              activities={activities}
              onNavigate={setCurrentTab}
              onOpenCreateInvoice={() => {
                setEditingInvoiceData(undefined);
                setCurrentTab('create_invoice');
              }}
              onOpenCreateEstimate={() => setIsCreateEstimateOpen(true)}
              onOpenAddItem={() => setCurrentTab('items')}
              onViewInvoice={(inv) => setPreviewDoc({ doc: inv, type: 'invoice' })}
              onPayInvoice={(inv) => setPaymentPortalInvoice(inv)}
            />
          )}

          {currentTab === 'invoices' && (
            <InvoicesView
              invoices={invoices}
              clients={clients}
              globalSearch={globalSearch}
              onGlobalSearchChange={setGlobalSearch}
              onOpenCreateInvoice={() => {
                setEditingInvoiceData(undefined);
                setCurrentTab('create_invoice');
              }}
              onViewInvoice={(inv) => setPreviewDoc({ doc: inv, type: 'invoice' })}
              onSendInvoice={(inv) => {
                setSelectedInvoiceForSend(inv);
                setCurrentTab('send_invoice');
              }}
              onMarkAsPaid={handleMarkAsPaid}
              onDuplicateInvoice={handleDuplicateInvoice}
              onDeleteInvoice={handleDeleteInvoice}
              onPayOnline={(inv) => setPaymentPortalInvoice(inv)}
              onMakeRecurring={handleMakeRecurringFromInvoice}
              onNavigateToRecurring={() => setCurrentTab('recurring')}
              dueRecurringCount={dueRecurringCount}
            />
          )}

          {currentTab === 'recurring' && (
            <RecurringSchedulesView
              schedules={recurringSchedules}
              clients={clients}
              onOpenCreateSchedule={(initialData) => {
                setEditingRecurringSchedule(initialData || null);
                setIsCreateRecurringModalOpen(true);
              }}
              onEditSchedule={(sched) => {
                setEditingRecurringSchedule(sched);
                setIsCreateRecurringModalOpen(true);
              }}
              onDeleteSchedule={handleDeleteRecurringSchedule}
              onToggleStatus={handleToggleRecurringStatus}
              onGenerateDraftNow={handleGenerateDraftNow}
              onBatchProcessDueSchedules={handleBatchProcessDueSchedules}
              onViewInvoiceList={() => setCurrentTab('invoices')}
            />
          )}

          {currentTab === 'create_invoice' && (
            <CreateInvoiceView
              clients={clients}
              items={items}
              companyProfile={companyProfile}
              onSaveInvoice={handleSaveInvoice}
              onCancel={() => setCurrentTab('invoices')}
              onOpenAddClient={() => setIsAddClientOpen(true)}
              onPreviewInvoice={(inv) => setPreviewDoc({ doc: inv, type: 'invoice' })}
              initialInvoiceData={editingInvoiceData}
            />
          )}

          {currentTab === 'estimates' && (
            <EstimatesView
              estimates={estimates}
              clients={clients}
              onOpenCreateEstimate={() => setIsCreateEstimateOpen(true)}
              onOpenConvertModal={(est) => setConvertTargetEstimate(est)}
              onDeleteEstimate={handleDeleteEstimate}
              onViewEstimate={(est) => setPreviewDoc({ doc: est, type: 'estimate' })}
              onSendEstimate={(est) => {
                showToast('Estimate Sent', `Email with quote PDF dispatched to ${est.clientEmail}`);
              }}
            />
          )}

          {currentTab === 'send_invoice' && selectedInvoiceForSend && (
            <SendInvoiceView
              invoice={selectedInvoiceForSend}
              companyProfile={companyProfile}
              onBack={() => setCurrentTab('invoices')}
              onSendSuccess={handleSendInvoiceSuccess}
              onOpenPaymentPortal={(inv) => setPaymentPortalInvoice(inv)}
            />
          )}

          {currentTab === 'clients' && (
            <ClientsView
              clients={clients}
              invoices={invoices}
              onAddClient={handleAddClient}
              onEditClient={handleEditClient}
              onDeleteClient={handleDeleteClient}
              onSelectClientToInvoice={(client) => {
                setEditingInvoiceData({
                  clientName: client.name,
                  clientEmail: client.email,
                  clientAddress: client.address,
                });
                setCurrentTab('create_invoice');
              }}
              onSendReminder={handleSendReminder}
              onOpenPortalView={(client) => {
                setPortalClient(client);
                setIsDirectPortalMode(false);
              }}
              onUpdateClientToken={handleUpdateClientToken}
              onSendPortalEmail={handleSendPortalEmail}
            />
          )}

          {currentTab === 'items' && (
            <ItemsView
              items={items}
              onAddItem={handleAddItem}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              onUpdateStock={handleUpdateStock}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              invoices={invoices}
              clients={clients}
              taxRates={taxRates}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              companyProfile={companyProfile}
              taxRates={taxRates}
              onUpdateCompanyProfile={(prof) => {
                setCompanyProfile(prof);
                showToast('Settings Saved', 'Company profile and template updated.');
              }}
              onAddTaxRate={handleAddTaxRate}
              onDeleteTaxRate={handleDeleteTaxRate}
              onSetDefaultTaxRate={handleSetDefaultTaxRate}
              onLaunchOnboarding={() => setIsOnboardingOpen(true)}
            />
          )}
        </main>
      </div>

      {/* --- Global Modals --- */}
      {/* 1. Convert Estimate to Invoice Modal */}
      <ConvertToInvoiceModal
        estimate={convertTargetEstimate}
        isOpen={Boolean(convertTargetEstimate)}
        onClose={() => setConvertTargetEstimate(null)}
        onConfirmConvert={handleConfirmConvertEstimate}
      />

      {/* 2. Convert Success Celebratory Modal */}
      <ConvertSuccessModal
        isOpen={Boolean(convertSuccessData)}
        onClose={() => setConvertSuccessData(null)}
        convertedInvoice={convertSuccessData?.invoice || null}
        sourceEstimate={convertSuccessData?.estimate || null}
        onViewInvoice={(inv) => {
          setConvertSuccessData(null);
          setPreviewDoc({ doc: inv, type: 'invoice' });
        }}
        onSendInvoice={(inv) => {
          setConvertSuccessData(null);
          setSelectedInvoiceForSend(inv);
          setCurrentTab('send_invoice');
        }}
        onReturnToEstimates={() => {
          setConvertSuccessData(null);
          setCurrentTab('estimates');
        }}
      />

      {/* 3. Onboarding Wizard */}
      <OnboardingWizard
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        companyProfile={companyProfile}
        onComplete={(newProf) => {
          setCompanyProfile(newProf);
          showToast('Setup Completed', 'InvoicePro is ready to use!');
        }}
      />

      {/* 4. Invoice / Estimate Print & PDF Preview Modal */}
      <InvoicePrintPreviewModal
        document={previewDoc?.doc || null}
        type={previewDoc?.type || 'invoice'}
        companyProfile={companyProfile}
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        onSendEmail={(doc) => {
          if (previewDoc?.type === 'invoice') {
            setSelectedInvoiceForSend(doc as Invoice);
            setCurrentTab('send_invoice');
          } else {
            showToast('Estimate Dispatched', `Quote emailed to ${doc.clientEmail}`);
          }
        }}
      />

      {/* 5. Interactive Client Payment Portal Simulation */}
      <PaymentPortalModal
        invoice={paymentPortalInvoice}
        companyProfile={companyProfile}
        isOpen={Boolean(paymentPortalInvoice)}
        onClose={() => setPaymentPortalInvoice(null)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* 6. Quick Create Estimate Modal */}
      <CreateEstimateModal
        isOpen={isCreateEstimateOpen}
        onClose={() => setIsCreateEstimateOpen(false)}
        clients={clients}
        items={items}
        companyProfile={companyProfile}
        onSaveEstimate={handleSaveEstimate}
      />

      {/* 7. Quick Add Client Modal */}
      <AddClientModal
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
        onAddClient={handleAddClient}
      />

      {/* 8. Recurring Schedule Create / Edit Modal */}
      <CreateRecurringScheduleModal
        isOpen={isCreateRecurringModalOpen}
        onClose={() => {
          setIsCreateRecurringModalOpen(false);
          setEditingRecurringSchedule(null);
        }}
        onSave={handleSaveRecurringSchedule}
        clients={clients}
        itemsCatalog={items}
        taxRates={taxRates}
        initialSchedule={editingRecurringSchedule}
      />
    </div>
  );
}

export default App;
