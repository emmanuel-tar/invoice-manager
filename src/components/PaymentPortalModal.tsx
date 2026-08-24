import React, { useState } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  Building, 
  Sparkles,
  Smartphone
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Invoice, CompanyProfile } from '../types';

interface PaymentPortalModalProps {
  invoice: Invoice | null;
  companyProfile: CompanyProfile;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (invoiceId: string, paidAmount: number) => void;
}

export const PaymentPortalModal: React.FC<PaymentPortalModalProps> = ({
  invoice,
  companyProfile,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  if (!isOpen || !invoice) return null;

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple' | 'ach'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState(invoice.clientName || 'Sarah Jenkins');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('888');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#10b981', '#00236f', '#14b8a6', '#f59e0b'],
        });
      } catch (err) {}

      setTimeout(() => {
        onPaymentSuccess(invoice.id, invoice.total);
        onClose();
        setIsSuccess(false);
      }, 1800);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-xl border border-slate-200/80 overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-200 rounded-lg transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Payment Successful!
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Receipt #REC-{Math.floor(100000 + Math.random() * 900000)} • ₦{invoice.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} NGN
            </p>
            <div className="p-3.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800 font-medium">
              Payment settled for <span className="font-bold">{invoice.invoiceNumber}</span>. A confirmation email and receipt has been dispatched to {invoice.clientEmail}.
            </div>
          </div>
        ) : (
          <div>
            {/* Header Portal Info */}
            <div className="bg-slate-900 text-white p-6">
              <div className="flex items-center justify-between text-xs text-blue-400 mb-2">
                <span className="font-mono font-semibold">SECURE CHECKOUT</span>
                <span className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                  <Lock className="w-3 h-3 text-blue-400" /> 256-BIT ENCRYPTION
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <h3 className="text-lg font-bold tracking-tight">{companyProfile.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">Invoice {invoice.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-mono uppercase">Amount to Pay</div>
                  <div className="text-2xl font-black font-mono-data text-white">
                    ${invoice.total.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Form Body */}
            <form onSubmit={handleProcessPayment} className="p-6 space-y-4">
              {/* Payment Methods tabs */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-lg border text-center text-xs font-semibold transition-all flex flex-col items-center gap-1 ${
                    paymentMethod === 'card'
                      ? 'border-blue-600 bg-blue-50/50 text-blue-700 ring-1 ring-blue-600'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('apple')}
                  className={`p-2.5 rounded-lg border text-center text-xs font-semibold transition-all flex flex-col items-center gap-1 ${
                    paymentMethod === 'apple'
                      ? 'border-blue-600 bg-blue-50/50 text-blue-700 ring-1 ring-blue-600'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-slate-800" />
                  <span>Apple Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('ach')}
                  className={`p-2.5 rounded-lg border text-center text-xs font-semibold transition-all flex flex-col items-center gap-1 ${
                    paymentMethod === 'ach'
                      ? 'border-blue-600 bg-blue-50/50 text-blue-700 ring-1 ring-blue-600'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building className="w-4 h-4 text-slate-700" />
                  <span>ACH Bank</span>
                </button>
              </div>

              {/* Card Form */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    required
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Card Number</label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Expiration Date</label>
                    <input
                      type="text"
                      required
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      placeholder="MM/YY"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-center text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">CVC / Security Code</label>
                    <input
                      type="text"
                      required
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      placeholder="CVC"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-center text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Payment */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>Processing Authorization...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-blue-200" />
                      <span>Pay ₦{invoice.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} NGN</span>
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 mt-2 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>PCI-DSS Level 1 Certified Gateway</span>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
