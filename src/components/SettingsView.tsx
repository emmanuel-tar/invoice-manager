import React, { useState, useMemo } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { CompanyProfile, TaxRate } from '../types';
import { WORLD_CURRENCIES, getCurrencyByCode, formatCurrencyAmount } from '../data/currencies';

interface SettingsViewProps {
  companyProfile: CompanyProfile;
  taxRates: TaxRate[];
  onUpdateCompanyProfile: (profile: CompanyProfile) => void;
  onAddTaxRate: (rate: TaxRate) => void;
  onDeleteTaxRate: (rateId: string) => void;
  onSetDefaultTaxRate: (rateId: string) => void;
  onLaunchOnboarding: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  companyProfile,
  taxRates,
  onUpdateCompanyProfile,
  onAddTaxRate,
  onDeleteTaxRate,
  onSetDefaultTaxRate,
  onLaunchOnboarding,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'taxes' | 'currencies' | 'templates'>('profile');

  // Company Profile form
  const [name, setName] = useState(companyProfile.name);
  const [taxId, setTaxId] = useState(companyProfile.taxId);
  const [address, setAddress] = useState(companyProfile.address);
  const [phone, setPhone] = useState(companyProfile.phone);
  const [bankName, setBankName] = useState(companyProfile.bankName);
  const [accountNumber, setAccountNumber] = useState(companyProfile.accountNumber);
  const [currency, setCurrency] = useState(companyProfile.currency || 'NGN');
  const [currencySymbol, setCurrencySymbol] = useState(companyProfile.currencySymbol || '₦');
  const [templateId, setTemplateId] = useState(companyProfile.templateId);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Currency Search & Filter
  const [currencySearch, setCurrencySearch] = useState('');
  const [currencyRegion, setCurrencyRegion] = useState<string>('all');

  // New tax rate modal
  const [isAddTaxModalOpen, setIsAddTaxModalOpen] = useState(false);
  const [taxName, setTaxName] = useState('');
  const [taxPercentage, setTaxPercentage] = useState<number>(7.5);
  const [taxType, setTaxType] = useState('Value Added Tax');

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

  const handleSelectCurrency = (curCode: string) => {
    const cur = getCurrencyByCode(curCode);
    setCurrency(cur.code);
    setCurrencySymbol(cur.symbol);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCompanyProfile({
      ...companyProfile,
      name,
      taxId,
      address,
      phone,
      bankName,
      accountNumber,
      currency,
      currencySymbol,
      templateId,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCreateTaxRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taxName.trim()) return;
    const newTax: TaxRate = {
      id: `tax-${Date.now()}`,
      name: taxName,
      rate: taxPercentage,
      type: taxType,
      isDefault: false,
    };
    onAddTaxRate(newTax);
    setTaxName('');
    setTaxPercentage(10);
    setIsAddTaxModalOpen(false);
  };

  return (
    <div id="settings-view-container" className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">System Settings</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure legal tax registrations, billing templates, and company profiles.
          </p>
        </div>

        <button
          onClick={onLaunchOnboarding}
          className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <Sparkles className="w-4 h-4 text-blue-200" />
          <span>Launch Setup Wizard</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'profile', label: 'Company Profile', icon: Building },
          { id: 'taxes', label: 'Taxes & Levies', icon: Percent },
          { id: 'currencies', label: 'Currencies & Banking', icon: Coins },
          { id: 'templates', label: 'Invoice Templates', icon: FileText },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Company Profile Form */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Legal Business Profile</h3>
              <p className="text-xs text-slate-500">Information displayed on top of your invoices and estimates</p>
            </div>
            {savedSuccess && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full animate-in fade-in">
                <Check className="w-3.5 h-3.5" /> Saved Successfully!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Company Registered Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tax ID / VAT Registration #</label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Business Contact Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Primary Base Currency</label>
              <select
                value={currency}
                onChange={(e) => handleSelectCurrency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {WORLD_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} - {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Official Business Address</label>
              <textarea
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Taxes Manager */}
      {activeTab === 'taxes' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Tax Rates & Jurisdictions</h3>
              <p className="text-xs text-slate-500">Configure applicable sales taxes, VAT, and exempt brackets</p>
            </div>
            <button
              onClick={() => setIsAddTaxModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Tax Rate</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-mono uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 font-bold">Tax Name</th>
                  <th className="py-3 px-4 font-bold">Type</th>
                  <th className="py-3 px-4 font-bold text-center">Rate (%)</th>
                  <th className="py-3 px-4 font-bold text-center">Default Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {taxRates.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{t.name}</td>
                    <td className="py-3 px-4 text-slate-600">{t.type}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-blue-600">
                      {t.rate.toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-center">
                      {t.isDefault ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Default
                        </span>
                      ) : (
                        <button
                          onClick={() => onSetDefaultTaxRate(t.id)}
                          className="text-[11px] text-slate-400 hover:text-blue-600 hover:underline"
                        >
                          Set Default
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onDeleteTaxRate(t.id)}
                        disabled={taxRates.length <= 1}
                        className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Currencies & Banking */}
      {activeTab === 'currencies' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Currency & Settlement Settings</h3>
              <p className="text-xs text-slate-500">Configure your system currency (Nigerian Naira ₦ default) and wire remittance details.</p>
            </div>
            {savedSuccess && (
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full animate-in fade-in">
                <Check className="w-3.5 h-3.5" /> Saved!
              </span>
            )}
          </div>

          {/* Active Currency Summary Card */}
          <div className="p-4 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 rounded-xl border border-blue-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white border border-blue-200 flex items-center justify-center text-2xl shadow-xs">
                {getCurrencyByCode(currency).flag}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900">
                    {getCurrencyByCode(currency).name}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-mono text-[11px] font-bold">
                    {currency}
                  </span>
                  {currency === 'NGN' && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                      Default Currency
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-600 mt-0.5">
                  Country: <span className="font-semibold text-slate-800">{getCurrencyByCode(currency).country}</span> • Region: <span className="font-semibold text-slate-800">{getCurrencyByCode(currency).region}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-lg border border-blue-100 shadow-xs">
              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Display Preview</div>
                <div className="text-base font-black text-blue-700 font-mono">
                  {formatCurrencyAmount(1250000, currencySymbol)}
                </div>
              </div>
            </div>
          </div>

          {/* Currency Browser & Search */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-xs font-bold text-slate-900 block">Select from 50+ Global Currencies</label>
                <p className="text-[11px] text-slate-500">Pick any country currency to apply across all invoices, estimates, and customer portals.</p>
              </div>

              {/* Currency Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search currency, country, or code..."
                  value={currencySearch}
                  onChange={(e) => setCurrencySearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                {currencySearch && (
                  <button
                    type="button"
                    onClick={() => setCurrencySearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Region Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['all', 'Africa', 'Americas', 'Europe', 'Asia', 'Middle East', 'Oceania'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setCurrencyRegion(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    currencyRegion === r
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r === 'all' ? 'All Regions' : r}
                </button>
              ))}
            </div>

            {/* Currencies Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50/50">
              {filteredCurrencies.length === 0 ? (
                <div className="col-span-full py-8 text-center text-xs text-slate-400">
                  No currencies found matching "{currencySearch}".
                </div>
              ) : (
                filteredCurrencies.map((c) => {
                  const isSelected = currency === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleSelectCurrency(c.code)}
                      className={`p-2.5 rounded-lg border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 text-blue-900 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="text-lg shrink-0">{c.flag}</span>
                        <div className="truncate">
                          <div className="font-bold text-xs flex items-center gap-1.5 truncate">
                            <span className="font-mono">{c.code}</span>
                            <span className="text-slate-400 font-normal">({c.symbol})</span>
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">{c.name} • {c.country}</div>
                        </div>
                      </div>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 ml-1" />
                      ) : (
                        <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">{c.symbol}</span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Symbol Override Option */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Active Currency Code</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                placeholder="e.g. NGN, USD, EUR"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Currency Symbol Prefix</label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                placeholder="e.g. ₦, $, €, £"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Remittance Banking Information */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="font-bold text-slate-900 text-xs mb-3">Wire Transfer & Banking Remittance</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Financial Institution / Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. Zenith Bank PLC / Chase Bank NA"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Account Number / IBAN / Swift</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. •••• •••• 6789 / 0123456789"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Currency & Banking Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 4: Invoice Templates */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base">Invoice Layout Template</h3>
            <p className="text-xs text-slate-500">Select the visual branding style for PDF renders and print outputs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                id: 'classic' as const,
                title: 'Classic Corporate',
                desc: 'Deep blue headers with structured grid lines and prominent totals block.',
                badge: 'Recommended',
              },
              {
                id: 'modern' as const,
                title: 'Modern Minimal',
                desc: 'Generous whitespace with blue accent highlights and refined typography.',
                badge: 'Clean',
              },
              {
                id: 'minimalist' as const,
                title: 'Monochrome Slate',
                desc: 'High contrast black and slate for formal corporate and legal accounts.',
                badge: 'Formal',
              },
            ].map((tmpl) => {
              const isSelected = templateId === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => {
                    setTemplateId(tmpl.id);
                    onUpdateCompanyProfile({ ...companyProfile, templateId: tmpl.id });
                  }}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-slate-900">{tmpl.title}</span>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">
                      {tmpl.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{tmpl.desc}</p>
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                    <CheckCircle2 className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-300'}`} />
                    <span>{isSelected ? 'Active Template' : 'Select Template'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Tax Modal */}
      {isAddTaxModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-slate-200/80">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Add New Tax Bracket</h3>
              <button onClick={() => setIsAddTaxModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTaxRate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tax Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. County Surcharge"
                  value={taxName}
                  onChange={(e) => setTaxName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Rate (%) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  required
                  value={taxPercentage}
                  onChange={(e) => setTaxPercentage(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tax Category</label>
                <input
                  type="text"
                  value={taxType}
                  onChange={(e) => setTaxType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddTaxModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg shadow-sm"
                >
                  Add Tax Rate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
