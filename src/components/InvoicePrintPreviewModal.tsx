import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Send, 
  CheckCircle, 
  Building, 
  Layers, 
  CreditCard,
  Check
} from 'lucide-react';
import { Invoice, Estimate, CompanyProfile } from '../types';

interface InvoicePrintPreviewModalProps {
  document: Invoice | Estimate | null;
  type: 'invoice' | 'estimate';
  companyProfile: CompanyProfile;
  isOpen: boolean;
  onClose: () => void;
  onSendEmail?: (doc: any) => void;
}

export const InvoicePrintPreviewModal: React.FC<InvoicePrintPreviewModalProps> = ({
  document,
  type,
  companyProfile,
  isOpen,
  onClose,
  onSendEmail,
}) => {
  if (!isOpen || !document) return null;

  const isInvoice = type === 'invoice';
  const invoiceDoc = document as Invoice;
  const estimateDoc = document as Estimate;

  const docNumber = isInvoice ? invoiceDoc.invoiceNumber : estimateDoc.estimateNumber;
  const docTitle = isInvoice ? 'INVOICE' : 'ESTIMATE / QUOTE';
  const docDueDate = isInvoice ? invoiceDoc.dueDate : estimateDoc.expiryDate;
  const docStatus = isInvoice ? invoiceDoc.status : estimateDoc.status;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 my-8 overflow-hidden">
        {/* Top Control Bar (Hidden on print) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm text-blue-400">{docNumber}</span>
            <span className="text-slate-400 text-xs">• Document Preview</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            {onSendEmail && (
              <button
                onClick={() => {
                  onClose();
                  onSendEmail(document);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Email</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet Container */}
        <div className="p-8 md:p-12 space-y-8 bg-white text-slate-900 print-container">
          {/* Header & Logo */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-8">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                  IP
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    {companyProfile.name}
                  </h1>
                  <p className="text-xs text-slate-500 font-mono">Tax ID: {companyProfile.taxId}</p>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-500 whitespace-pre-line leading-relaxed">
                {companyProfile.address}
                <br />
                {companyProfile.phone}
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                {docTitle}
              </div>
              <div className="text-sm font-mono font-bold text-blue-600 mt-1">
                {docNumber}
              </div>
              <div className="mt-2">
                <span
                  className={`inline-block px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    docStatus === 'paid' || docStatus === 'accepted'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : docStatus === 'overdue' || docStatus === 'rejected'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {docStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Bill To & Dates Grid */}
          <div className="grid grid-cols-2 gap-8 text-xs">
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider font-mono text-[10px] block mb-1.5">
                Billed To:
              </span>
              <div className="font-bold text-slate-900 text-sm">{document.clientName}</div>
              <div className="text-slate-500 mt-1">{document.clientEmail}</div>
              <div className="text-slate-500 mt-0.5 whitespace-pre-line leading-relaxed">
                {document.clientAddress}
              </div>
            </div>

            <div className="space-y-2 text-right">
              <div>
                <span className="text-slate-400 font-mono text-[10px] uppercase font-bold mr-2">Issue Date:</span>
                <span className="font-mono font-bold text-slate-900">{document.date}</span>
              </div>
              <div>
                <span className="text-slate-400 font-mono text-[10px] uppercase font-bold mr-2">
                  {isInvoice ? 'Due Date:' : 'Valid Until:'}
                </span>
                <span className="font-mono font-bold text-slate-900">{docDueDate}</span>
              </div>
              {isInvoice && invoiceDoc.estimateRef && (
                <div>
                  <span className="text-slate-400 font-mono text-[10px] uppercase font-bold mr-2">Quote Reference:</span>
                  <span className="font-mono font-bold text-blue-600">{invoiceDoc.estimateRef}</span>
                </div>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-y border-slate-200 bg-slate-50/80 text-slate-600 font-mono uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-3 font-bold">Item & Description</th>
                  <th className="py-3 px-3 font-bold text-center">Qty</th>
                  <th className="py-3 px-3 font-bold text-right">Rate</th>
                  <th className="py-3 px-3 font-bold text-center">Tax %</th>
                  <th className="py-3 px-3 font-bold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {document.items.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="py-3 px-3 font-medium text-slate-900">
                      {item.description}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">{item.qty}</td>
                    <td className="py-3 px-3 text-right font-mono">${item.unitPrice.toFixed(2)}</td>
                    <td className="py-3 px-3 text-center font-mono text-slate-500">{item.taxRate}%</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      ${item.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary & Bank Remittance */}
          <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-200 text-xs">
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider font-mono text-[10px] block mb-1.5">
                Payment Instructions & Bank Wire:
              </span>
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 space-y-1 text-slate-600 text-[11px]">
                <div><span className="font-bold text-slate-800">Bank:</span> {companyProfile.bankName}</div>
                <div><span className="font-bold text-slate-800">Account / IBAN:</span> {companyProfile.accountNumber}</div>
                <div><span className="font-bold text-slate-800">Routing Code:</span> 12100024</div>
              </div>

              {document.notes && (
                <div className="mt-3 text-[11px] text-slate-500 italic leading-relaxed">
                  "{document.notes}"
                </div>
              )}
            </div>

            <div className="space-y-2 text-right">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-bold text-slate-900">${document.subtotal.toFixed(2)}</span>
              </div>

              {document.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span className="font-mono font-bold">-${document.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Tax Amount:</span>
                <span className="font-mono font-bold text-slate-900">${document.taxAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-slate-900 font-black">
                <span className="text-sm">Total Due ({companyProfile.currency}):</span>
                <span className="text-xl font-mono text-blue-600">
                  ${document.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-8 border-t border-slate-100 text-center text-[10px] text-slate-400 font-mono">
            Thank you for choosing {companyProfile.name} • Precision Ledger Certified Document
          </div>
        </div>
      </div>
    </div>
  );
};
