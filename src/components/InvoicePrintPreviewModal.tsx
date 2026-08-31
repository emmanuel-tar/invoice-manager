import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Printer,
  Send,
  FileDown,
  ImageDown,
  Loader2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

const MIN_ZOOM = 0.35;
const MAX_ZOOM = 1.5;
import { Invoice, Estimate, CompanyProfile } from '../types';
import { DocumentSheet } from './DocumentSheet';
import { exportElementAsImage, exportElementAsPdf, printElement } from '../utils/documentExport';

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
  const sheetRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [busyAction, setBusyAction] = useState<'print' | 'pdf' | 'image' | null>(null);
  const [zoom, setZoom] = useState(1);
  const [dims, setDims] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  // Measure the natural (unscaled) sheet size and default the zoom to fit the viewport width
  useEffect(() => {
    if (!isOpen || !sheetRef.current) return;
    const w = sheetRef.current.offsetWidth;
    const h = sheetRef.current.offsetHeight;
    if (w > 0) setDims({ w, h });
    const available = (stageRef.current?.clientWidth ?? w) - 32;
    setZoom(Math.max(MIN_ZOOM, Math.min(1, available / w)));
  }, [isOpen, document]);

  const fitToWidth = () => {
    const w = dims.w || sheetRef.current?.offsetWidth || 0;
    const available = (stageRef.current?.clientWidth ?? w) - 32;
    if (w > 0) setZoom(Math.max(MIN_ZOOM, Math.min(1, available / w)));
  };

  if (!isOpen || !document) return null;

  const isInvoice = type === 'invoice';
  const invoiceDoc = document as Invoice;
  const estimateDoc = document as Estimate;

  const docNumber = isInvoice ? invoiceDoc.invoiceNumber : estimateDoc.estimateNumber;

  const runAction = async (action: 'print' | 'pdf' | 'image') => {
    if (!sheetRef.current || busyAction) return;
    setBusyAction(action);
    // Capture at 100% zoom for a crisp, unscaled export
    const prevZoom = zoom;
    setZoom(1);
    await new Promise((resolve) => setTimeout(resolve, 250));
    try {
      if (action === 'print') {
        await printElement(sheetRef.current, `${docNumber} - ${companyProfile.name}`);
      } else if (action === 'pdf') {
        await exportElementAsPdf(sheetRef.current, `${docNumber}.pdf`);
      } else {
        await exportElementAsImage(sheetRef.current, `${docNumber}.png`);
      }
    } catch (err) {
      console.error('Document export failed:', err);
    } finally {
      setBusyAction(null);
      setZoom(prevZoom);
    }
  };

  const btnClass =
    'flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-in fade-in duration-150 print-scope">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 my-8 overflow-hidden print-scope flex flex-col max-h-[92vh]">
        {/* Top Control Bar (Hidden on print) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between no-print flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm text-blue-400">{docNumber}</span>
            <span className="text-slate-400 text-xs">• Document Preview (A4)</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => runAction('print')} disabled={busyAction !== null} className={btnClass}>
              {busyAction === 'print' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5" />}
              <span>Print</span>
            </button>

            <button onClick={() => runAction('pdf')} disabled={busyAction !== null} className={btnClass}>
              {busyAction === 'pdf' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
              <span>Download PDF</span>
            </button>

            <button onClick={() => runAction('image')} disabled={busyAction !== null} className={btnClass}>
              {busyAction === 'image' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageDown className="w-3.5 h-3.5" />}
              <span>Save as Image</span>
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

        {/* Zoom Controls */}
        <div className="px-6 py-2 bg-white border-b border-slate-200 flex items-center gap-2 no-print">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">Zoom</span>
          <button
            onClick={() => setZoom((z) => Math.max(MIN_ZOOM, Math.round((z - 0.1) * 100) / 100))}
            disabled={busyAction !== null}
            className="p-1 rounded-md hover:bg-slate-100 text-slate-600 transition-colors disabled:opacity-40"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <input
            type="range"
            min={Math.round(MIN_ZOOM * 100)}
            max={Math.round(MAX_ZOOM * 100)}
            value={Math.round(zoom * 100)}
            onChange={(e) => setZoom(Number(e.target.value) / 100)}
            className="w-32 sm:w-44 accent-blue-600 cursor-pointer"
            aria-label="Zoom level"
          />
          <button
            onClick={() => setZoom((z) => Math.min(MAX_ZOOM, Math.round((z + 0.1) * 100) / 100))}
            disabled={busyAction !== null}
            className="p-1 rounded-md hover:bg-slate-100 text-slate-600 transition-colors disabled:opacity-40"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-slate-600 w-10 text-right">{Math.round(zoom * 100)}%</span>
          <button
            onClick={fitToWidth}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wide"
          >
            Fit
          </button>
          <span className="ml-auto text-[10px] text-slate-400 font-mono hidden md:block">
            Scroll inside the preview to view the full sheet
          </span>
        </div>

        {/* Printable A4 Document Sheet (scrollable, zoomable) */}
        <div ref={stageRef} className="flex-1 min-h-0 overflow-auto bg-slate-200/70 p-4 md:p-8 print-scope">
          <div
            style={
              dims.w > 0
                ? { width: dims.w * zoom, height: dims.h * zoom, margin: '0 auto' }
                : { width: 'fit-content', margin: '0 auto' }
            }
          >
            <div
              style={
                dims.w > 0
                  ? { width: dims.w, height: dims.h, transform: `scale(${zoom})`, transformOrigin: 'top left' }
                  : undefined
              }
            >
              <div ref={sheetRef} className="shadow-xl w-fit">
                <DocumentSheet document={document} type={type} companyProfile={companyProfile} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};