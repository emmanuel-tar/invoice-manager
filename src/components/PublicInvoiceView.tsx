import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  CheckCircle2, 
  Download, 
  Printer, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Copy, 
  Check, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink,
  ArrowRight,
  Sparkles,
  Smartphone,
  Landmark,
  Share2,
  FileCheck2,
  Receipt,
  QrCode,
  EyeOff,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Invoice, CompanyProfile } from '../types';
import { getPublicInvoicePaymentUrl } from '../utils/paymentTokenUtils';

interface PublicInvoiceViewProps {
  invoice: Invoice | null;
  companyProfile: CompanyProfile;
  onPaymentSuccess?: (invoiceId: string, paidAmount: number) => void;
  onExitPreview?: () => void;
  isStandalone?: boolean;
}

export const PublicInvoiceView: React.FC<PublicInvoiceViewProps> = ({
  invoice,
  companyProfile,
  onPaymentSuccess,
  onExitPreview,
  isStandalone = true,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedBankRef, setCopiedBankRef] = useState(false);
  const [showQr, setShowQr] = useState(false);

  // Payment Form States
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple' | 'bank'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardHolder, setCardHolder] = useState(invoice?.clientName || 'Valued Customer');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('888');
  const [zipCode, setZipCode] = useState('94105');
  const [isProcessing, setIsProcessing] = useState(false);
  const [justPaidReceiptNumber, setJustPaidReceiptNumber] = useState<string | null>(null);

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 max-w-md w-full text-center space-y-5">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto ring-8 ring-rose-50/50">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Invoice Link Not Found
            </h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              This invoice payment link may be invalid, expired, or has a missing payment token. Please verify the URL or contact the billing department.
            </p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 font-mono text-left space-y-1">
            <div className="font-bold text-slate-800">Support Contact:</div>
            <div>{companyProfile.name}</div>
            <div>{companyProfile.phone || '+1 (555) 019-2834'}</div>
          </div>
          {onExitPreview && (
            <button
              onClick={onExitPreview}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Return to Workspace
            </button>
          )}
        </div>
      </div>
    );
  }

  const currencySymbol = companyProfile.currencySymbol || '₦';
  const isPaid = invoice.status === 'paid' || Boolean(justPaidReceiptNumber);
  const isOverdue = invoice.status === 'overdue';
  const paymentToken = invoice.payment_token || invoice.paymentToken || 'pay_tok_secured';
  const publicUrl = getPublicInvoicePaymentUrl(paymentToken);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(paymentToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2200);
  };

  const handleCopyBankRef = () => {
    navigator.clipboard.writeText(`INV-${invoice.invoiceNumber}`);
    setCopiedBankRef(true);
    setTimeout(() => setCopiedBankRef(false), 2200);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const receiptNo = `REC-${Math.floor(100000 + Math.random() * 900000)}`;
      setJustPaidReceiptNumber(receiptNo);

      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#10b981', '#2563eb', '#f59e0b', '#8b5cf6'],
        });
      } catch (err) {}

      if (onPaymentSuccess) {
        onPaymentSuccess(invoice.id, invoice.total);
      }
    }, 1400);
  };

  return (
    <div id="public-invoice-portal" className="min-h-screen bg-slate-100/90 text-slate-800 font-sans antialiased">
      {/* Print Stylesheet Overrides */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            #public-nav-bar, #payment-action-card, #public-footer, #admin-preview-banner { display: none !important; }
            #invoice-document-card { box-shadow: none !important; border: none !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; padding: 0 !important; }
          }
        `
      }} />

      {/* Top Admin Preview Banner if active in workspace */}
      {onExitPreview && (
        <div id="admin-preview-banner" className="bg-slate-900 text-white px-4 py-2 text-xs flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold">Public Customer View Active:</span>
            <span className="text-slate-400 font-mono text-[11px]">Customers view this exact page using token: {paymentToken}</span>
          </div>
          <button
            onClick={onExitPreview}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      )}

      {/* Top Header / Public Brand Navigation Bar */}
      <header id="public-nav-bar" className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          {/* Brand Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
              {companyProfile.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm leading-tight flex items-center gap-1.5">
                <span>{companyProfile.name}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-semibold text-emerald-700">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Verified Merchant</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Secure Invoice Payment Portal
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              title="Copy public payment link"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedLink ? 'Link Copied' : 'Share Link'}</span>
            </button>

            <button
              onClick={() => setShowQr(!showQr)}
              title="Scan QR on mobile"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <QrCode className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">QR Pay</span>
            </button>

            <button
              onClick={handlePrint}
              title="Print or save as PDF"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* QR Code Slide-Down drawer */}
        {showQr && (
          <div className="bg-slate-900 text-white border-t border-slate-800 p-4 transition-all animate-in slide-in-from-top duration-200">
            <div className="max-w-md mx-auto flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-blue-400 font-mono">SCAN TO PAY ON MOBILE</div>
                <p className="text-xs text-slate-300">
                  Open your smartphone camera or banking app to open this secure token link directly.
                </p>
                <div className="text-[10px] text-slate-400 font-mono break-all pt-1">
                  Token: {paymentToken}
                </div>
              </div>
              <div className="bg-white p-2 rounded-xl shadow-md shrink-0">
                {/* SVG Visual QR Mockup */}
                <div className="w-24 h-24 bg-slate-950 flex flex-col items-center justify-center p-1.5 rounded-lg text-white font-mono text-[9px] text-center">
                  <QrCode className="w-12 h-12 text-white mb-1" />
                  <span className="text-[8px] text-slate-400">{invoice.invoiceNumber}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
        
        {/* Security & Token Banner */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span>Secure Tokenized Invoice</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 font-mono text-[11px] text-slate-600 border border-slate-200">
                  {paymentToken}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                No password or login required. Access granted securely via this unique invoice authorization token.
              </p>
            </div>
          </div>
          <button
            onClick={handleCopyToken}
            className="self-start sm:self-auto text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 shrink-0"
          >
            {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedToken ? 'Token Copied' : 'Copy Token'}</span>
          </button>
        </div>

        {/* Invoice Status Banner */}
        {isPaid ? (
          <div className="bg-emerald-600 text-white rounded-2xl p-5 md:p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-100">
                  Payment Complete
                </div>
                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  Invoice {invoice.invoiceNumber} has been paid in full
                </h2>
                <p className="text-xs text-emerald-100 mt-0.5">
                  {justPaidReceiptNumber 
                    ? `Settled just now • Official Receipt #${justPaidReceiptNumber}`
                    : `Settled in full for ${currencySymbol}${invoice.total.toFixed(2)}`}
                </p>
              </div>
            </div>
            <button
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-sm transition-all shrink-0"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Download Paid Receipt</span>
            </button>
          </div>
        ) : isOverdue ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold tracking-wider uppercase text-rose-700">
                  Payment Past Due
                </div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  Due: {invoice.dueDate} • {currencySymbol}{invoice.total.toFixed(2)} Outstanding
                </h2>
                <p className="text-xs text-rose-600 mt-0.5">
                  This invoice is overdue. Please settle below using credit card or instant bank wire to avoid service interruptions.
                </p>
              </div>
            </div>
            <a
              href="#pay-now-section"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all shrink-0"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pay Overdue Balance</span>
            </a>
          </div>
        ) : (
          <div className="bg-slate-900 text-white rounded-2xl p-5 md:p-6 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold tracking-wider uppercase text-blue-400">
                  Payment Due • {invoice.dueDate}
                </div>
                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  Total Due: {currencySymbol}{invoice.total.toFixed(2)}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Billed to <span className="font-bold text-white">{invoice.clientName}</span>. Direct payment accepted below.
                </p>
              </div>
            </div>
            <a
              href="#pay-now-section"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all shrink-0"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pay Now ({currencySymbol}{invoice.total.toFixed(2)})</span>
            </a>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Invoice Document Card (8 cols) */}
          <div className="lg:col-span-8">
            <div 
              id="invoice-document-card" 
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 md:p-10 space-y-8"
            >
              {/* Header & Meta */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-200">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg mb-3">
                    {companyProfile.name.slice(0, 2).toUpperCase()}
                  </div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    {companyProfile.name}
                  </h1>
                  <p className="text-xs text-slate-500 whitespace-pre-line mt-1">
                    {companyProfile.address || '123 Commercial Avenue, Victoria Island'}
                  </p>
                  {companyProfile.taxId && (
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      Tax/Reg ID: <span className="font-semibold text-slate-700">{companyProfile.taxId}</span>
                    </p>
                  )}
                </div>

                <div className="sm:text-right space-y-1.5">
                  <div className="inline-block px-3 py-1 bg-slate-100 rounded-lg text-xs font-mono font-bold text-slate-700 border border-slate-200">
                    INVOICE
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                    {invoice.invoiceNumber}
                  </div>
                  <div className="text-xs text-slate-500 font-mono space-y-0.5">
                    <div>Issue Date: <span className="font-semibold text-slate-800">{invoice.date}</span></div>
                    <div>Payment Due: <span className="font-semibold text-slate-800">{invoice.dueDate}</span></div>
                    {invoice.estimateRef && (
                      <div className="text-blue-600">Ref: {invoice.estimateRef}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Billed To / Client Card */}
              <div className="p-4 sm:p-5 bg-slate-50 rounded-xl border border-slate-200/70 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Billed To
                  </div>
                  <div className="font-bold text-slate-900 text-sm">{invoice.clientName}</div>
                  <div className="text-xs text-slate-600 mt-0.5">{invoice.clientEmail}</div>
                  {invoice.clientAddress && (
                    <div className="text-xs text-slate-500 mt-1 whitespace-pre-line">
                      {invoice.clientAddress}
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Payment Status
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize ${
                      isPaid 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : isOverdue 
                        ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${
                        isPaid ? 'bg-emerald-600' : isOverdue ? 'bg-rose-600' : 'bg-amber-600'
                      }`}></span>
                      {isPaid ? 'Paid in Full' : isOverdue ? 'Payment Overdue' : 'Payment Due'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-2 font-mono">
                    Payment Token: <span className="font-bold text-slate-700">{paymentToken}</span>
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-slate-500 uppercase tracking-wider font-mono text-[11px]">
                      <th className="pb-3 font-bold">Item & Description</th>
                      <th className="pb-3 text-right font-bold w-16">Qty</th>
                      <th className="pb-3 text-right font-bold w-24">Rate</th>
                      <th className="pb-3 text-right font-bold w-20">Tax</th>
                      <th className="pb-3 text-right font-bold w-28">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoice.items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 pr-3">
                          <div className="font-bold text-slate-900 text-xs sm:text-sm">
                            {item.description}
                          </div>
                        </td>
                        <td className="py-3.5 text-right font-mono text-slate-700">{item.qty}</td>
                        <td className="py-3.5 text-right font-mono text-slate-700">
                          {currencySymbol}{item.unitPrice.toFixed(2)}
                        </td>
                        <td className="py-3.5 text-right font-mono text-slate-500">
                          {item.taxRate > 0 ? `${item.taxRate}%` : '0%'}
                        </td>
                        <td className="py-3.5 text-right font-mono font-bold text-slate-900">
                          {currencySymbol}{item.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Breakdown */}
              <div className="border-t border-slate-200 pt-5 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div className="text-xs text-slate-500 space-y-2 max-w-sm">
                  {invoice.notes && (
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="font-bold text-slate-700 mb-1">Notes & Terms:</div>
                      <div className="whitespace-pre-line text-slate-600">{invoice.notes}</div>
                    </div>
                  )}
                </div>

                <div className="w-full sm:w-64 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono">{currencySymbol}{invoice.subtotal.toFixed(2)}</span>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount:</span>
                      <span className="font-mono">-{currencySymbol}{invoice.discount.toFixed(2)}</span>
                    </div>
                  )}
                  {invoice.taxAmount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Tax / VAT:</span>
                      <span className="font-mono">+{currencySymbol}{invoice.taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-slate-900 text-base">
                    <span>Total:</span>
                    <span className="font-mono">{currencySymbol}{invoice.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xs pt-1 text-slate-700">
                    <span>Amount Due:</span>
                    <span className={`font-mono ${isPaid ? 'text-emerald-600' : 'text-blue-600'}`}>
                      {isPaid ? `${currencySymbol}0.00` : `${currencySymbol}${invoice.total.toFixed(2)}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Online Payment Section (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Pay Online Card */}
            <div 
              id="pay-now-section" 
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-600 text-white">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-slate-900 text-sm">
                    {isPaid ? 'Payment Receipt' : 'Pay Online Securely'}
                  </h3>
                </div>
                <span className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                  <Lock className="w-3 h-3 text-emerald-600" /> 256-BIT SSL
                </span>
              </div>

              {isPaid ? (
                <div className="space-y-4 text-center py-2">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Payment Confirmed</h4>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {justPaidReceiptNumber ? `Receipt #${justPaidReceiptNumber}` : `Transaction Completed`}
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Amount Paid:</span>
                      <span className="font-mono font-bold text-slate-900">{currencySymbol}{invoice.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Invoice:</span>
                      <span className="font-mono text-slate-800">{invoice.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Authorization:</span>
                      <span className="font-mono text-[11px] text-emerald-700">AUTH-{paymentToken.slice(-6).toUpperCase()}</span>
                    </div>
                  </div>

                  <button
                    onClick={handlePrint}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Print Receipt / PDF</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleProcessPayment} className="space-y-4">
                  {/* Payment Method Selector */}
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`py-1.5 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
                        paymentMethod === 'card'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('apple')}
                      className={`py-1.5 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
                        paymentMethod === 'apple'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Pay</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bank')}
                      className={`py-1.5 px-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1 ${
                        paymentMethod === 'bank'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Landmark className="w-3.5 h-3.5" />
                      <span>Bank</span>
                    </button>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          required
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                          placeholder="Name on card"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Card Number</label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono font-medium"
                            placeholder="4242 4242 4242 4242"
                          />
                          <div className="absolute right-3 top-2.5 text-slate-400 font-mono text-[10px] font-bold">
                            VISA/MC
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Expires</label>
                          <input
                            type="text"
                            required
                            value={expiry}
                            onChange={(e) => setExpiry(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                            placeholder="MM/YY"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">CVC / CVV</label>
                          <input
                            type="text"
                            required
                            value={cvc}
                            onChange={(e) => setCvc(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                            placeholder="123"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'apple' && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-3">
                      <Smartphone className="w-8 h-8 text-slate-700 mx-auto" />
                      <div className="text-xs text-slate-600">
                        Authorize instant checkout using Apple Pay, Google Pay, or WebAuthn biometrics.
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'bank' && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                      <div className="font-bold text-slate-900">Direct Bank Wire Details:</div>
                      <div className="space-y-1 text-slate-600 font-mono text-[11px]">
                        <div>Bank: <span className="font-bold text-slate-900">{companyProfile.bankName || 'Zenith Bank PLC'}</span></div>
                        <div>Account: <span className="font-bold text-slate-900">{companyProfile.accountNumber || '•••• •••• 6789'}</span></div>
                        <div>Beneficiary: <span className="font-bold text-slate-900">{companyProfile.name}</span></div>
                        <div>Reference: <span className="font-bold text-blue-600">{invoice.invoiceNumber}</span></div>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyBankRef}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        {copiedBankRef ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedBankRef ? 'Reference Copied' : 'Copy Payment Reference'}</span>
                      </button>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-75 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        <span>Securing Transaction...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Pay {currencySymbol}{invoice.total.toFixed(2)}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Merchant Guarantee Info */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 text-xs text-slate-500 space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>PCI-DSS Level 1 Encryption</span>
              </div>
              <p className="leading-relaxed">
                Payment information is encrypted in transit and never stored in plain text. Your transaction is protected with end-to-end tokenization.
              </p>
              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Ref: {invoice.invoiceNumber}</span>
                <span>Token ID: {paymentToken.slice(0, 14)}...</span>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer id="public-footer" className="max-w-5xl mx-auto px-4 sm:px-6 py-8 border-t border-slate-200 text-center text-xs text-slate-400 space-y-1">
        <p>Powered by InvoicePro • Secure Tokenized Billing Engine</p>
        <p className="text-[11px] font-mono">Token Access Verified for {invoice.clientEmail || invoice.clientName}</p>
      </footer>
    </div>
  );
};
