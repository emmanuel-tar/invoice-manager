import React, { useState, useMemo, useRef } from 'react';
import { 
  Building, 
  Coins, 
  Percent, 
  Shield, 
  Plus, 
  Trash2, 
  Check, 
  Save, 
  CheckCircle2, 
  Layers, 
  FileText,
  Sparkles,
  Edit3,
  X,
  Search,
  Globe,
  ArrowRight,
  Sliders,
  Eye,
  EyeOff,
  Layout,
  Palette,
  Landmark,
  FileSignature,
  Printer,
  QrCode,
  Scan,
  Database,
  UploadCloud,
  Download,
  Image as ImageIcon,
  HardDrive,
  RefreshCw,
  FileSpreadsheet,
  Settings as SettingsIcon,
  CheckSquare,
  Square,
  AlertTriangle,
  FolderSync,
  HelpCircle,
  Camera
} from 'lucide-react';
import { 
  CompanyProfile, 
  TaxRate, 
  AppSettings, 
  NavigationTab, 
  BankAccountInfo, 
  Invoice, 
  Client, 
  InventoryItem, 
  PaymentRecord,
  DeliveryNote,
  CreditNote
} from '../types';
import { WORLD_CURRENCIES, getCurrencyByCode, formatCurrencyAmount } from '../data/currencies';

interface SettingsViewProps {
  companyProfile: CompanyProfile;
  appSettings: AppSettings;
  taxRates: TaxRate[];
  invoices: Invoice[];
  clients: Client[];
  items: InventoryItem[];
  payments: PaymentRecord[];
  deliveryNotes?: DeliveryNote[];
  creditNotes?: CreditNote[];
  onUpdateCompanyProfile: (profile: CompanyProfile) => void;
  onUpdateAppSettings: (settings: AppSettings) => void;
  onAddTaxRate: (rate: TaxRate) => void;
  onDeleteTaxRate: (rateId: string) => void;
  onSetDefaultTaxRate: (rateId: string) => void;
  onLaunchOnboarding: () => void;
  onRestoreFullBackup?: (backupData: any) => void;
  onBulkImportClients?: (newClients: Client[]) => void;
  onBulkImportItems?: (newItems: InventoryItem[]) => void;
}

type MainSettingsSection = 
  | 'home_layout' 
  | 'discount_tax' 
  | 'language' 
  | 'invoice_billing' 
  | 'hardware' 
  | 'data_management' 
  | 'company_profile';

type InvoiceBillingSubSection = 
  | 'doc_prefs' 
  | 'templates' 
  | 'header_footer' 
  | 'bank_settings' 
  | 'terms_conditions' 
  | 'manage_fields';

type HardwareSubSection = 'printer' | 'scanner';

type DataSubSection = 'backup_restore' | 'bulk_upload' | 'manage_images' | 'export_data' | 'cloud_storage';

export const SettingsView: React.FC<SettingsViewProps> = ({
  companyProfile,
  appSettings,
  taxRates,
  invoices,
  clients,
  items,
  payments,
  deliveryNotes = [],
  creditNotes = [],
  onUpdateCompanyProfile,
  onUpdateAppSettings,
  onAddTaxRate,
  onDeleteTaxRate,
  onSetDefaultTaxRate,
  onLaunchOnboarding,
  onRestoreFullBackup,
  onBulkImportClients,
  onBulkImportItems,
}) => {
  const [activeSection, setActiveSection] = useState<MainSettingsSection>('home_layout');
  const [invoiceBillingSub, setInvoiceBillingSub] = useState<InvoiceBillingSubSection>('doc_prefs');
  const [hardwareSub, setHardwareSub] = useState<HardwareSubSection>('printer');
  const [dataSub, setDataSub] = useState<DataSubSection>('backup_restore');

  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setSavedSuccessMessage(msg);
    setTimeout(() => setSavedSuccessMessage(null), 3000);
  };

  // Local settings draft state
  const [settingsDraft, setSettingsDraft] = useState<AppSettings>(appSettings);
  const [profileDraft, setProfileDraft] = useState<CompanyProfile>(companyProfile);

  // Currency Search & Filter
  const [currencySearch, setCurrencySearch] = useState('');
  const [currencyRegion, setCurrencyRegion] = useState<string>('all');

  // New tax rate modal
  const [isAddTaxModalOpen, setIsAddTaxModalOpen] = useState(false);
  const [newTaxName, setNewTaxName] = useState('');
  const [newTaxPercentage, setNewTaxPercentage] = useState<number>(7.5);
  const [newTaxType, setNewTaxType] = useState('Value Added Tax');

  // Scanner Simulator / Camera Preview State
  const [isCameraScannerActive, setIsCameraScannerActive] = useState(false);
  const [simulatedScanCode, setSimulatedScanCode] = useState('');
  const [lastScannedResult, setLastScannedResult] = useState<string | null>(null);

  // Bank account modal
  const [isAddBankModalOpen, setIsAddBankModalOpen] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newSortCode, setNewSortCode] = useState('');
  const [newIban, setNewIban] = useState('');
  const [newSwiftBic, setNewSwiftBic] = useState('');
  const [newPaymentInstructions, setNewPaymentInstructions] = useState('');

  // Bulk Upload File Reader
  const clientFileInputRef = useRef<HTMLInputElement | null>(null);
  const itemFileInputRef = useRef<HTMLInputElement | null>(null);
  const backupRestoreInputRef = useRef<HTMLInputElement | null>(null);
  const [bulkUploadLogs, setBulkUploadLogs] = useState<string[]>([]);

  // Filtered Currencies for Company Profile
  const filteredCurrencies = useMemo(() => {
    return WORLD_CURRENCIES.filter((c) => {
      const matchesSearch = 
        c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
        c.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
        c.country.toLowerCase().includes(currencySearch.toLowerCase()) ||
        c.symbol.includes(currencySearch);
      
      const matchesRegion = currencyRegion === 'all' || c.region.toLowerCase() === currencyRegion.toLowerCase();
      return matchesSearch && matchesRegion;
    });
  }, [currencySearch, currencyRegion]);

  const handleSaveSettings = () => {
    onUpdateAppSettings(settingsDraft);
    onUpdateCompanyProfile(profileDraft);
    showNotification('Settings and configuration saved successfully!');
  };

  const handleToggleTabVisibility = (tabId: NavigationTab) => {
    const isCurrentlyHidden = settingsDraft.hiddenTabs.includes(tabId);
    let newHidden: NavigationTab[];
    if (isCurrentlyHidden) {
      newHidden = settingsDraft.hiddenTabs.filter(t => t !== tabId);
    } else {
      newHidden = [...settingsDraft.hiddenTabs, tabId];
    }
    setSettingsDraft({
      ...settingsDraft,
      hiddenTabs: newHidden,
    });
  };

  const handleAddTaxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaxName.trim()) return;
    const newRate: TaxRate = {
      id: `tax-${Date.now()}`,
      name: newTaxName.trim(),
      rate: Number(newTaxPercentage) || 0,
      type: newTaxType,
      isDefault: taxRates.length === 0,
    };
    onAddTaxRate(newRate);
    setIsAddTaxModalOpen(false);
    setNewTaxName('');
    setNewTaxPercentage(7.5);
    showNotification(`Added tax rate "${newRate.name}"`);
  };

  const handleAddBankAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankName.trim() || !newAccountNumber.trim()) return;
    const newAccount: BankAccountInfo = {
      id: `bank-${Date.now()}`,
      bankName: newBankName.trim(),
      accountName: newAccountName.trim() || profileDraft.name,
      accountNumber: newAccountNumber.trim(),
      sortCode: newSortCode.trim() || undefined,
      iban: newIban.trim() || undefined,
      swiftBic: newSwiftBic.trim() || undefined,
      paymentInstructions: newPaymentInstructions.trim() || undefined,
      isPrimary: settingsDraft.bankAccounts.length === 0,
    };

    const updated = {
      ...settingsDraft,
      bankAccounts: [...settingsDraft.bankAccounts, newAccount],
    };
    setSettingsDraft(updated);
    onUpdateAppSettings(updated);
    setIsAddBankModalOpen(false);
    setNewBankName('');
    setNewAccountName('');
    setNewAccountNumber('');
    setNewSortCode('');
    setNewIban('');
    setNewSwiftBic('');
    setNewPaymentInstructions('');
    showNotification('Bank account added successfully.');
  };

  const handleDeleteBankAccount = (id: string) => {
    const updated = {
      ...settingsDraft,
      bankAccounts: settingsDraft.bankAccounts.filter(b => b.id !== id),
    };
    setSettingsDraft(updated);
    onUpdateAppSettings(updated);
    showNotification('Bank account removed.');
  };

  const handleSetPrimaryBankAccount = (id: string) => {
    const updated = {
      ...settingsDraft,
      bankAccounts: settingsDraft.bankAccounts.map(b => ({
        ...b,
        isPrimary: b.id === id,
      })),
    };
    setSettingsDraft(updated);
    onUpdateAppSettings(updated);
    showNotification('Primary bank account updated.');
  };

  // Full Backup JSON Export
  const handleDownloadFullBackup = () => {
    const fullBackup = {
      backupVersion: '2.5',
      exportDate: new Date().toISOString(),
      companyProfile: profileDraft,
      appSettings: settingsDraft,
      taxRates,
      invoices,
      clients,
      items,
      payments,
      deliveryNotes,
      creditNotes,
    };

    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `InvoicePro_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Full JSON backup snapshot downloaded!');
  };

  // Full Restore Handler
  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.companyProfile) setProfileDraft(parsed.companyProfile);
        if (parsed.appSettings) setSettingsDraft(parsed.appSettings);
        if (onRestoreFullBackup) {
          onRestoreFullBackup(parsed);
        }
        showNotification('System successfully restored from backup snapshot!');
      } catch (err) {
        alert('Invalid JSON backup file. Please provide a valid InvoicePro backup snapshot.');
      }
    };
    reader.readAsText(file);
  };

  // Bulk CSV Export
  const handleExportCSV = (entity: 'invoices' | 'clients' | 'items' | 'payments' | 'delivery' | 'credit') => {
    let csvContent = '';
    let fileName = '';

    if (entity === 'invoices') {
      csvContent = 'Invoice Number,Client Name,Date,Due Date,Subtotal,Tax,Discount,Total,Status\n' +
        invoices.map(i => `"${i.invoiceNumber}","${i.clientName}","${i.date}","${i.dueDate}",${i.subtotal},${i.taxAmount},${i.discount},${i.total},"${i.status}"`).join('\n');
      fileName = `Invoices_Export_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (entity === 'clients') {
      csvContent = 'Client Name,Contact Person,Email,Phone,Address,Outstanding,Revenue,Status\n' +
        clients.map(c => `"${c.name}","${c.contactPerson}","${c.email}","${c.phone}","${c.address.replace(/\n/g, ' ')}",${c.outstanding},${c.totalRevenue},"${c.status}"`).join('\n');
      fileName = `Clients_Export_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (entity === 'items') {
      csvContent = 'Item Name,SKU,Category,Stock,Unit Price,Tax Rate,Status\n' +
        items.map(it => `"${it.name}","${it.sku}","${it.category}",${it.stock},${it.unitPrice},${it.taxRate},"${it.status}"`).join('\n');
      fileName = `Items_Export_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (entity === 'payments') {
      csvContent = 'Payment #,Invoice #,Client Name,Amount,Date,Method,Reference,Status\n' +
        payments.map(p => `"${p.paymentNumber}","${p.invoiceNumber}","${p.clientName}",${p.amount},"${p.date}","${p.method}","${p.referenceNumber}","${p.status}"`).join('\n');
      fileName = `Payments_Export_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (entity === 'delivery') {
      csvContent = 'Note #,Invoice #,Client Name,Carrier,Tracking #,Dispatch Date,Expected Date,Packages,Status\n' +
        deliveryNotes.map(d => `"${d.noteNumber}","${d.invoiceNumber || ''}","${d.clientName}","${d.carrierName}","${d.trackingNumber}","${d.dispatchDate}","${d.expectedDeliveryDate}",${d.packagesCount},"${d.status}"`).join('\n');
      fileName = `DeliveryNotes_Export_${new Date().toISOString().split('T')[0]}.csv`;
    } else if (entity === 'credit') {
      csvContent = 'Credit Note #,Invoice #,Client Name,Reason,Issue Date,Total,Remaining,Status\n' +
        creditNotes.map(c => `"${c.creditNoteNumber}","${c.originalInvoiceNumber}","${c.clientName}","${c.reason}","${c.issueDate}",${c.totalAmount},${c.remainingCredit},"${c.status}"`).join('\n');
      fileName = `CreditNotes_Export_${new Date().toISOString().split('T')[0]}.csv`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    showNotification(`Exported ${entity} to ${fileName}`);
  };

  // Sample CSV Downloads
  const downloadSampleTemplate = (type: 'clients' | 'items') => {
    let content = '';
    let name = '';
    if (type === 'clients') {
      content = 'name,contactPerson,email,phone,address\nAcme Corp,Sarah Jenkins,billing@acme.com,+1 555 123 4567,"123 Main St, New York"\nGlobex Tech,Michael Chang,m.chang@globex.tech,+1 555 987 6543,"742 Evergreen Terr, Springfield"';
      name = 'sample_clients_template.csv';
    } else {
      content = 'name,sku,category,stock,unitPrice,taxRate\nUltra HD Monitor 27",SKU-MON-27,Hardware,15,450.00,7.5\nErgonomic Keyboard,SKU-KB-01,Accessories,40,89.50,7.5';
      name = 'sample_items_template.csv';
    }
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Bulk Upload Parsers
  const handleClientCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      const parsedClients: Client[] = [];
      // Skip header if contains 'name'
      const startIdx = lines[0].toLowerCase().includes('name') ? 1 : 0;

      for (let i = startIdx; i < lines.length; i++) {
        const parts = lines[i].split(',').map(s => s.trim().replace(/^"|"$/g, ''));
        if (parts[0]) {
          parsedClients.push({
            id: `client-${Date.now()}-${i}`,
            name: parts[0],
            contactPerson: parts[1] || 'Primary Contact',
            email: parts[2] || `${parts[0].toLowerCase().replace(/\s+/g, '')}@example.com`,
            phone: parts[3] || '+1 555 000 0000',
            address: parts[4] || 'Commercial Address',
            outstanding: 0,
            totalRevenue: 0,
            invoiceCount: 0,
            activeProjects: 1,
            status: 'active',
          });
        }
      }

      if (onBulkImportClients && parsedClients.length > 0) {
        onBulkImportClients(parsedClients);
        setBulkUploadLogs(prev => [`[${new Date().toLocaleTimeString()}] Imported ${parsedClients.length} clients successfully.`, ...prev]);
        showNotification(`Imported ${parsedClients.length} clients.`);
      }
    };
    reader.readAsText(file);
  };

  const handleItemCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim().length > 0);
      const parsedItems: InventoryItem[] = [];
      const startIdx = lines[0].toLowerCase().includes('name') ? 1 : 0;

      for (let i = startIdx; i < lines.length; i++) {
        const parts = lines[i].split(',').map(s => s.trim().replace(/^"|"$/g, ''));
        if (parts[0]) {
          const stock = parseInt(parts[3]) || 10;
          parsedItems.push({
            id: `item-${Date.now()}-${i}`,
            name: parts[0],
            sku: parts[1] || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
            category: parts[2] || 'General',
            stock: stock,
            lowStockThreshold: 5,
            unitPrice: parseFloat(parts[4]) || 100,
            taxRate: parseFloat(parts[5]) || 7.5,
            status: stock > 5 ? 'in_stock' : stock > 0 ? 'low' : 'out',
          });
        }
      }

      if (onBulkImportItems && parsedItems.length > 0) {
        onBulkImportItems(parsedItems);
        setBulkUploadLogs(prev => [`[${new Date().toLocaleTimeString()}] Imported ${parsedItems.length} inventory catalog items.`, ...prev]);
        showNotification(`Imported ${parsedItems.length} inventory items.`);
      }
    };
    reader.readAsText(file);
  };

  // Barcode Test Simulation
  const handleSimulateScan = () => {
    const code = simulatedScanCode.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`;
    setLastScannedResult(code);
    if (settingsDraft.barcodeScannerSettings.soundOnScan) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 1200;
        gain.gain.value = 0.15;
        osc.start();
        setTimeout(() => osc.stop(), 120);
      } catch (e) {
        // audio context fallback
      }
    }
    showNotification(`Scanned Code: ${code}`);
  };

  return (
    <div id="settings-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <SettingsIcon className="w-7 h-7 text-indigo-400" />
            System Preferences & Enterprise Settings
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure visual layouts, taxes, multi-language localization, billing document rules, hardware devices, and cloud sync.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccessMessage && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {savedSuccessMessage}
            </div>
          )}
          <button
            id="save-all-settings-btn"
            onClick={handleSaveSettings}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Main Settings Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800">
        {[
          { id: 'home_layout', label: 'Customize Home Screen', icon: Layout },
          { id: 'discount_tax', label: 'Discount & Tax Settings', icon: Percent },
          { id: 'language', label: 'Language & Locale', icon: Globe },
          { id: 'invoice_billing', label: 'Invoice & Billing Setting', icon: FileText },
          { id: 'hardware', label: 'Hardware and Devices', icon: Printer },
          { id: 'data_management', label: 'Data & Online Management', icon: HardDrive },
          { id: 'company_profile', label: 'Company Profile & Currencies', icon: Building },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as MainSettingsSection)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all border-b-2 -mb-px ${
                isActive
                  ? 'border-indigo-500 text-indigo-300 bg-indigo-950/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: CUSTOMIZE HOME SCREEN (Visual layout | show/hide Tabs) */}
      {activeSection === 'home_layout' && (
        <div className="space-y-6">
          {/* Section Description */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Layout className="w-5 h-5 text-indigo-400" />
              Home Screen Customization & Module Visibility
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Control which operational tabs and navigation menus appear in your application sidebar. Hidden tabs can be restored at any time.
            </p>
          </div>

          {/* Show / Hide Navigation Tabs Grid */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Show / Hide Navigation Modules</h3>
                <p className="text-xs text-slate-500">Toggle modules off to simplify your workflow if you don't use them.</p>
              </div>
              <button
                onClick={() => setSettingsDraft({ ...settingsDraft, hiddenTabs: [] })}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Reset All to Visible
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {[
                { tab: 'invoices' as NavigationTab, label: 'Invoices & Billing' },
                { tab: 'estimates' as NavigationTab, label: 'Estimates & Quotes' },
                { tab: 'delivery_notes' as NavigationTab, label: 'Delivery Notes' },
                { tab: 'credit_notes' as NavigationTab, label: 'Credit Notes' },
                { tab: 'payments' as NavigationTab, label: 'Payments' },
                { tab: 'receipts' as NavigationTab, label: 'Receipts' },
                { tab: 'sale_orders' as NavigationTab, label: 'Sale Orders' },
                { tab: 'recurring' as NavigationTab, label: 'Recurring Billing' },
                { tab: 'purchases' as NavigationTab, label: 'Purchases & Returns' },
                { tab: 'purchase_orders' as NavigationTab, label: 'Purchase Orders' },
                { tab: 'batch_tracking' as NavigationTab, label: 'Batch & Serial Tracking' },
                { tab: 'items' as NavigationTab, label: 'Items & Catalog' },
                { tab: 'clients' as NavigationTab, label: 'Client Directory' },
                { tab: 'other_income' as NavigationTab, label: 'Other Income' },
                { tab: 'expenses' as NavigationTab, label: 'Expenses' },
                { tab: 'reports' as NavigationTab, label: 'Financial Reports' },
              ].map(({ tab, label }) => {
                const isHidden = settingsDraft.hiddenTabs.includes(tab);
                return (
                  <div
                    key={tab}
                    onClick={() => handleToggleTabVisibility(tab)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isHidden
                        ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                        : 'bg-slate-950 border-indigo-900/40 hover:border-indigo-500/50'
                    }`}
                  >
                    <span className="text-xs font-medium text-slate-200">{label}</span>
                    <button
                      type="button"
                      className={`p-1 rounded-md transition-colors ${
                        isHidden ? 'text-slate-500 bg-slate-900' : 'text-indigo-400 bg-indigo-950/60'
                      }`}
                    >
                      {isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Visual Layout Preferences & Dashboard Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                Visual Layout Density & Defaults
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                  <div>
                    <span className="text-xs font-medium text-slate-200">Compact Table Density</span>
                    <p className="text-[11px] text-slate-500">Reduces row spacing in all lists to display more data on screen.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsDraft.compactDensity}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, compactDensity: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="text-xs font-medium text-slate-200">Default Landing View</span>
                    <p className="text-[11px] text-slate-500">Screen displayed upon opening the application.</p>
                  </div>
                  <select
                    value={settingsDraft.defaultLandingTab}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, defaultLandingTab: e.target.value as NavigationTab })}
                    className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="dashboard">Executive Dashboard</option>
                    <option value="invoices">Invoices List</option>
                    <option value="create_invoice">Create Invoice</option>
                    <option value="sale_orders">Sale Orders</option>
                    <option value="delivery_notes">Delivery Notes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Dashboard Widgets Toggle */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Layout className="w-4 h-4 text-indigo-400" />
                Dashboard Metric Widgets
              </h3>

              <div className="space-y-2 text-xs">
                {[
                  { key: 'quickStats' as const, label: 'Quick Summary KPI Cards (Revenue, Receivables, Invoices)' },
                  { key: 'revenueChart' as const, label: 'Revenue Growth & Cashflow Interactive Graph' },
                  { key: 'recentActivity' as const, label: 'Recent Audit Trail & Payment Activity Stream' },
                  { key: 'lowStockAlerts' as const, label: 'Low Inventory & Stock Depletion Warnings' },
                  { key: 'upcomingRecurring' as const, label: 'Upcoming Recurring Subscriptions Schedule' },
                  { key: 'cashflowSummary' as const, label: 'Income vs Expense Breakdown Bar' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-950 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsDraft.dashboardWidgets[key]}
                      onChange={(e) => setSettingsDraft({
                        ...settingsDraft,
                        dashboardWidgets: {
                          ...settingsDraft.dashboardWidgets,
                          [key]: e.target.checked,
                        }
                      })}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-300">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DISCOUNT & TAX SETTINGS */}
      {activeSection === 'discount_tax' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Percent className="w-5 h-5 text-indigo-400" />
              Discount & Tax Compliance Rules
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Configure global tax calculation models (Inclusive vs. Exclusive), Withholding Tax (WHT), and discount permissions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Tax Rules */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-200">Tax Calculation Mode & Labels</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Tax Calculation Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSettingsDraft({ ...settingsDraft, taxMode: 'exclusive' })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        settingsDraft.taxMode === 'exclusive'
                          ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="text-xs font-bold">Tax Exclusive</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Tax is added ON TOP of item prices</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSettingsDraft({ ...settingsDraft, taxMode: 'inclusive' })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        settingsDraft.taxMode === 'inclusive'
                          ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="text-xs font-bold">Tax Inclusive</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Prices already include tax component</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Official Tax Display Label</label>
                  <input
                    type="text"
                    value={settingsDraft.taxLabel}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, taxLabel: e.target.value })}
                    placeholder="e.g. VAT, GST, Sales Tax, TIN"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Withholding Tax */}
                <div className="pt-3 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-slate-200">Withholding Tax (WHT) Deductions</span>
                      <p className="text-[11px] text-slate-500">Allow client remittance withholding on settlement.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsDraft.enableWithholdingTax}
                      onChange={(e) => setSettingsDraft({ ...settingsDraft, enableWithholdingTax: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>

                  {settingsDraft.enableWithholdingTax && (
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Default WHT Rate (%)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={settingsDraft.withholdingTaxRate}
                        onChange={(e) => setSettingsDraft({ ...settingsDraft, withholdingTaxRate: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Discount Rules */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-200">Discount Governance & Safeguards</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                  <div>
                    <span className="text-xs font-medium text-slate-200">Enable Line-Item Level Discounts</span>
                    <p className="text-[11px] text-slate-500">Allow assigning discounts per individual product row.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsDraft.enableItemDiscounts}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, enableItemDiscounts: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-800/80">
                  <div>
                    <span className="text-xs font-medium text-slate-200">Enable Invoice-Level Global Discounts</span>
                    <p className="text-[11px] text-slate-500">Allow discount deduction on entire invoice subtotal.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsDraft.enableInvoiceDiscounts}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, enableInvoiceDiscounts: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Maximum Allowed Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settingsDraft.maxDiscountPercent}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, maxDiscountPercent: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Prevents staff from creating excessive unapproved discounts.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tax Rates Management */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Active Tax Rates & Brackets</h3>
                <p className="text-xs text-slate-500">Configure regional and product specific tax rates.</p>
              </div>
              <button
                onClick={() => setIsAddTaxModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Tax Rate
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {taxRates.map((t) => (
                <div key={t.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-200">{t.name} ({t.rate}%)</div>
                    <div className="text-[11px] text-slate-500">{t.type}</div>
                    {t.isDefault && (
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {!t.isDefault && (
                      <button
                        onClick={() => onSetDefaultTaxRate(t.id)}
                        className="text-[10px] text-indigo-400 hover:underline px-1 py-0.5"
                      >
                        Make Default
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteTaxRate(t.id)}
                      className="p-1 hover:bg-rose-500/20 text-rose-400 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LANGUAGE & LOCALIZATION */}
      {activeSection === 'language' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-400" />
              Language & Regional Localization
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select UI display language, date formats, number grouping conventions, and Right-to-Left (RTL) script support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Language Selection */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-200">User Interface Language</h3>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { code: 'en', name: 'English (US & Global)', native: 'English' },
                  { code: 'fr', name: 'French', native: 'Français' },
                  { code: 'es', name: 'Spanish', native: 'Español' },
                  { code: 'de', name: 'German', native: 'Deutsch' },
                  { code: 'pt', name: 'Portuguese', native: 'Português' },
                  { code: 'ar', name: 'Arabic (العربية)', native: 'العربية' },
                  { code: 'zh', name: 'Chinese (Simplified)', native: '简体中文' },
                  { code: 'yo', name: 'Yoruba', native: 'Èdè Yorùbá' },
                  { code: 'ha', name: 'Hausa', native: 'Harshen Hausa' },
                  { code: 'ig', name: 'Igbo', native: 'Asụsụ Igbo' },
                ].map(({ code, name, native }) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setSettingsDraft({ 
                      ...settingsDraft, 
                      language: code as any,
                      rtlEnabled: code === 'ar'
                    })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      settingsDraft.language === code
                        ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-semibold">{native}</div>
                    <div className="text-[10px] text-slate-500">{name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Formatting conventions */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-200">Date & Numerical Formatting</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Date Display Format</label>
                  <select
                    value={settingsDraft.dateFormat}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, dateFormat: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="YYYY-MM-DD">YYYY-MM-DD (2026-02-22) — ISO Standard</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (22/02/2026) — UK / International</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (02/22/2026) — US Standard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Number Separator Style</label>
                  <select
                    value={settingsDraft.numberFormat}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, numberFormat: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="standard">1,234,567.89 (Comma grouping, period decimal)</option>
                    <option value="european">1.234.567,89 (Period grouping, comma decimal)</option>
                    <option value="indian">12,34,567.89 (Lakh / Crore grouping)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-xs font-medium text-slate-200">Right-to-Left (RTL) Layout</span>
                    <p className="text-[11px] text-slate-500">Mirrors user interface for Arabic / Hebrew scripts.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsDraft.rtlEnabled}
                    onChange={(e) => setSettingsDraft({ ...settingsDraft, rtlEnabled: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INVOICE & BILLING SETTING */}
      {activeSection === 'invoice_billing' && (
        <div className="space-y-6">
          {/* Sub Navigation Bar for Billing Settings */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
            {[
              { id: 'doc_prefs', label: 'Document Preferences', icon: Sliders },
              { id: 'templates', label: 'Template Settings', icon: Palette },
              { id: 'header_footer', label: 'Header & Footer', icon: FileText },
              { id: 'bank_settings', label: 'Bank Settings', icon: Landmark },
              { id: 'terms_conditions', label: 'Terms & Conditions', icon: FileSignature },
              { id: 'manage_fields', label: 'Manage Fields', icon: CheckSquare },
            ].map((sub) => {
              const Icon = sub.icon;
              const isSubActive = invoiceBillingSub === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setInvoiceBillingSub(sub.id as InvoiceBillingSubSection)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isSubActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {sub.label}
                </button>
              );
            })}
          </div>

          {/* 4.1 Document Preferences */}
          {invoiceBillingSub === 'doc_prefs' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-5">
              <h3 className="text-base font-semibold text-slate-100">Document Numbering & Due Dates</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Invoice Prefix</label>
                  <input
                    type="text"
                    value={settingsDraft.documentPreferences.invoicePrefix}
                    onChange={(e) => setSettingsDraft({
                      ...settingsDraft,
                      documentPreferences: { ...settingsDraft.documentPreferences, invoicePrefix: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Estimate Prefix</label>
                  <input
                    type="text"
                    value={settingsDraft.documentPreferences.estimatePrefix}
                    onChange={(e) => setSettingsDraft({
                      ...settingsDraft,
                      documentPreferences: { ...settingsDraft.documentPreferences, estimatePrefix: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Delivery Note Prefix</label>
                  <input
                    type="text"
                    value={settingsDraft.documentPreferences.deliveryNotePrefix}
                    onChange={(e) => setSettingsDraft({
                      ...settingsDraft,
                      documentPreferences: { ...settingsDraft.documentPreferences, deliveryNotePrefix: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Credit Note Prefix</label>
                  <input
                    type="text"
                    value={settingsDraft.documentPreferences.creditNotePrefix}
                    onChange={(e) => setSettingsDraft({
                      ...settingsDraft,
                      documentPreferences: { ...settingsDraft.documentPreferences, creditNotePrefix: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Default Due Interval (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={settingsDraft.documentPreferences.defaultDueDays}
                    onChange={(e) => setSettingsDraft({
                      ...settingsDraft,
                      documentPreferences: { ...settingsDraft.documentPreferences, defaultDueDays: parseInt(e.target.value) || 14 }
                    })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Grand Total Rounding</label>
                  <select
                    value={settingsDraft.documentPreferences.roundTotalMethod}
                    onChange={(e) => setSettingsDraft({
                      ...settingsDraft,
                      documentPreferences: { ...settingsDraft.documentPreferences, roundTotalMethod: e.target.value as any }
                    })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="none">Exact Decimals (No rounding)</option>
                    <option value="nearest_whole">Round to Nearest Whole Unit</option>
                    <option value="round_up">Always Round Up (Ceil)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 4.2 Template Settings */}
          {invoiceBillingSub === 'templates' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
              <h3 className="text-base font-semibold text-slate-100">Visual Template Styling & Accents</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {[
                  { id: 'classic', label: 'Classic Corporate', desc: 'Standard formal layout with crisp dark headers' },
                  { id: 'modern', label: 'Modern Indigo', desc: 'Sleek rounded cards with vibrant badges' },
                  { id: 'minimalist', label: 'Clean Minimalist', desc: 'High-contrast typography and subtle borders' },
                  { id: 'executive', label: 'Executive Slate', desc: 'Dense boardroom styling with financial summary boxes' },
                  { id: 'thermal_pos', label: 'Thermal POS Receipt', desc: 'Compact 80mm roll receipt slip format' },
                ].map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => {
                      setSettingsDraft({
                        ...settingsDraft,
                        templateSettings: { ...settingsDraft.templateSettings, templateStyle: tpl.id as any }
                      });
                      setProfileDraft({ ...profileDraft, templateId: tpl.id as any });
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      settingsDraft.templateSettings.templateStyle === tpl.id
                        ? 'bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/20'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-200">{tpl.label}</div>
                    <div className="text-[11px] text-slate-500 mt-1">{tpl.desc}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Primary Brand Accent Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settingsDraft.templateSettings.primaryAccentColor}
                      onChange={(e) => setSettingsDraft({
                        ...settingsDraft,
                        templateSettings: { ...settingsDraft.templateSettings, primaryAccentColor: e.target.value }
                      })}
                      className="w-10 h-10 rounded-lg bg-transparent border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settingsDraft.templateSettings.primaryAccentColor}
                      onChange={(e) => setSettingsDraft({
                        ...settingsDraft,
                        templateSettings: { ...settingsDraft.templateSettings, primaryAccentColor: e.target.value }
                      })}
                      className="w-32 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200"
                    />
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <span className="font-medium text-slate-300 block mb-1">Visual Embellishments</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsDraft.templateSettings.showWatermark}
                      onChange={(e) => setSettingsDraft({
                        ...settingsDraft,
                        templateSettings: { ...settingsDraft.templateSettings, showWatermark: e.target.checked }
                      })}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-300">Show PAID / DRAFT status background watermark</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsDraft.templateSettings.showStamp}
                      onChange={(e) => setSettingsDraft({
                        ...settingsDraft,
                        templateSettings: { ...settingsDraft.templateSettings, showStamp: e.target.checked }
                      })}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-slate-300">Show Official Company Seal Stamp on footer</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 4.3 Invoice Header & Footer */}
          {invoiceBillingSub === 'header_footer' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="text-base font-semibold text-slate-100">Document Headers, Footers & Disclaimers</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Main Document Title</label>
                  <input
                    type="text"
                    value={settingsDraft.invoiceHeaderFooter.invoiceTitle}
                    onChange={(e) => setSettingsDraft({
                      ...settingsDraft,
                      invoiceHeaderFooter: { ...settingsDraft.invoiceHeaderFooter, invoiceTitle: e.target.value }
                    })}
                    placeholder="e.g. TAX INVOICE, COMMERCIAL INVOICE"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Header Subtitle</label>
                  <input
                    type="text"
                    value={settingsDraft.invoiceHeaderFooter.headerSubtitle}
                    onChange={(e) => setSettingsDraft({
                      ...settingsDraft,
                      invoiceHeaderFooter: { ...settingsDraft.invoiceHeaderFooter, headerSubtitle: e.target.value }
                    })}
                    placeholder="Original for Recipient / Customer Copy"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Footer Legal Disclaimer</label>
                  <textarea
                    rows={2}
                    value={settingsDraft.invoiceHeaderFooter.footerDisclaimer}
                    onChange={(e) => setSettingsDraft({
                      ...settingsDraft,
                      invoiceHeaderFooter: { ...settingsDraft.invoiceHeaderFooter, footerDisclaimer: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Electronic Billing Declaration</label>
                  <input
                    type="text"
                    value={settingsDraft.invoiceHeaderFooter.footerDeclaration}
                    onChange={(e) => setSettingsDraft({
                      ...settingsDraft,
                      invoiceHeaderFooter: { ...settingsDraft.invoiceHeaderFooter, footerDeclaration: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="md:col-span-2 flex items-center justify-between py-2 border-t border-slate-800">
                  <div>
                    <span className="text-xs font-medium text-slate-200">Include QR Code Verification Stamp</span>
                    <p className="text-[11px] text-slate-500">Renders digital tamper-evident verification code on printed receipts.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settingsDraft.invoiceHeaderFooter.showQrCodeVerification}
                    onChange={(e) => setSettingsDraft({
                      ...settingsDraft,
                      invoiceHeaderFooter: { ...settingsDraft.invoiceHeaderFooter, showQrCodeVerification: e.target.checked }
                    })}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4.4 Bank Settings */}
          {invoiceBillingSub === 'bank_settings' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-100">Corporate Bank & Settlement Accounts</h3>
                  <p className="text-xs text-slate-500">Manage multiple bank accounts and designate primary accounts for invoice remittance.</p>
                </div>
                <button
                  onClick={() => setIsAddBankModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Bank Account
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {settingsDraft.bankAccounts.map((bank) => (
                  <div key={bank.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 relative">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-bold text-slate-200">{bank.bankName}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">Acc: {bank.accountNumber}</div>
                        <div className="text-xs text-slate-500">Name: {bank.accountName}</div>
                      </div>
                      {bank.isPrimary ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Primary Account
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetPrimaryBankAccount(bank.id)}
                          className="text-[11px] text-indigo-400 hover:underline"
                        >
                          Set as Primary
                        </button>
                      )}
                    </div>

                    {(bank.iban || bank.swiftBic) && (
                      <div className="text-[11px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-800/60">
                        {bank.iban && <div>IBAN: {bank.iban}</div>}
                        {bank.swiftBic && <div>SWIFT/BIC: {bank.swiftBic}</div>}
                      </div>
                    )}

                    {bank.paymentInstructions && (
                      <div className="text-[11px] text-indigo-300/80 bg-indigo-950/30 p-2 rounded-lg">
                        <strong>Narration Instruction:</strong> {bank.paymentInstructions}
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleDeleteBankAccount(bank.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete Bank Account"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4.5 Terms & Conditions */}
          {invoiceBillingSub === 'terms_conditions' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-5">
              <h3 className="text-base font-semibold text-slate-100">Standard Commercial Terms & Policies</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Standard Payment Terms & Due Dates</label>
                  <textarea
                    rows={3}
                    value={settingsDraft.termsAndConditions.defaultTerms}
                    onChange={(e) => setSettingsDraft({
                      ...settingsDraft,
                      termsAndConditions: { ...settingsDraft.termsAndConditions, defaultTerms: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Return, Refund & Damaged Goods Policy</label>
                  <textarea
                    rows={2}
                    value={settingsDraft.termsAndConditions.returnPolicy}
                    onChange={(e) => setSettingsDraft({
                      ...settingsDraft,
                      termsAndConditions: { ...settingsDraft.termsAndConditions, returnPolicy: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Warranty & Defect Support Notice</label>
                  <textarea
                    rows={2}
                    value={settingsDraft.termsAndConditions.warrantyNotice}
                    onChange={(e) => setSettingsDraft({
                      ...settingsDraft,
                      termsAndConditions: { ...settingsDraft.termsAndConditions, warrantyNotice: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4.6 Manage Fields */}
          {invoiceBillingSub === 'manage_fields' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-5">
              <h3 className="text-base font-semibold text-slate-100">Item Line Columns & Custom Data Fields</h3>
              <p className="text-xs text-slate-500">Toggle which columns are visible in invoice item tables and add custom header metadata.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { key: 'showSku' as const, label: 'SKU / Barcode Column' },
                  { key: 'showUnit' as const, label: 'Unit of Measure (UOM) Column' },
                  { key: 'showDiscount' as const, label: 'Line Discount (%) Column' },
                  { key: 'showTaxRate' as const, label: 'Line Tax Rate (%) Column' },
                  { key: 'showHsnSac' as const, label: 'HSN / SAC Tax Code Column' },
                  { key: 'showBatchNumber' as const, label: 'Batch / Lot # Column' },
                  { key: 'showItemImage' as const, label: 'Product Photo Thumbnail Column' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsDraft.manageFields[key]}
                      onChange={(e) => setSettingsDraft({
                        ...settingsDraft,
                        manageFields: { ...settingsDraft.manageFields, [key]: e.target.checked }
                      })}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-medium text-slate-200">{label}</span>
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Custom Header Field 1 Label</label>
                  <input
                    type="text"
                    value={settingsDraft.manageFields.customField1Label}
                    onChange={(e) => setSettingsDraft({
                      ...settingsDraft,
                      manageFields: { ...settingsDraft.manageFields, customField1Label: e.target.value }
                    })}
                    placeholder="e.g. PO Reference, Project Code"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Custom Header Field 2 Label</label>
                  <input
                    type="text"
                    value={settingsDraft.manageFields.customField2Label}
                    onChange={(e) => setSettingsDraft({
                      ...settingsDraft,
                      manageFields: { ...settingsDraft.manageFields, customField2Label: e.target.value }
                    })}
                    placeholder="e.g. Sales Rep, Delivery Terms"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: HARDWARE AND DEVICES */}
      {activeSection === 'hardware' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
            <button
              onClick={() => setHardwareSub('printer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                hardwareSub === 'printer' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Printer className="w-3.5 h-3.5" /> Printer Settings
            </button>
            <button
              onClick={() => setHardwareSub('scanner')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                hardwareSub === 'scanner' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Scan className="w-3.5 h-3.5" /> Barcode & QR Code Scanner
            </button>
          </div>

          {/* 5.1 Printer Settings */}
          {hardwareSub === 'printer' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-5">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-400" />
                Printer Setup & Page Media Configuration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Paper / Roll Format</label>
                  <select
                    value={settingsDraft.printerSettings.paperSize}
                    onChange={(e) => setSettingsDraft({
                      ...settingsDraft,
                      printerSettings: { ...settingsDraft.printerSettings, paperSize: e.target.value as any }
                    })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="A4">A4 (210 x 297 mm) — Standard Office Paper</option>
                    <option value="Letter">US Letter (8.5 x 11 in)</option>
                    <option value="A5">A5 (148 x 210 mm) — Half Sheet</option>
                    <option value="Thermal 80mm">Thermal POS Roll (80mm / 3 inch)</option>
                    <option value="Thermal 58mm">Thermal POS Roll (58mm / 2 inch)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Print Margin Mode</label>
                  <select
                    value={settingsDraft.printerSettings.printMargins}
                    onChange={(e) => setSettingsDraft({
                      ...settingsDraft,
                      printerSettings: { ...settingsDraft.printerSettings, printMargins: e.target.value as any }
                    })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="normal">Normal (12mm Margins)</option>
                    <option value="narrow">Narrow (5mm Margins)</option>
                    <option value="borderless">Borderless Full-Bleed</option>
                  </select>
                </div>

                <div className="md:col-span-2 space-y-3 pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-slate-200">Auto-Print Slip on Invoice/Receipt Save</span>
                      <p className="text-[11px] text-slate-500">Automatically launches system print dialog immediately upon finalizing a transaction.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsDraft.printerSettings.autoPrintOnSave}
                      onChange={(e) => setSettingsDraft({
                        ...settingsDraft,
                        printerSettings: { ...settingsDraft.printerSettings, autoPrintOnSave: e.target.checked }
                      })}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-slate-200">Silent Direct POS Printing (Kiosk Mode)</span>
                      <p className="text-[11px] text-slate-500">Bypasses browser confirmation if connected to a supported POS receipt driver.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsDraft.printerSettings.silentPrinting}
                      onChange={(e) => setSettingsDraft({
                        ...settingsDraft,
                        printerSettings: { ...settingsDraft.printerSettings, silentPrinting: e.target.checked }
                      })}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 pt-3 flex justify-end">
                  <button
                    onClick={() => {
                      window.print();
                      showNotification('Sent test print command to printer!');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Printer className="w-4 h-4" /> Send Test Print Page
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5.2 Barcode & QR Code Scanner */}
          {hardwareSub === 'scanner' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Scan className="w-5 h-5 text-indigo-400" />
                Barcode / QR Code Scanner Hardware Integration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-slate-800">
                    <div>
                      <span className="text-xs font-medium text-slate-200">USB / Bluetooth HID Keyboard Wedge Scanner</span>
                      <p className="text-[11px] text-slate-500">Auto-detects high-speed barcode reader input followed by Enter key.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsDraft.barcodeScannerSettings.enableUsbWedge}
                      onChange={(e) => setSettingsDraft({
                        ...settingsDraft,
                        barcodeScannerSettings: { ...settingsDraft.barcodeScannerSettings, enableUsbWedge: e.target.checked }
                      })}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-slate-800">
                    <div>
                      <span className="text-xs font-medium text-slate-200">Camera-Based Optical Scanner</span>
                      <p className="text-[11px] text-slate-500">Use built-in device camera for real-time video feed barcode reading.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsDraft.barcodeScannerSettings.enableCameraScanner}
                      onChange={(e) => setSettingsDraft({
                        ...settingsDraft,
                        barcodeScannerSettings: { ...settingsDraft.barcodeScannerSettings, enableCameraScanner: e.target.checked }
                      })}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <span className="text-xs font-medium text-slate-200">Audio Chime on Successful Scan</span>
                      <p className="text-[11px] text-slate-500">Plays high-pitched beep tone confirmation upon barcode decode.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsDraft.barcodeScannerSettings.soundOnScan}
                      onChange={(e) => setSettingsDraft({
                        ...settingsDraft,
                        barcodeScannerSettings: { ...settingsDraft.barcodeScannerSettings, soundOnScan: e.target.checked }
                      })}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Interactive Scanner Test Bench */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-indigo-400" /> Scanner Live Test Simulator
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCameraScannerActive(!isCameraScannerActive)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                        isCameraScannerActive ? 'bg-rose-500/20 text-rose-300' : 'bg-indigo-600 text-white'
                      }`}
                    >
                      {isCameraScannerActive ? 'Stop Camera' : 'Start Camera Test'}
                    </button>
                  </div>

                  {isCameraScannerActive && (
                    <div className="h-36 bg-slate-900 rounded-lg flex flex-col items-center justify-center border border-dashed border-indigo-500/40 relative overflow-hidden">
                      <div className="w-3/4 h-1 bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse" />
                      <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
                        <Scan className="w-3.5 h-3.5 text-indigo-400" /> Align Barcode or QR Code within viewfinder
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter SKU or scan barcode..."
                      value={simulatedScanCode}
                      onChange={(e) => setSimulatedScanCode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSimulateScan();
                      }}
                      className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleSimulateScan}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
                    >
                      Simulate Scan
                    </button>
                  </div>

                  {lastScannedResult && (
                    <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-center justify-between">
                      <span>Decoded: <strong>{lastScannedResult}</strong></span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: DATA & ONLINE MANAGEMENT */}
      {activeSection === 'data_management' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
            {[
              { id: 'backup_restore', label: 'Backup and Restore', icon: Database },
              { id: 'bulk_upload', label: 'Bulk Upload (CSV)', icon: UploadCloud },
              { id: 'manage_images', label: 'Manage Images & Assets', icon: ImageIcon },
              { id: 'export_data', label: 'Export Data', icon: Download },
              { id: 'cloud_storage', label: 'Connect to Dropbox / Google Drive', icon: FolderSync },
            ].map((sub) => {
              const Icon = sub.icon;
              const isSubActive = dataSub === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setDataSub(sub.id as DataSubSection)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    isSubActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {sub.label}
                </button>
              );
            })}
          </div>

          {/* 6.1 Backup and Restore */}
          {dataSub === 'backup_restore' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-400" />
                Application Database Backup & Disaster Recovery
              </h3>
              <p className="text-xs text-slate-400">
                Safely preserve all your invoices, client accounts, items catalog, payments, and system preferences in a standard JSON format.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Download Backup */}
                <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <Download className="w-4 h-4 text-indigo-400" />
                      Create Full System Backup
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Generates a downloadable snapshot containing all records across all modules.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadFullBackup}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
                  >
                    <Download className="w-4 h-4" /> Download JSON Backup File
                  </button>
                </div>

                {/* Restore Backup */}
                <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-emerald-400" />
                      Restore From JSON Snapshot
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Upload a previously exported backup file to restore complete financial state.
                    </p>
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={backupRestoreInputRef}
                      accept=".json"
                      onChange={handleRestoreFile}
                      className="hidden"
                    />
                    <button
                      onClick={() => backupRestoreInputRef.current?.click()}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-700"
                    >
                      <Database className="w-4 h-4" /> Select Backup JSON File to Restore
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6.2 Bulk Upload (CSV) */}
          {dataSub === 'bulk_upload' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-indigo-400" />
                Batch CSV Data Importers
              </h3>
              <p className="text-xs text-slate-400">
                Quickly import hundreds of clients and item catalog entries directly using CSV spreadsheet files.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Importer */}
                <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-200">Import Client Directory</h4>
                    <button
                      type="button"
                      onClick={() => downloadSampleTemplate('clients')}
                      className="text-[11px] text-indigo-400 hover:underline"
                    >
                      Download CSV Template
                    </button>
                  </div>
                  <input
                    type="file"
                    ref={clientFileInputRef}
                    accept=".csv"
                    onChange={handleClientCSVUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => clientFileInputRef.current?.click()}
                    className="w-full py-2.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <UploadCloud className="w-4 h-4" /> Upload Clients CSV File
                  </button>
                </div>

                {/* Items Importer */}
                <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-200">Import Inventory Items</h4>
                    <button
                      type="button"
                      onClick={() => downloadSampleTemplate('items')}
                      className="text-[11px] text-indigo-400 hover:underline"
                    >
                      Download CSV Template
                    </button>
                  </div>
                  <input
                    type="file"
                    ref={itemFileInputRef}
                    accept=".csv"
                    onChange={handleItemCSVUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => itemFileInputRef.current?.click()}
                    className="w-full py-2.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <UploadCloud className="w-4 h-4" /> Upload Items & Catalog CSV File
                  </button>
                </div>
              </div>

              {/* Import Activity Log */}
              {bulkUploadLogs.length > 0 && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <h5 className="text-xs font-semibold text-slate-300">Import Activity Logs</h5>
                  <div className="space-y-1 font-mono text-[11px] text-slate-400 max-h-32 overflow-y-auto">
                    {bulkUploadLogs.map((log, idx) => (
                      <div key={idx}>{log}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 6.3 Manage Images & Assets */}
          {dataSub === 'manage_images' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-400" />
                Brand Media Assets & Signatures
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* Logo */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <span className="text-xs font-semibold text-slate-300">Company Logo</span>
                  <div className="h-28 bg-slate-900 rounded-lg flex items-center justify-center border border-dashed border-slate-800 overflow-hidden">
                    {profileDraft.logoUrl ? (
                      <img src={profileDraft.logoUrl} alt="Logo" className="max-h-24 max-w-full object-contain" />
                    ) : (
                      <span className="text-xs text-slate-500">No logo uploaded</span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Enter Image URL (e.g. https://...)"
                    value={profileDraft.logoUrl || ''}
                    onChange={(e) => setProfileDraft({ ...profileDraft, logoUrl: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Digital Signature */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <span className="text-xs font-semibold text-slate-300">Official Signatory Signature</span>
                  <div className="h-28 bg-slate-900 rounded-lg flex items-center justify-center border border-dashed border-slate-800 overflow-hidden">
                    {settingsDraft.imageAssets.signatureUrl ? (
                      <img src={settingsDraft.imageAssets.signatureUrl} alt="Signature" className="max-h-24 max-w-full object-contain" />
                    ) : (
                      <span className="text-xs font-serif italic text-slate-500">Authorized Signature</span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Signature Image URL"
                    value={settingsDraft.imageAssets.signatureUrl || ''}
                    onChange={(e) => setSettingsDraft({
                      ...settingsDraft,
                      imageAssets: { ...settingsDraft.imageAssets, signatureUrl: e.target.value }
                    })}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Official Seal / Stamp */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <span className="text-xs font-semibold text-slate-300">Corporate Seal Stamp</span>
                  <div className="h-28 bg-slate-900 rounded-lg flex items-center justify-center border border-dashed border-slate-800 overflow-hidden">
                    {settingsDraft.imageAssets.stampUrl ? (
                      <img src={settingsDraft.imageAssets.stampUrl} alt="Stamp" className="max-h-24 max-w-full object-contain" />
                    ) : (
                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center text-[10px] text-slate-600 font-bold">
                        SEAL
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Stamp Image URL"
                    value={settingsDraft.imageAssets.stampUrl || ''}
                    onChange={(e) => setSettingsDraft({
                      ...settingsDraft,
                      imageAssets: { ...settingsDraft.imageAssets, stampUrl: e.target.value }
                    })}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 6.4 Export Data */}
          {dataSub === 'export_data' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Download className="w-5 h-5 text-indigo-400" />
                Export Modular Data to CSV Spreadsheets
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { id: 'invoices' as const, label: 'Export Invoices & Billing', count: invoices.length },
                  { id: 'clients' as const, label: 'Export Clients & Accounts', count: clients.length },
                  { id: 'items' as const, label: 'Export Items Catalog', count: items.length },
                  { id: 'payments' as const, label: 'Export Payment Ledger', count: payments.length },
                  { id: 'delivery' as const, label: 'Export Delivery Notes', count: deliveryNotes.length },
                  { id: 'credit' as const, label: 'Export Credit Notes', count: creditNotes.length },
                ].map(({ id, label, count }) => (
                  <div key={id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-200">{label}</div>
                      <div className="text-[11px] text-slate-500">{count} record(s) available</div>
                    </div>
                    <button
                      onClick={() => handleExportCSV(id)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                    >
                      Export CSV
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6.5 Connect to Dropbox / Google Drive */}
          {dataSub === 'cloud_storage' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <FolderSync className="w-5 h-5 text-indigo-400" />
                Cloud Backup Synchronization
              </h3>
              <p className="text-xs text-slate-400">
                Connect your Google Drive or Dropbox account to enable automated continuous cloud backups of your invoice database.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Google Drive Card */}
                <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center font-bold text-amber-400">
                        GD
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-200">Google Drive</h4>
                        <span className="text-xs text-slate-500">
                          {settingsDraft.cloudStorage.googleDriveConnected ? 'Connected & Active' : 'Not Connected'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const isConn = !settingsDraft.cloudStorage.googleDriveConnected;
                        setSettingsDraft({
                          ...settingsDraft,
                          cloudStorage: {
                            ...settingsDraft.cloudStorage,
                            googleDriveConnected: isConn,
                            googleDriveEmail: isConn ? 'billing-backup@company.com' : undefined,
                            lastSyncTimestamp: isConn ? new Date().toISOString() : undefined,
                          }
                        });
                        showNotification(isConn ? 'Connected to Google Drive!' : 'Disconnected Google Drive.');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        settingsDraft.cloudStorage.googleDriveConnected
                          ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                          : 'bg-indigo-600 text-white hover:bg-indigo-500'
                      }`}
                    >
                      {settingsDraft.cloudStorage.googleDriveConnected ? 'Disconnect' : 'Connect Google Drive'}
                    </button>
                  </div>
                  {settingsDraft.cloudStorage.googleDriveConnected && (
                    <div className="p-3 bg-slate-900 rounded-lg text-xs text-slate-400 space-y-1">
                      <p>Backup Folder: <strong className="text-slate-200">/Google Drive/InvoicePro_Backups/</strong></p>
                      <p>Linked Account: <span className="text-indigo-400 font-mono">{settingsDraft.cloudStorage.googleDriveEmail}</span></p>
                    </div>
                  )}
                </div>

                {/* Dropbox Card */}
                <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center font-bold text-blue-400">
                        DB
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-200">Dropbox</h4>
                        <span className="text-xs text-slate-500">
                          {settingsDraft.cloudStorage.dropboxConnected ? 'Connected & Active' : 'Not Connected'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const isConn = !settingsDraft.cloudStorage.dropboxConnected;
                        setSettingsDraft({
                          ...settingsDraft,
                          cloudStorage: {
                            ...settingsDraft.cloudStorage,
                            dropboxConnected: isConn,
                            dropboxEmail: isConn ? 'dropbox-finance@company.com' : undefined,
                            lastSyncTimestamp: isConn ? new Date().toISOString() : undefined,
                          }
                        });
                        showNotification(isConn ? 'Connected to Dropbox!' : 'Disconnected Dropbox.');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        settingsDraft.cloudStorage.dropboxConnected
                          ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                          : 'bg-indigo-600 text-white hover:bg-indigo-500'
                      }`}
                    >
                      {settingsDraft.cloudStorage.dropboxConnected ? 'Disconnect' : 'Connect Dropbox'}
                    </button>
                  </div>
                  {settingsDraft.cloudStorage.dropboxConnected && (
                    <div className="p-3 bg-slate-900 rounded-lg text-xs text-slate-400 space-y-1">
                      <p>Backup Folder: <strong className="text-slate-200">/Dropbox/Apps/InvoicePro_Backups/</strong></p>
                      <p>Linked Account: <span className="text-blue-400 font-mono">{settingsDraft.cloudStorage.dropboxEmail}</span></p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 7: COMPANY PROFILE & CURRENCIES */}
      {activeSection === 'company_profile' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-5">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-400" />
              Company Legal Entity & Default Currency
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Company Registered Name</label>
                <input
                  type="text"
                  value={profileDraft.name}
                  onChange={(e) => setProfileDraft({ ...profileDraft, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Tax ID / TIN / RC Number</label>
                <input
                  type="text"
                  value={profileDraft.taxId}
                  onChange={(e) => setProfileDraft({ ...profileDraft, taxId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Corporate Phone</label>
                <input
                  type="text"
                  value={profileDraft.phone}
                  onChange={(e) => setProfileDraft({ ...profileDraft, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Active Currency ({profileDraft.currency})</label>
                <input
                  type="text"
                  placeholder="Filter currencies..."
                  value={currencySearch}
                  onChange={(e) => setCurrencySearch(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500 mb-2"
                />
                <select
                  value={profileDraft.currency}
                  onChange={(e) => {
                    const found = getCurrencyByCode(e.target.value);
                    setProfileDraft({
                      ...profileDraft,
                      currency: found.code,
                      currencySymbol: found.symbol,
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {filteredCurrencies.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol}) — {c.name} ({c.country})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1">Registered HQ Address</label>
                <textarea
                  rows={3}
                  value={profileDraft.address}
                  onChange={(e) => setProfileDraft({ ...profileDraft, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Tax Rate Modal */}
      {isAddTaxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-slate-100">Add New Tax Rate Bracket</h4>
              <button onClick={() => setIsAddTaxModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTaxSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Tax Bracket Name</label>
                <input
                  type="text"
                  placeholder="e.g. Standard VAT, Reduced Rate"
                  value={newTaxName}
                  onChange={(e) => setNewTaxName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Tax Percentage (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newTaxPercentage}
                  onChange={(e) => setNewTaxPercentage(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Tax Category</label>
                <select
                  value={newTaxType}
                  onChange={(e) => setNewTaxType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="Value Added Tax">Value Added Tax (VAT)</option>
                  <option value="Goods & Services">Goods & Services (GST)</option>
                  <option value="Sales Tax">Sales Tax</option>
                  <option value="Exempt">Exempt / Zero Rated</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddTaxModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium"
                >
                  Add Tax Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Bank Account Modal */}
      {isAddBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-slate-100">Add Company Bank Account</h4>
              <button onClick={() => setIsAddBankModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBankAccount} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Bank Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Zenith Bank PLC"
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Account Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Tech Ltd"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Account Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 1012345678"
                    value={newAccountNumber}
                    onChange={(e) => setNewAccountNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Routing / Sort Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 057150013"
                    value={newSortCode}
                    onChange={(e) => setNewSortCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">IBAN (International)</label>
                  <input
                    type="text"
                    placeholder="Optional IBAN"
                    value={newIban}
                    onChange={(e) => setNewIban(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">SWIFT / BIC Code</label>
                  <input
                    type="text"
                    placeholder="Optional SWIFT"
                    value={newSwiftBic}
                    onChange={(e) => setNewSwiftBic(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Payment Transfer Narration Instructions</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please put Invoice # in payment narration..."
                  value={newPaymentInstructions}
                  onChange={(e) => setNewPaymentInstructions(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddBankModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium"
                >
                  Save Bank Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
