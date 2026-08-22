import React, { useEffect } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Send, 
  Eye, 
  FileSpreadsheet, 
  X,
  FileText,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Invoice, Estimate } from '../types';

interface ConvertSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  convertedInvoice: Invoice | null;
  sourceEstimate: Estimate | null;
  onViewInvoice: (invoice: Invoice) => void;
  onSendInvoice: (invoice: Invoice) => void;
  onReturnToEstimates: () => void;
}

export const ConvertSuccessModal: React.FC<ConvertSuccessModalProps> = ({
  isOpen,
  onClose,
  convertedInvoice,
  sourceEstimate,
  onViewInvoice,
  onSendInvoice,
  onReturnToEstimates,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00236f', '#14b8a6', '#38bdf8', '#10b981', '#6366f1'],
        });
      } catch (e) {
        // Fallback gracefully
      }
    }
  }, [isOpen]);

  if (!isOpen || !convertedInvoice) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl max-w-md w-full p-6 text-center shadow-xl border border-slate-200/80 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50/50">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-black text-slate-900 tracking-tight">
          Conversion Complete!
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          Estimate <span className="font-bold text-slate-700 font-mono">{sourceEstimate?.estimateNumber}</span> was successfully converted into Invoice <span className="font-bold text-blue-600 font-mono">{convertedInvoice.invoiceNumber}</span>.
        </p>

        {/* Invoice Summary Box */}
        <div className="my-5 p-4 rounded-lg bg-slate-50 border border-slate-200/80 text-left text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span>Client</span>
            <span className="font-semibold text-slate-900">{convertedInvoice.clientName}</span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>Invoice Number</span>
            <span className="font-mono font-bold text-blue-600">{convertedInvoice.invoiceNumber}</span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>Total Invoiced</span>
            <span className="font-mono font-black text-slate-900 text-sm">
              ${convertedInvoice.total.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>Status</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-amber-50 text-amber-700 border border-amber-200">
              {convertedInvoice.status}
            </span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="space-y-2 text-xs">
          <button
            id="btn-success-send-email"
            onClick={() => onSendInvoice(convertedInvoice)}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Send Invoice via Email</span>
          </button>

          <button
            id="btn-success-view-invoice"
            onClick={() => onViewInvoice(convertedInvoice)}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>View & Print PDF</span>
          </button>

          <button
            id="btn-success-back-estimates"
            onClick={onReturnToEstimates}
            className="w-full py-2 text-slate-500 hover:text-slate-800 font-medium transition-colors"
          >
            Return to Estimates
          </button>
        </div>
      </div>
    </div>
  );
};
