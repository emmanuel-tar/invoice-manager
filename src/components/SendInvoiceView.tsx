import React, { useState } from 'react';
import { 
  Send, 
  ArrowLeft, 
  Paperclip, 
  FileText, 
  CreditCard, 
  Check, 
  Copy, 
  Sparkles, 
  Eye, 
  Mail, 
  ExternalLink,
  ShieldCheck,
  Building,
  DollarSign,
  Lock
} from 'lucide-react';
import { Invoice, CompanyProfile } from '../types';
import { getPublicInvoicePaymentUrl } from '../utils/paymentTokenUtils';

interface SendInvoiceViewProps {
  invoice: Invoice;
  companyProfile: CompanyProfile;
  onBack: () => void;
  onSendSuccess: (invoiceId: string, emailDetails: { to: string; subject: string }) => void;
  onOpenPaymentPortal: (invoice: Invoice) => void;
  onOpenPublicInvoice?: (invoice: Invoice) => void;
}

export const SendInvoiceView: React.FC<SendInvoiceViewProps> = ({
  invoice,
  companyProfile,
  onBack,
  onSendSuccess,
  onOpenPaymentPortal,
  onOpenPublicInvoice,
}) => {
  const [recipient, setRecipient] = useState<string>(invoice.clientEmail || 'billing@acmecorp.com');
  const [cc, setCc] = useState<string>('');
  const [showCc, setShowCc] = useState<boolean>(false);
  const [subject, setSubject] = useState<string>(
    `Invoice ${invoice.invoiceNumber} from ${companyProfile.name} - ₦${invoice.total.toFixed(2)}`
  );
  const [message, setMessage] = useState<string>(
    `Dear ${invoice.clientName},\n\n` +
    `Thank you for your partnership. Please find attached invoice ${invoice.invoiceNumber} for the total amount of ₦${invoice.total.toFixed(2)}, due on ${invoice.dueDate}.\n\n` +
    `You can review the invoice details or pay securely online using the link below.\n\n` +
    `Best regards,\n${companyProfile.name}\n${companyProfile.phone}`
  );
  const [attachPdf, setAttachPdf] = useState<boolean>(true);
  const [includePayLink, setIncludePayLink] = useState<boolean>(true);
  const [emailTemplate, setEmailTemplate] = useState<'standard' | 'reminder' | 'overdue'>('standard');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const handleTemplateChange = (tmpl: 'standard' | 'reminder' | 'overdue') => {
    setEmailTemplate(tmpl);
    if (tmpl === 'standard') {
      setSubject(`Invoice ${invoice.invoiceNumber} from ${companyProfile.name} - ₦${invoice.total.toFixed(2)}`);
      setMessage(
        `Dear ${invoice.clientName},\n\nPlease find attached invoice ${invoice.invoiceNumber} for the amount of ₦${invoice.total.toFixed(2)}, due on ${invoice.dueDate}.\n\nBest regards,\n${companyProfile.name}`
      );
    } else if (tmpl === 'reminder') {
      setSubject(`Friendly Reminder: Invoice ${invoice.invoiceNumber} is due on ${invoice.dueDate}`);
      setMessage(
        `Hi ${invoice.clientName},\n\nThis is a friendly reminder that invoice ${invoice.invoiceNumber} (₦${invoice.total.toFixed(2)}) is due for payment on ${invoice.dueDate}.\n\nPlease let us know if you have any questions.\n\nBest,\n${companyProfile.name}`
      );
    } else if (tmpl === 'overdue') {
      setSubject(`URGENT: Overdue Payment Notice - Invoice ${invoice.invoiceNumber}`);
      setMessage(
        `Dear ${invoice.clientName},\n\nOur records indicate that invoice ${invoice.invoiceNumber} (₦${invoice.total.toFixed(2)}) was due on ${invoice.dueDate} and remains unpaid.\n\nPlease remit payment immediately via the secure link below to avoid service interruption.\n\nSincerely,\n${companyProfile.name}`
      );
    }
  };

  const handleDispatch = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      onSendSuccess(invoice.id, { to: recipient, subject });
    }, 600);
  };

  const copyPaymentLink = () => {
    const paymentUrl = getPublicInvoicePaymentUrl(invoice.payment_token || invoice.paymentToken || '');
    navigator.clipboard.writeText(paymentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div id="send-invoice-container" className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Send Invoice via Email
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Invoice <span className="font-bold text-blue-900">{invoice.invoiceNumber}</span> • Recipient: {invoice.clientName}
              <span className="ml-2 px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded text-[10px] font-mono">
                Token: {(invoice.payment_token || invoice.paymentToken || '').slice(0, 16)}...
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenPublicInvoice && (
            <button
              onClick={() => onOpenPublicInvoice(invoice)}
              className="flex items-center gap-1.5 px-3 py-2 border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold transition-colors"
            >
              <Eye className="w-4 h-4 text-blue-600" />
              <span>Preview Public View</span>
            </button>
          )}

          <button
            onClick={copyPaymentLink}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copiedLink ? 'Link Copied!' : 'Copy Payment Link'}</span>
          </button>

          <button
            id="btn-dispatch-invoice"
            onClick={handleDispatch}
            disabled={isSending}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSending ? 'Sending Dispatch...' : 'Send Invoice Email'}</span>
          </button>
        </div>
      </div>

      {/* Split Screen Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Email Composer (6 cols) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Template Selector Bar */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700">Email Template:</span>
            <div className="flex items-center gap-1">
              {(['standard', 'reminder', 'overdue'] as const).map((tmpl) => (
                <button
                  key={tmpl}
                  onClick={() => handleTemplateChange(tmpl)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                    emailTemplate === tmpl
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {tmpl}
                </button>
              ))}
            </div>
          </div>

          {/* Form Composer Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            {/* Recipient */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">To (Recipient Email) *</label>
                {!showCc && (
                  <button
                    onClick={() => setShowCc(true)}
                    className="text-[11px] font-semibold text-blue-600 hover:underline"
                  >
                    + Add CC / BCC
                  </button>
                )}
              </div>
              <input
                type="email"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* CC field */}
            {showCc && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">CC Email</label>
                <input
                  type="email"
                  placeholder="accounting@yourcompany.com"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            )}

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Line *</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Message Body</label>
              <textarea
                rows={7}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed font-sans"
              />
            </div>

            {/* Attachment & Payment Link Options */}
            <div className="pt-2 space-y-2 border-t border-slate-100 text-xs">
              <label className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <div className="flex items-center gap-2.5">
                  <Paperclip className="w-4 h-4 text-slate-500" />
                  <div>
                    <span className="font-semibold text-slate-900">Attach PDF Invoice</span>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      {invoice.invoiceNumber.toLowerCase()}.pdf (142 KB)
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={attachPdf}
                  onChange={(e) => setAttachPdf(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="font-semibold text-slate-900">Include Instant Online Payment Button</span>
                    <span className="text-[11px] text-slate-400 block">
                      Enables 1-click card/ACH checkout in the email body
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={includePayLink}
                  onChange={(e) => setIncludePayLink(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Live Email Client & Portal Preview (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
              Live Recipient Preview
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> TLS 1.3 Verified Delivery
            </span>
          </div>

          {/* Email Frame */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden text-xs">
            {/* Fake Email Client Header */}
            <div className="bg-slate-100/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between text-slate-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-2 font-mono text-[11px] text-slate-500 font-semibold">
                  Inbox • Customer View
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">Just Now</span>
            </div>

            {/* Email Meta Info */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-1 text-slate-600">
              <div className="flex gap-2">
                <span className="font-semibold text-slate-700 w-16">From:</span>
                <span className="text-slate-900">{companyProfile.name} &lt;billing@invoicepro.io&gt;</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-slate-700 w-16">To:</span>
                <span className="text-slate-900">{recipient}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-slate-700 w-16">Subject:</span>
                <span className="font-semibold text-slate-900">{subject}</span>
              </div>
            </div>

            {/* Email Body Content */}
            <div className="p-6 space-y-6 bg-[#fbfbfe]">
              {/* Message text */}
              <div className="whitespace-pre-line text-slate-800 leading-relaxed font-sans">
                {message}
              </div>

              {/* Invoice Interactive Card inside Email */}
              <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      IP
                    </div>
                    <div>
                      <div className="font-black text-slate-900">{invoice.invoiceNumber}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Due: {invoice.dueDate}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-mono">Amount Due</div>
                    <div className="font-black text-slate-900 text-lg font-mono-data">
                      ₦{invoice.total.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Line Item Quick List */}
                <div className="space-y-1.5 text-[11px] text-slate-600">
                  {invoice.items.slice(0, 3).map((it) => (
                    <div key={it.id} className="flex justify-between">
                      <span className="truncate max-w-[200px]">{it.description} (x{it.qty})</span>
                      <span className="font-mono text-slate-900 font-semibold">₦{it.total.toFixed(2)}</span>
                    </div>
                  ))}
                  {invoice.items.length > 3 && (
                    <div className="text-[10px] text-slate-400 italic">
                      + {invoice.items.length - 3} more line items...
                    </div>
                  )}
                </div>

                {/* Simulated Payment Trigger */}
                {includePayLink && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => onOpenPaymentPortal(invoice)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-lg text-xs shadow-sm flex items-center justify-center gap-2 transition-all"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>View & Pay Invoice Online (₦{invoice.total.toFixed(2)})</span>
                    </button>
                    <p className="text-[10px] text-slate-400 text-center mt-1.5">
                      Supports Visa, MasterCard, Amex, Apple Pay, & ACH Wire
                    </p>
                  </div>
                )}
              </div>

              {/* Attachments Section */}
              {attachPdf && (
                <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <div>
                      <span className="font-semibold text-slate-800">{invoice.invoiceNumber.toLowerCase()}.pdf</span>
                      <span className="text-[10px] text-slate-400 font-mono ml-2">142 KB</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-blue-600 font-semibold">Attached</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
