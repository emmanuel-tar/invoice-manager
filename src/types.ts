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
  | 'onboarding'
  | 'payments'
  | 'receipts'
  | 'batch_tracking'
  | 'sale_orders'
  | 'purchases'
  | 'purchase_orders'
  | 'other_income'
  | 'expenses';

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
  autoSend: boolean;
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

// Payment Types
export type PaymentMethod = 'bank_transfer' | 'credit_card' | 'cash' | 'pos' | 'cheque' | 'online';

export interface PaymentRecord {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  referenceNumber: string;
  status: 'completed' | 'pending' | 'failed';
  notes?: string;
}

// Receipt Types
export interface ReceiptRecord {
  id: string;
  receiptNumber: string;
  invoiceId?: string;
  invoiceNumber?: string;
  paymentId?: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  issuedBy: string;
  notes?: string;
}

// Batch & Serial Number Tracking
export type BatchStatus = 'active' | 'low_stock' | 'quarantine' | 'expired' | 'depleted';

export interface BatchItem {
  id: string;
  batchNumber: string;
  serialNumber?: string;
  itemId: string;
  itemName: string;
  sku: string;
  quantity: number;
  initialQuantity: number;
  manufacturingDate: string;
  expiryDate: string;
  warehouseLocation: string;
  supplierName: string;
  status: BatchStatus;
  complianceCertNumber?: string;
  notes?: string;
  createdAt: string;
}

// Sale Order Types
export type SaleOrderStatus = 'draft' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface SaleOrder {
  id: string;
  orderNumber: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  orderDate: string;
  expectedDeliveryDate: string;
  items: LineItem[];
  subtotal: number;
  taxAmount: number;
  discount: number;
  total: number;
  status: SaleOrderStatus;
  invoiceGeneratedId?: string;
  notes?: string;
}

// Purchase Record & Return Types
export type PurchaseStatus = 'paid' | 'partial' | 'unpaid';

export interface PurchaseRecord {
  id: string;
  purchaseNumber: string;
  vendorName: string;
  vendorEmail: string;
  vendorPhone?: string;
  purchaseDate: string;
  items: LineItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  status: PurchaseStatus;
  receiptUrl?: string;
  notes?: string;
}

export type PurchaseReturnStatus = 'pending' | 'approved' | 'completed' | 'rejected';

export interface PurchaseReturn {
  id: string;
  returnNumber: string;
  purchaseId: string;
  purchaseNumber: string;
  vendorName: string;
  returnDate: string;
  reason: string;
  items: LineItem[];
  refundAmount: number;
  status: PurchaseReturnStatus;
  notes?: string;
}

// Purchase Order Types
export type PurchaseOrderStatus = 'draft' | 'ordered' | 'received' | 'cancelled';

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorName: string;
  vendorEmail: string;
  vendorAddress: string;
  orderDate: string;
  expectedDeliveryDate: string;
  items: LineItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  status: PurchaseOrderStatus;
  notes?: string;
}

// Other Income Types
export type IncomeCategory = 'Interest' | 'Consulting' | 'Grants' | 'Dividends' | 'Asset Sale' | 'Royalties' | 'Other';

export interface OtherIncome {
  id: string;
  incomeNumber: string;
  source: string;
  category: IncomeCategory;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  description: string;
  notes?: string;
}

// Expense Types
export type ExpenseCategory = 
  | 'Rent & Utilities' 
  | 'Salaries & Wages' 
  | 'Office Supplies' 
  | 'Software & Subscriptions' 
  | 'Marketing & Ads' 
  | 'Travel & Logistics' 
  | 'Maintenance & Repairs' 
  | 'Professional Services'
  | 'Taxes & Levies'
  | 'Other';

export type ExpenseStatus = 'approved' | 'pending' | 'reimbursed';

export interface Expense {
  id: string;
  expenseNumber: string;
  category: ExpenseCategory;
  vendor: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  taxDeductible: boolean;
  status: ExpenseStatus;
  notes?: string;
}
