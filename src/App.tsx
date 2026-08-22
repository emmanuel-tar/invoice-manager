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
  RecurringSchedule,
  InvoiceStatus,
  PaymentRecord,
  ReceiptRecord,
  BatchItem,
  BatchStatus,
  SaleOrder,
  SaleOrderStatus,
  PurchaseRecord,
  PurchaseReturn,
  PurchaseOrder,
  PurchaseOrderStatus,
  OtherIncome,
  Expense
} from './types';
import { 
  initialCompanyProfile, 
  initialTaxRates, 
  initialClients, 
  initialInventoryItems, 
  initialInvoices, 
  initialEstimates, 
  initialActivities,
  initialRecurringSchedules,
  initialPayments,
  initialReceipts,
  initialBatches,
  initialSaleOrders,
  initialPurchases,
  initialPurchaseReturns,
  initialPurchaseOrders,
  initialOtherIncomes,
  initialExpenses
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

// Financial & Operational Views
import { PaymentsView } from './components/PaymentsView';
import { ReceiptsView } from './components/ReceiptsView';
import { BatchTrackingView } from './components/BatchTrackingView';
import { SaleOrdersView } from './components/SaleOrdersView';
import { PurchasesView } from './components/PurchasesView';
import { PurchaseOrdersView } from './components/PurchaseOrdersView';
import { OtherIncomeView } from './components/OtherIncomeView';
import { ExpensesView } from './components/ExpensesView';

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
import { extractPortalTokenFromUrl, getClientByPortalToken } from './utils/portalUtils';

export function App() {
  // Main Data States with localStorage persistence
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

  // Enterprise & Ledger States
  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem('invoicepro_payments');
    return saved ? JSON.parse(saved) : initialPayments;
  });

  const [receipts, setReceipts] = useState<ReceiptRecord[]>(() => {
    const saved = localStorage.getItem('invoicepro_receipts');
    return saved ? JSON.parse(saved) : initialReceipts;
  });

  const [batchItems, setBatchItems] = useState<BatchItem[]>(() => {
    const saved = localStorage.getItem('invoicepro_batch_items');
    return saved ? JSON.parse(saved) : initialBatches;
  });

  const [saleOrders, setSaleOrders] = useState<SaleOrder[]>(() => {
    const saved = localStorage.getItem('invoicepro_sale_orders');
    return saved ? JSON.parse(saved) : initialSaleOrders;
  });

  const [purchases, setPurchases] = useState<PurchaseRecord[]>(() => {
    const saved = localStorage.getItem('invoicepro_purchases');
    return saved ? JSON.parse(saved) : initialPurchases;
  });

  const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>(() => {
    const saved = localStorage.getItem('invoicepro_purchase_returns');
    return saved ? JSON.parse(saved) : initialPurchaseReturns;
  });

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => {
    const saved = localStorage.getItem('invoicepro_purchase_orders');
    return saved ? JSON.parse(saved) : initialPurchaseOrders;
  });

  const [otherIncomes, setOtherIncomes] = useState<OtherIncome[]>(() => {
    const saved = localStorage.getItem('invoicepro_other_incomes');
    return saved ? JSON.parse(saved) : initialOtherIncomes;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('invoicepro_expenses');
    return saved ? JSON.parse(saved) : initialExpenses;
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

  // Check URL parameters for direct client portal
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
  useEffect(() => {
    localStorage.setItem('invoicepro_payments', JSON.stringify(payments));
  }, [payments]);
  useEffect(() => {
    localStorage.setItem('invoicepro_receipts', JSON.stringify(receipts));
  }, [receipts]);
  useEffect(() => {
    localStorage.setItem('invoicepro_batch_items', JSON.stringify(batchItems));
  }, [batchItems]);
  useEffect(() => {
    localStorage.setItem('invoicepro_sale_orders', JSON.stringify(saleOrders));
  }, [saleOrders]);
  useEffect(() => {
    localStorage.setItem('invoicepro_purchases', JSON.stringify(purchases));
  }, [purchases]);
  useEffect(() => {
    localStorage.setItem('invoicepro_purchase_returns', JSON.stringify(purchaseReturns));
  }, [purchaseReturns]);
  useEffect(() => {
    localStorage.setItem('invoicepro_purchase_orders', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);
  useEffect(() => {
    localStorage.setItem('invoicepro_other_incomes', JSON.stringify(otherIncomes));
  }, [otherIncomes]);
  useEffect(() => {
    localStorage.setItem('invoicepro_expenses', JSON.stringify(expenses));
  }, [expenses]);

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

  // --- Invoice Handlers ---
  const handleSaveInvoice = (invoice: Invoice, action: 'save' | 'send') => {
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
      `created for ${invoice.clientName} (${companyProfile.currencySymbol}${invoice.total.toFixed(2)}).`,
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

    // Record formal Payment & Official Receipt
    const paymentNumber = `PAY-${Math.floor(10000 + Math.random() * 90000)}`;
    const receiptNumber = `REC-${Math.floor(10000 + Math.random() * 90000)}`;
    const today = new Date().toISOString().split('T')[0];

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      paymentNumber,
      invoiceId: target.id,
      invoiceNumber: target.invoiceNumber,
      clientId: target.clientName,
      clientName: target.clientName,
      clientEmail: target.clientEmail,
      amount: target.total,
      date: today,
      method: 'bank_transfer',
      referenceNumber: `REF-SETTLE-${target.invoiceNumber}`,
      status: 'completed',
      notes: `Settled via invoice mark as paid action.`,
    };
    setPayments((prev) => [newPayment, ...prev]);

    const newReceipt: ReceiptRecord = {
      id: `rec-${Date.now()}`,
      receiptNumber,
      invoiceId: target.id,
      invoiceNumber: target.invoiceNumber,
      paymentId: newPayment.id,
      clientName: target.clientName,
      clientEmail: target.clientEmail,
      amount: target.total,
      date: today,
      paymentMethod: 'bank_transfer',
      referenceNumber: `REC-REF-${target.invoiceNumber}`,
      issuedBy: companyProfile.name,
      notes: `Formal receipt for invoice ${target.invoiceNumber}`,
    };
    setReceipts((prev) => [newReceipt, ...prev]);

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
      `${companyProfile.currencySymbol}${target.total.toFixed(2)}`,
      target.total
    );

    showToast('Payment Recorded', `Invoice ${target.invoiceNumber} marked as paid. Receipt ${receiptNumber} generated.`);
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

  // Bulk Invoice Operations
  const handleBulkMarkInvoicesPaid = (ids: string[]) => {
    setInvoices((prev) =>
      prev.map((inv) => (ids.includes(inv.id) ? { ...inv, status: 'paid' } : inv))
    );
    showToast('Bulk Action Complete', `${ids.length} invoices marked as paid.`);
  };

  const handleBulkDeleteInvoices = (ids: string[]) => {
    setInvoices((prev) => prev.filter((inv) => !ids.includes(inv.id)));
    showToast('Bulk Deletion Complete', `${ids.length} invoices deleted.`, 'info');
  };

  const handleBulkStatusChange = (ids: string[], status: InvoiceStatus) => {
    setInvoices((prev) =>
      prev.map((inv) => (ids.includes(inv.id) ? { ...inv, status } : inv))
    );
    showToast('Bulk Status Updated', `${ids.length} invoices set to ${status}.`);
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

    setEstimates((prev) =>
      prev.map((e) =>
        e.id === est.id
          ? { ...e, status: 'accepted', convertedToInvoiceId: newInvoice.invoiceNumber }
          : e
      )
    );

    setInvoices((prev) => [newInvoice, ...prev]);

    setClients((prev) =>
      prev.map((c) =>
        c.name === est.clientName
          ? { ...c, outstanding: c.outstanding + newInvoice.total, invoiceCount: c.invoiceCount + 1 }
          : c
      )
    );

    setConvertTargetEstimate(null);

    addActivity(
      'converted',
      'Estimate Converted',
      `${est.estimateNumber} converted to ${newInvoice.invoiceNumber}.`,
      newInvoice.invoiceNumber
    );

    setConvertSuccessData({ invoice: newInvoice, estimate: est });
  };

  // Estimate Handlers
  const handleSaveEstimate = (est: Estimate) => {
    setEstimates((prev) => [est, ...prev]);
    showToast('Estimate Created', `Estimate ${est.estimateNumber} sent to ${est.clientName}.`);
    addActivity(
      'estimate_sent',
      'Estimate Sent',
      `${est.estimateNumber} created for ${est.clientName} (${companyProfile.currencySymbol}${est.total.toFixed(2)}).`,
      est.estimateNumber
    );
  };

  const handleAddQuickEstimate = (estData: Omit<Estimate, 'id' | 'estimateNumber'>) => {
    const estNumber = `EST-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEst: Estimate = {
      ...estData,
      id: `est-${Date.now()}`,
      estimateNumber: estNumber,
    };
    setEstimates((prev) => [newEst, ...prev]);
    showToast('Quick Quote Generated', `Estimate ${estNumber} issued for ${newEst.clientName}.`);
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

  const handleSendPortalEmail = (client: Client) => {
    showToast('Portal Link Dispatched', `Direct access link emailed to ${client.email}`);
    addActivity(
      'invoice_created',
      'Shared Client Portal',
      `Direct portal link sent to ${client.name} (${client.email}).`,
      client.name
    );
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
  const handlePaymentSuccess = (invoiceId: string) => {
    handleMarkAsPaid(invoiceId);
  };

  // Recurring Schedule Handlers
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
      `Recurring billing schedule configured for ${schedule.clientName} (${companyProfile.currencySymbol}${schedule.total.toFixed(2)} / ${schedule.frequency}).`,
      schedule.frequency.toUpperCase()
    );
    setEditingRecurringSchedule(null);
  };

  const handleDeleteRecurringSchedule = (scheduleId: string) => {
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
    setInvoices((prev) => [invoice, ...prev]);
    setRecurringSchedules((prev) =>
      prev.map((s) => (s.id === updatedSchedule.id ? updatedSchedule : s))
    );
    setClients((prev) =>
      prev.map((c) =>
        c.name === invoice.clientName
          ? { ...c, invoiceCount: c.invoiceCount + 1, outstanding: c.outstanding + invoice.total }
          : c
      )
    );
    addActivity(
      'recurring_generated',
      `Auto Generated ${invoice.invoiceNumber}`,
      `Generated from recurring schedule "${schedule.title}" for ${schedule.clientName}.`,
      invoice.invoiceNumber
    );
    showToast(
      'Draft Generated',
      `Invoice ${invoice.invoiceNumber} created from recurring schedule "${schedule.title}".`
    );
  };

  const handleBatchProcessDueSchedules = () => {
    const dueList = recurringSchedules.filter((s) => isScheduleDue(s));
    let count = 0;
    dueList.forEach((sched) => {
      handleGenerateDraftNow(sched);
      count++;
    });
    showToast('Batch Run Complete', `Generated ${count} invoices from due recurring schedules.`);
  };

  const handleMakeRecurringFromInvoice = (invoice: Invoice) => {
    const newSchedule: Partial<RecurringSchedule> = {
      title: `Recurring - ${invoice.clientName}`,
      clientId: invoice.clientName,
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      clientAddress: invoice.clientAddress,
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      items: [...invoice.items],
      subtotal: invoice.subtotal,
      taxAmount: invoice.taxAmount,
      discount: invoice.discount || 0,
      total: invoice.total,
      paymentTermsDays: 14,
      autoSend: false,
      notes: invoice.notes,
    };
    setEditingRecurringSchedule(newSchedule);
    setIsCreateRecurringModalOpen(true);
  };

  // --- Financial & Operations Module Handlers ---
  // Payments
  const handleAddPayment = (newPayData: Omit<PaymentRecord, 'id' | 'paymentNumber'>) => {
    const paymentNumber = `PAY-${Math.floor(10000 + Math.random() * 90000)}`;
    const newPay: PaymentRecord = {
      ...newPayData,
      id: `pay-${Date.now()}`,
      paymentNumber,
    };
    setPayments((prev) => [newPay, ...prev]);

    // Also generate matching Receipt record
    const receiptNumber = `REC-${Math.floor(10000 + Math.random() * 90000)}`;
    const newRec: ReceiptRecord = {
      id: `rec-${Date.now()}`,
      receiptNumber,
      invoiceId: newPayData.invoiceId,
      invoiceNumber: newPayData.invoiceNumber,
      paymentId: newPay.id,
      clientName: newPayData.clientName,
      clientEmail: newPayData.clientEmail,
      amount: newPayData.amount,
      date: newPayData.date,
      paymentMethod: newPayData.method,
      referenceNumber: newPayData.referenceNumber,
      issuedBy: companyProfile.name,
      notes: `Automatic receipt issued upon payment settlement.`,
    };
    setReceipts((prev) => [newRec, ...prev]);

    // Mark invoice as paid if matching
    if (newPayData.invoiceId) {
      setInvoices((prev) =>
        prev.map((i) => (i.id === newPayData.invoiceId || i.invoiceNumber === newPayData.invoiceNumber ? { ...i, status: 'paid' } : i))
      );
    }

    showToast('Payment Recorded', `Payment ${paymentNumber} logged & Receipt ${receiptNumber} issued.`);
  };

  const handleDeletePayment = (paymentId: string) => {
    setPayments((prev) => prev.filter((p) => p.id !== paymentId));
    showToast('Payment Removed', 'Payment entry deleted.', 'info');
  };

  // Receipts
  const handleAddReceipt = (recData: Omit<ReceiptRecord, 'id' | 'receiptNumber'>) => {
    const receiptNumber = `REC-${Math.floor(10000 + Math.random() * 90000)}`;
    const newRec: ReceiptRecord = {
      ...recData,
      id: `rec-${Date.now()}`,
      receiptNumber,
    };
    setReceipts((prev) => [newRec, ...prev]);
    showToast('Receipt Generated', `Official receipt ${receiptNumber} created.`);
  };

  const handleDeleteReceipt = (receiptId: string) => {
    setReceipts((prev) => prev.filter((r) => r.id !== receiptId));
    showToast('Receipt Removed', 'Receipt voucher deleted.', 'info');
  };

  // Batch Tracking
  const handleAddBatchItem = (batchData: Omit<BatchItem, 'id' | 'createdAt'>) => {
    const newBatch: BatchItem = {
      ...batchData,
      id: `batch-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setBatchItems((prev) => [newBatch, ...prev]);
    showToast('Batch Registered', `Batch ${newBatch.batchNumber} logged for ${newBatch.itemName}.`);
  };

  const handleUpdateBatchStatus = (id: string, status: BatchStatus, qty?: number) => {
    setBatchItems((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              status,
              quantity: qty !== undefined ? qty : b.quantity,
            }
          : b
      )
    );
    showToast('Batch Updated', 'Batch status and stock updated.');
  };

  const handleDeleteBatchItem = (batchId: string) => {
    setBatchItems((prev) => prev.filter((b) => b.id !== batchId));
    showToast('Batch Removed', 'Batch registry entry removed.', 'info');
  };

  // Sale Orders
  const handleAddSaleOrder = (soData: Omit<SaleOrder, 'id' | 'orderNumber'>) => {
    const orderNumber = `SO-${Math.floor(10000 + Math.random() * 90000)}`;
    const newSO: SaleOrder = {
      ...soData,
      id: `so-${Date.now()}`,
      orderNumber,
    };
    setSaleOrders((prev) => [newSO, ...prev]);
    showToast('Sale Order Created', `Sale Order ${orderNumber} logged for ${newSO.clientName}.`);
  };

  const handleUpdateOrderStatus = (id: string, status: SaleOrderStatus) => {
    setSaleOrders((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    showToast('Order Status Updated', `Sale order updated to ${status}.`);
  };

  const handleConvertSaleOrderToInvoice = (so: SaleOrder) => {
    const newInv: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      clientName: so.clientName,
      clientEmail: so.clientEmail,
      clientAddress: clients.find((c) => c.name === so.clientName)?.address || '',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [...so.items],
      subtotal: so.subtotal,
      taxAmount: so.taxAmount,
      discount: 0,
      total: so.total,
      status: 'pending',
      notes: `Generated from Sale Order ${so.orderNumber}. ${so.notes || ''}`,
      createdAt: new Date().toISOString(),
    };
    setInvoices((prev) => [newInv, ...prev]);
    setSaleOrders((prev) =>
      prev.map((s) => (s.id === so.id ? { ...s, status: 'delivered', invoiceGeneratedId: newInv.invoiceNumber } : s))
    );
    showToast('Sale Order Invoiced', `Invoice ${newInv.invoiceNumber} created from ${so.orderNumber}.`);
    setCurrentTab('invoices');
  };

  const handleDeleteSaleOrder = (soId: string) => {
    setSaleOrders((prev) => prev.filter((s) => s.id !== soId));
    showToast('Sale Order Removed', 'Sale order removed.', 'info');
  };

  // Purchases & Returns
  const handleAddPurchaseRecord = (pData: Omit<PurchaseRecord, 'id' | 'purchaseNumber'>) => {
    const purchaseNumber = `PUR-${Math.floor(10000 + Math.random() * 90000)}`;
    const newP: PurchaseRecord = {
      ...pData,
      id: `pur-${Date.now()}`,
      purchaseNumber,
    };
    setPurchases((prev) => [newP, ...prev]);
    showToast('Purchase Logged', `Purchase bill ${purchaseNumber} saved.`);
  };

  const handleAddPurchaseReturn = (retData: Omit<PurchaseReturn, 'id' | 'returnNumber'>) => {
    const returnNumber = `RET-${Math.floor(10000 + Math.random() * 90000)}`;
    const newRet: PurchaseReturn = {
      ...retData,
      id: `ret-${Date.now()}`,
      returnNumber,
    };
    setPurchaseReturns((prev) => [newRet, ...prev]);
    showToast('Return Processed', `Purchase return debit note ${returnNumber} issued.`);
  };

  const handleDeletePurchaseRecord = (purchaseId: string) => {
    setPurchases((prev) => prev.filter((p) => p.id !== purchaseId));
    showToast('Purchase Deleted', 'Purchase record removed.', 'info');
  };

  // Purchase Orders
  const handleAddPurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'poNumber'>) => {
    const poNumber = `PO-${Math.floor(10000 + Math.random() * 90000)}`;
    const newPO: PurchaseOrder = {
      ...poData,
      id: `po-${Date.now()}`,
      poNumber,
    };
    setPurchaseOrders((prev) => [newPO, ...prev]);
    showToast('Purchase Order Sent', `PO ${poNumber} dispatched to ${newPO.vendorName}.`);
  };

  const handleUpdatePoStatus = (id: string, status: PurchaseOrderStatus) => {
    setPurchaseOrders((prev) => prev.map((po) => (po.id === id ? { ...po, status } : po)));
    showToast('PO Updated', `Purchase order updated to ${status}.`);
  };

  const handleDeletePurchaseOrder = (poId: string) => {
    setPurchaseOrders((prev) => prev.filter((po) => po.id !== poId));
    showToast('PO Removed', 'Purchase order deleted.', 'info');
  };

  // Other Income
  const handleAddOtherIncome = (incData: Omit<OtherIncome, 'id' | 'incomeNumber'>) => {
    const incomeNumber = `INC-${Math.floor(10000 + Math.random() * 90000)}`;
    const newInc: OtherIncome = {
      ...incData,
      id: `inc-${Date.now()}`,
      incomeNumber,
    };
    setOtherIncomes((prev) => [newInc, ...prev]);
    showToast('Income Logged', `Non-operating revenue voucher ${incomeNumber} recorded.`);
  };

  const handleDeleteOtherIncome = (id: string) => {
    setOtherIncomes((prev) => prev.filter((i) => i.id !== id));
    showToast('Income Entry Deleted', 'Other income voucher deleted.', 'info');
  };

  // Expenses
  const handleAddExpense = (expData: Omit<Expense, 'id' | 'expenseNumber'>) => {
    const expenseNumber = `EXP-${Math.floor(10000 + Math.random() * 90000)}`;
    const newExp: Expense = {
      ...expData,
      id: `exp-${Date.now()}`,
      expenseNumber,
    };
    setExpenses((prev) => [newExp, ...prev]);
    showToast('Expense Logged', `Expense voucher ${expenseNumber} saved.`);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showToast('Expense Removed', 'Expense voucher removed.', 'info');
  };

  // Due recurring count calculation
  const dueRecurringCount = recurringSchedules.filter((s) => isScheduleDue(s)).length;
  const lowStockCount = items.filter((i) => i.stock <= i.lowStockThreshold).length;

  // Direct Client Portal Mode Check
  if (isDirectPortalMode && portalClient) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <ClientPortalView
          client={portalClient}
          invoices={invoices}
          companyProfile={companyProfile}
          onPayInvoice={(inv) => setPaymentPortalInvoice(inv)}
          onExitPreview={() => setIsDirectPortalMode(false)}
          isDirectPortalMode={true}
        />
        {/* Payment Simulation Modal */}
        <PaymentPortalModal
          invoice={paymentPortalInvoice}
          companyProfile={companyProfile}
          isOpen={Boolean(paymentPortalInvoice)}
          onClose={() => setPaymentPortalInvoice(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
        {/* Document Preview Modal */}
        <InvoicePrintPreviewModal
          document={previewDoc?.doc || null}
          type={previewDoc?.type || 'invoice'}
          companyProfile={companyProfile}
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          onSendEmail={() => {}}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 font-sans antialiased text-slate-800 overflow-hidden">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Main Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        invoiceCount={invoices.length}
        recurringCount={recurringSchedules.length}
        estimateCount={estimates.length}
        lowStockCount={lowStockCount}
        saleOrderCount={saleOrders.length}
        paymentCount={payments.length}
        purchaseCount={purchases.length}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-6 custom-scrollbar">
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
              items={items}
              companyProfile={companyProfile}
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
              onBulkMarkPaid={handleBulkMarkInvoicesPaid}
              onBulkDelete={handleBulkDeleteInvoices}
              onBulkStatusChange={handleBulkStatusChange}
            />
          )}

          {currentTab === 'estimates' && (
            <EstimatesView
              estimates={estimates}
              clients={clients}
              companyProfile={companyProfile}
              onOpenCreateEstimate={() => setIsCreateEstimateOpen(true)}
              onAddQuickEstimate={handleAddQuickEstimate}
              onOpenConvertModal={(est) => setConvertTargetEstimate(est)}
              onDeleteEstimate={handleDeleteEstimate}
              onViewEstimate={(est) => setPreviewDoc({ doc: est, type: 'estimate' })}
              onSendEstimate={(est) => {
                showToast('Estimate Sent', `Email with quote PDF dispatched to ${est.clientEmail}`);
              }}
            />
          )}

          {currentTab === 'sale_orders' && (
            <SaleOrdersView
              saleOrders={saleOrders}
              clients={clients}
              inventoryItems={items}
              companyProfile={companyProfile}
              onAddSaleOrder={handleAddSaleOrder}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onConvertToInvoice={handleConvertSaleOrderToInvoice}
              onDeleteSaleOrder={handleDeleteSaleOrder}
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

          {currentTab === 'payments' && (
            <PaymentsView
              payments={payments}
              clients={clients}
              invoices={invoices}
              companyProfile={companyProfile}
              onAddPayment={handleAddPayment}
              onDeletePayment={handleDeletePayment}
            />
          )}

          {currentTab === 'receipts' && (
            <ReceiptsView
              receipts={receipts}
              companyProfile={companyProfile}
              onAddReceipt={handleAddReceipt}
              onDeleteReceipt={handleDeleteReceipt}
            />
          )}

          {currentTab === 'purchases' && (
            <PurchasesView
              purchases={purchases}
              purchaseReturns={purchaseReturns}
              companyProfile={companyProfile}
              onAddPurchase={handleAddPurchaseRecord}
              onAddPurchaseReturn={handleAddPurchaseReturn}
              onDeletePurchase={handleDeletePurchaseRecord}
            />
          )}

          {currentTab === 'purchase_orders' && (
            <PurchaseOrdersView
              purchaseOrders={purchaseOrders}
              companyProfile={companyProfile}
              onAddPurchaseOrder={handleAddPurchaseOrder}
              onUpdatePoStatus={handleUpdatePoStatus}
              onDeletePurchaseOrder={handleDeletePurchaseOrder}
            />
          )}

          {currentTab === 'batch_tracking' && (
            <BatchTrackingView
              batches={batchItems}
              inventoryItems={items}
              companyProfile={companyProfile}
              onAddBatch={handleAddBatchItem}
              onUpdateBatchStatus={handleUpdateBatchStatus}
              onDeleteBatch={handleDeleteBatchItem}
            />
          )}

          {currentTab === 'other_income' && (
            <OtherIncomeView
              otherIncomes={otherIncomes}
              companyProfile={companyProfile}
              onAddOtherIncome={handleAddOtherIncome}
              onDeleteOtherIncome={handleDeleteOtherIncome}
            />
          )}

          {currentTab === 'expenses' && (
            <ExpensesView
              expenses={expenses}
              companyProfile={companyProfile}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
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
                showToast('Settings Saved', 'Company profile and default currency updated.');
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
