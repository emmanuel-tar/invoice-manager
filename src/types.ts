export type NavigationTab = 
  | 'dashboard'
  | 'invoices'
  | 'recurring'
  | 'create_invoice'
  | 'estimates'
  | 'send_invoice'
  | 'delivery_notes'
  | 'credit_notes'
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

// Delivery Note Types
export type DeliveryStatus = 'draft' | 'dispatched' | 'in_transit' | 'delivered' | 'returned';

export interface DeliveryItem {
  id: string;
  itemId?: string;
  sku?: string;
  description: string;
  orderedQty: number;
  deliveredQty: number;
  unit: string;
  packageDetails?: string;
}

export interface DeliveryNote {
  id: string;
  noteNumber: string;
  invoiceNumber?: string;
  saleOrderNumber?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  deliveryAddress: string;
  dispatchDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  carrierName: string;
  trackingNumber: string;
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  packagesCount: number;
  totalWeightKg?: number;
  items: DeliveryItem[];
  status: DeliveryStatus;
  receivedBy?: string;
  receiverSignature?: string;
  notes?: string;
  createdAt: string;
}

// Credit Note Types
export type CreditNoteStatus = 'issued' | 'applied' | 'refunded' | 'void';
export type CreditReason = 
  | 'Damaged / Defective Goods' 
  | 'Pricing Error / Overbilled' 
  | 'Order Cancellation / Return' 
  | 'Post-Sale Discount / Rebate' 
  | 'Service Quality Issue' 
  | 'Other';

export interface CreditNote {
  id: string;
  creditNoteNumber: string;
  originalInvoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  issueDate: string;
  reason: CreditReason;
  items: LineItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  remainingCredit: number;
  status: CreditNoteStatus;
  appliedToInvoiceId?: string;
  notes?: string;
  createdAt: string;
}

// Bank Account Information
export interface BankAccountInfo {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  sortCode?: string;
  iban?: string;
  swiftBic?: string;
  isPrimary: boolean;
  paymentInstructions?: string;
}

// Extended Application Settings
export interface AppSettings {
  // 1. Customize Home Screen (Visual Layout | Show/Hide Tabs)
  hiddenTabs: NavigationTab[];
  compactDensity: boolean;
  defaultLandingTab: NavigationTab;
  sidebarTheme: 'dark' | 'midnight' | 'slate' | 'emerald';
  dashboardWidgets: {
    quickStats: boolean;
    revenueChart: boolean;
    recentActivity: boolean;
    lowStockAlerts: boolean;
    upcomingRecurring: boolean;
    cashflowSummary: boolean;
  };

  // 2. Discount & Tax Settings
  enableItemDiscounts: boolean;
  enableInvoiceDiscounts: boolean;
  maxDiscountPercent: number;
  taxMode: 'exclusive' | 'inclusive';
  taxLabel: string;
  enableWithholdingTax: boolean;
  withholdingTaxRate: number;

  // 3. Language & Localization
  language: 'en' | 'fr' | 'es' | 'de' | 'ar' | 'pt' | 'zh' | 'yo' | 'ha' | 'ig';
  dateFormat: 'YYYY-MM-DD' | 'DD/MM/YYYY' | 'MM/DD/YYYY';
  numberFormat: 'standard' | 'european' | 'indian';
  rtlEnabled: boolean;

  // 4. Invoice & Billing Settings
  documentPreferences: {
    invoicePrefix: string;
    estimatePrefix: string;
    deliveryNotePrefix: string;
    creditNotePrefix: string;
    saleOrderPrefix: string;
    purchasePrefix: string;
    defaultDueDays: number;
    autoIncrementNumber: boolean;
    roundTotalMethod: 'none' | 'nearest_whole' | 'round_up';
  };
  templateSettings: {
    templateStyle: 'classic' | 'modern' | 'minimalist' | 'thermal_pos' | 'executive';
    primaryAccentColor: string;
    fontFamily: string;
    showWatermark: boolean;
    showCompanyLogo: boolean;
    showSignature: boolean;
    showStamp: boolean;
  };
  invoiceHeaderFooter: {
    invoiceTitle: string;
    headerSubtitle: string;
    footerDisclaimer: string;
    footerDeclaration: string;
    showQrCodeVerification: boolean;
  };
  bankAccounts: BankAccountInfo[];
  termsAndConditions: {
    defaultTerms: string;
    paymentPolicy: string;
    returnPolicy: string;
    warrantyNotice: string;
  };
  manageFields: {
    showSku: boolean;
    showUnit: boolean;
    showDiscount: boolean;
    showTaxRate: boolean;
    showHsnSac: boolean;
    showItemImage: boolean;
    showBatchNumber: boolean;
    customField1Label: string;
    customField2Label: string;
  };

  // 5. Hardware & Devices
  printerSettings: {
    paperSize: 'A4' | 'Letter' | 'A5' | 'Thermal 80mm' | 'Thermal 58mm';
    autoPrintOnSave: boolean;
    printMargins: 'normal' | 'narrow' | 'borderless';
    silentPrinting: boolean;
    printerName: string;
  };
  barcodeScannerSettings: {
    enableCameraScanner: boolean;
    enableUsbWedge: boolean;
    soundOnScan: boolean;
    scanAction: 'lookup' | 'add_to_cart' | 'view_details';
  };

  // 6. Data & Online Management
  autoBackupInterval: 'daily' | 'weekly' | 'monthly' | 'disabled';
  cloudStorage: {
    googleDriveConnected: boolean;
    googleDriveEmail?: string;
    dropboxConnected: boolean;
    dropboxEmail?: string;
    autoSyncEnabled: boolean;
    lastSyncTimestamp?: string;
  };
  imageAssets: {
    logoUrl?: string;
    signatureUrl?: string;
    stampUrl?: string;
    watermarkUrl?: string;
  };
}

