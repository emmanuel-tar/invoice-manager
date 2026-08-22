export type NavigationTab = 
  | 'dashboard'
  | 'invoices'
  | 'recurring'
  | 'create_invoice'
  | 'estimates'
  | 'send_invoice'
  | 'items'
  | 'clients'
  | 'reports'
  | 'settings'
  | 'onboarding';

export interface LineItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  taxRate: number;
  total: number;
}

export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'draft';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  clientAvatar?: string;
  date: string;
  dueDate: string;
  items: LineItem[];
  subtotal: number;
  taxAmount: number;
  discount: number;
  total: number;
  status: InvoiceStatus;
  notes?: string;
  estimateRef?: string;
  createdAt: string;
}

export type EstimateStatus = 'sent' | 'accepted' | 'rejected' | 'expired';

export interface Estimate {
  id: string;
  estimateNumber: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  clientAvatar?: string;
  date: string;
  expiryDate: string;
  items: LineItem[];
  subtotal: number;
  taxAmount: number;
  discount: number;
  total: number;
  status: EstimateStatus;
  notes?: string;
  convertedToInvoiceId?: string;
}

export interface Client {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  logo?: string;
  outstanding: number;
  totalRevenue: number;
  invoiceCount: number;
  activeProjects: number;
  status: 'active' | 'overdue' | 'inactive';
  portalToken?: string;
  portalTokenCreatedAt?: string;
  notes?: string;
  notesUpdatedAt?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  lowStockThreshold: number;
  unitPrice: number;
  taxRate: number;
  status: 'in_stock' | 'low' | 'out';
}

export interface CompanyProfile {
  name: string;
  taxId: string;
  address: string;
  phone: string;
  logoUrl?: string;
  bankName: string;
  accountNumber: string;
  currency: string;
  currencySymbol: string;
  defaultTaxRate: number;
  templateId: 'classic' | 'modern' | 'minimalist';
}

export interface TaxRate {
  id: string;
  name: string;
  rate: number;
  type: string;
  isDefault?: boolean;
}

export interface Activity {
  id: string;
  type: 'payment' | 'overdue' | 'warning' | 'invoice_created' | 'estimate_sent' | 'converted' | 'recurring_generated';
  title: string;
  highlightText?: string;
  description: string;
  timeAgo: string;
  timestamp: number;
  amount?: number;
}

export type RecurringFrequency = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annually';

export type RecurringScheduleStatus = 'active' | 'paused' | 'completed';

export interface RecurringSchedule {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  clientAvatar?: string;
  frequency: RecurringFrequency;
  startDate: string;
  nextBillingDate: string;
  endDate?: string;
  paymentTermsDays: number;
  items: LineItem[];
  subtotal: number;
  taxAmount: number;
  discount: number;
  total: number;
  autoSend: boolean; // false = generate as draft, true = auto-send
  status: RecurringScheduleStatus;
  generatedInvoicesCount: number;
  lastGeneratedDate?: string;
  notes?: string;
  createdAt: string;
}

export interface BillingPatternPreset {
  id: string;
  title: string;
  description: string;
  frequency: RecurringFrequency;
  paymentTermsDays: number;
  suggestedItems: Omit<LineItem, 'id'>[];
  category: string;
}
