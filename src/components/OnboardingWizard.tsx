import React, { useState } from 'react';
import { 
  Sparkles, 
  Building, 
  Layers, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Check, 
  FileText,
  ShieldCheck
} from 'lucide-react';
import { CompanyProfile } from '../types';
import { WORLD_CURRENCIES, getCurrencyByCode } from '../data/currencies';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  companyProfile: CompanyProfile;
  onComplete: (profile: CompanyProfile) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onClose,
  companyProfile,
  onComplete,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState(companyProfile.name);
  const [taxId, setTaxId] = useState(companyProfile.taxId);
  const [address, setAddress] = useState(companyProfile.address);
  const [phone, setPhone] = useState(companyProfile.phone);
  const [currency, setCurrency] = useState(companyProfile.currency || 'NGN');
  const [templateId, setTemplateId] = useState(companyProfile.templateId);

  const handleFinish = () => {
    const curInfo = getCurrencyByCode(currency);
    onComplete({
      ...companyProfile,
      name,
      taxId,
      address,
      phone,
      currency,
      currencySymbol: curInfo.symbol,
      templateId,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full p-8 shadow-2xl border border-slate-200/80 relative overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Stepper Header */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all ${
                  step === s
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : step > s
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
            ))}
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">
            Step {step} of 4
          </span>
        </div>

        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-600/20">
              <Sparkles className="w-8 h-8 text-blue-200" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Welcome to InvoicePro
              </h3>
              <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
                The Precision Ledger financial suite. In 60 seconds, configure your business details, default tax rules, and invoice styling.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-left pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <ShieldCheck className="w-4 h-4 text-blue-600 mb-1.5" />
                <div className="font-bold text-slate-900">Compliant Tax</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Automated calculations</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <FileText className="w-4 h-4 text-emerald-600 mb-1.5" />
                <div className="font-bold text-slate-900">1-Click Convert</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Quotes to Invoices</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <Layers className="w-4 h-4 text-indigo-600 mb-1.5" />
                <div className="font-bold text-slate-900">Online Pay</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Instant checkout link</div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Company Info */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <div>
              <h3 className="text-lg font-black text-slate-900">Company Legal Details</h3>
              <p className="text-xs text-slate-500">Provide your registered business name and tax registration number.</p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company Registered Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tax ID / VAT #</label>
                  <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Business Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Address</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Template Style */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            <div>
              <h3 className="text-lg font-black text-slate-900">Choose Invoice Layout</h3>
              <p className="text-xs text-slate-500">Pick the visual design for exported PDF invoices and quotes.</p>
            </div>

            <div className="space-y-3">
              {[
                { id: 'classic' as const, title: 'Classic Corporate', desc: 'Deep blue headers with precision grid borders.' },
                { id: 'modern' as const, title: 'Modern Minimalist', desc: 'Airy layout with subtle blue accents and modern typography.' },
                { id: 'minimalist' as const, title: 'Monochrome Slate', desc: 'High contrast black and white formal styling.' },
              ].map((t) => {
                const isSelected = templateId === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setTemplateId(t.id)}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/40'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{t.title}</div>
                      <div className="text-[11px] text-slate-500">{t.desc}</div>
                    </div>
                    <CheckCircle2 className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-slate-200'}`} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Finished */}
        {step === 4 && (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                You're All Set!
              </h3>
              <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
                Your company profile and invoice template have been saved. You're ready to create, dispatch, and track payments.
              </p>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <span>Launch Applet</span>
              <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
