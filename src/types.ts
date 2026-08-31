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
  | 'expenses'
  | 'approvals'
  | 'multi_currency'
  | 'tax_settings'
  | 'reminders'
  | 'bank_reconciliation'
  | 'audit_logs'
  | 'payment_gateways'
  | 'email_automation'
  | 'sms_notifications'
  | 'time_tracking'
  | 'projects'
  | 'late_fees'
  | 'template_builder'
  | 'e_signature'
  | 'bank_feeds'
  | 'inventory_advanced'
  | 'team_collaboration'
  | 'cashflow_forecast'
  | 'budget_management'
  | 'asset_management'
  | 'document_management'
  | 'subscription_management'
  | 'ai_features'
  | 'pos'
  | 'api_webhooks'
  | 'client_feedback'
  | 'custom_dashboard';

// === Approval Workflow ===
export type ApprovalStatus = 'pending_approval' | 'approved' | 'rejected';

export interface ApprovalInfo {
  status: ApprovalStatus;
  requestedBy?: string;
  requestedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface ApprovableDoc {
  id: string;
  number: string;
  clientName: string;
  total: number;
  status: string;
  type: 'invoice' | 'purchase_order' | 'credit_note';
  date: string;
  approval?: ApprovalInfo;
}

export interface LineItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  taxRate: number;
  total: number;
}

export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'draft' | 'pending_approval';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  payment_token: string;
  paymentToken?: string;
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
  approval?: ApprovalInfo;
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
  costPrice?: number;
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
export type PurchaseOrderStatus = 'draft' | 'ordered' | 'received' | 'cancelled' | 'pending_approval';

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
  approval?: ApprovalInfo;
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
export type CreditNoteStatus = 'issued' | 'applied' | 'refunded' | 'void' | 'pending_approval';
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
  approval?: ApprovalInfo;
}

export interface PaymentGateway {
  id: string;
  name: string;
  type: 'paystack' | 'flutterwave' | 'stripe' | 'manual' | 'bank_transfer' | 'mobile_money' | 'crypto';
  apiKey?: string;
  secretKey?: string;
  isActive: boolean;
  supportedCurrencies: string[];
  transactionFee: number;
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  reference: string;
  gatewayId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  clientName: string;
  clientEmail: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface BankTransaction {
  id: string;
  reference: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  status: 'pending' | 'cleared' | 'matched' | 'unmatched';
  invoiceId?: string;
  paymentId?: string;
  matchedAmount?: number;
  reconciliationNotes?: string;
}

export interface AutomatedReminder {
  id: string;
  type: 'invoice_overdue' | 'payment_due' | 'recurring_schedule' | 'credit_note_issued' | 'custom';
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  beforeDays?: number;
  template?: string;
  channels: ('email' | 'sms' | 'in_app' | 'push')[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  userId: string;
  userName: string;
  entityType: 'invoice' | 'client' | 'payment' | 'expense' | 'user';
  entityId: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  decimalPlaces: number;
  isCrypto?: boolean;
  exchangeRate?: number;
  lastUpdated?: string;
}

export interface TaxCalculation {
  amount: number;
  rate: number;
  taxType: 'vat' | 'gst' | 'sales_tax' | 'withholding' | 'custom';
  jurisdiction?: string;
  exemptAmount?: number;
  exemptStatus?: boolean;
}

export interface SmartMatch {
  transactionId: string;
  invoiceId?: string;
  confidence: number;
  pattern: 'exact' | 'partial' | 'fuzzy' | 'manual';
  suggestions?: Array<{ invoiceId: string; amount: number; reference: string; confidence: number; reason: string }>;
  autoMatch?: boolean;
  notes?: string;
}
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
  imageAssets: {
    logoUrl?: string;
    signatureUrl?: string;
    stampUrl?: string;
    watermarkUrl?: string;
  };
}

// === Payment Gateway Integration ===
export interface PaymentGateway {
  id: string;
  name: string;
  type: 'paystack' | 'flutterwave' | 'stripe' | 'custom';
  apiKey: string;
  secretKey: string;
  webhookSecret?: string;
  isActive: boolean;
  supportedCurrencies: string[];
  transactionFee: number;
  createdAt: string;
}

export interface PaymentTransaction {
  id: string;
  invoiceId: string;
  gatewayId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  reference: string;
  customerEmail: string;
  gatewayResponse?: Record<string, any>;
  createdAt: string;
}

// === Email & SMS Automation ===
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: 'invoice' | 'reminder' | 'thank_you' | 'overdue' | 'estimate' | 'custom';
  isActive: boolean;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: 'invoice_created' | 'invoice_sent' | 'payment_received' | 'invoice_overdue' | 'estimate_accepted' | 'before_due';
  action: 'send_email' | 'send_sms' | 'apply_late_fee' | 'create_task';
  templateId?: string;
  delay?: number; // hours
  isActive: boolean;
}

export interface SmsConfig {
  provider: 'twilio' | 'termii' | 'africastalking';
  apiKey: string;
  senderId: string;
  isEnabled: boolean;
}

// === Time Tracking ===
export interface TimeEntry {
  id: string;
  projectId: string;
  userId: string;
  description: string;
  startTime: string;
  endTime?: string;
  duration: number; // minutes
  isBillable: boolean;
  hourlyRate: number;
  invoiced: boolean;
  invoiceId?: string;
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  status: 'active' | 'completed' | 'on_hold' | 'cancelled';
  budget?: number;
  hourlyRate: number;
  startDate: string;
  endDate?: string;
  description?: string;
}

// === Late Fee Configuration ===
export interface LateFeeRule {
  id: string;
  name: string;
  feeType: 'flat' | 'percentage' | 'compound';
  amount: number;
  gracePeriodDays: number;
  maxFee?: number;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
}

// === E-Signature ===
export interface SignatureDocument {
  id: string;
  documentType: 'invoice' | 'estimate' | 'contract';
  documentId: string;
  signatureData?: string;
  signedAt?: string;
  signerName?: string;
  signerEmail?: string;
  status: 'pending' | 'signed' | 'expired';
  expiresAt: string;
}

// === Bank Reconciliation ===
export interface BankTransaction {
  id: string;
  accountId: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  reference?: string;
  matched: boolean;
  matchedInvoiceId?: string;
  category?: string;
}

// === Inventory Advanced ===
export interface Warehouse {
  id: string;
  name: string;
  location: string;
  isDefault: boolean;
}

export interface StockTransfer {
  id: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  itemId: string;
  quantity: number;
  date: string;
  status: 'pending' | 'in_transit' | 'completed';
  notes?: string;
}

// === Team Collaboration ===
export interface TeamComment {
  id: string;
  entityType: 'invoice' | 'client' | 'payment' | 'project';
  entityId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
  mentions?: string[];
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
  createdAt: string;
}

// === Cashflow Forecast ===
export interface CashflowForecast {
  id: string;
  period: string;
  predictedIncome: number;
  predictedExpenses: number;
  netCashflow: number;
  confidence: number;
  createdAt: string;
}

// === Budget Management ===
export interface Budget {
  id: string;
  name: string;
  category: string;
  amount: number;
  spent: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  alerts: boolean;
  alertThreshold: number; // percentage
}

// === Asset Management ===
export interface Asset {
  id: string;
  name: string;
  category: string;
  purchasePrice: number;
  currentValue: number;
  purchaseDate: string;
  depreciationRate: number;
  depreciationMethod: 'straight_line' | 'declining_balance';
  status: 'active' | 'disposed' | 'sold';
  serialNumber?: string;
}

// === Document Management ===
export interface DocumentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  entityType?: string;
  entityId?: string;
  uploadedBy: string;
  createdAt: string;
  tags?: string[];
}

// === Subscription Management ===
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  maxInvoices: number;
  maxClients: number;
  isActive: boolean;
}

// === POS ===
export interface POSTransaction {
  id: string;
  items: { itemId: string; quantity: number; price: number }[];
  total: number;
  tax: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  cashierId: string;
  createdAt: string;
}

// === API & Webhooks ===
export interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  lastTriggered?: string;
}

// === Client Feedback ===
export interface ClientFeedback {
  id: string;
  clientId: string;
  invoiceId?: string;
  rating: number;
  comment?: string;
  nps: number;
  createdAt: string;
}

// === AI Features ===
export interface OCRResult {
  id: string;
  documentType: 'receipt' | 'invoice';
  rawText: string;
  extractedData: Record<string, any>;
  confidence: number;
  createdAt: string;
}

