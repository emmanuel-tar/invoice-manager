import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, FileDown, ImageDown, Loader2, Printer, X, ZoomIn, ZoomOut } from 'lucide-react';

const MIN_ZOOM = 0.35;
const MAX_ZOOM = 1.5;
import { Invoice, Estimate, CompanyProfile } from '../types';
import { DocumentSheet } from './DocumentSheet';
import { exportElementAsImage, exportElementAsPdf, printElement } from '../utils/documentExport';

interface DocumentCreatedModalProps {
  doc: Invoice | Estimate | null;
  type: 'invoice' | 'estimate';
  companyProfile: CompanyProfile;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Popup shown immediately after an invoice or estimate is created.
 * Offers Print, Save as PDF and Save as Image — all rendered to exact
 * A4 sheet size so no details are ever cut off.
 */
export const DocumentCreatedModal: React.FC<DocumentCreatedModalProps> = ({
  doc,
  type,
  companyProfile,
  isOpen,
  onClose,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [busyAction, setBusyAction] = useState<'print' | 'pdf' | 'image' | null>(null);
  const [error, setError] = useState<string | null>(null);
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
  }, [isOpen, doc]);

  const fitToWidth = () => {
    const w = dims.w || sheetRef.current?.offsetWidth || 0;
    const available = (stageRef.current?.clientWidth ?? w) - 32;
    if (w > 0) setZoom(Math.max(MIN_ZOOM, Math.min(1, available / w)));
  };

  if (!isOpen || !doc) return null;

  const docNumber = type === 'invoice' ? (doc as Invoice).invoiceNumber : (doc as Estimate).estimateNumber;

  const runAction = async (action: 'print' | 'pdf' | 'image') => {
    if (!sheetRef.current || busyAction) return;
    setBusyAction(action);
    setError(null);
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
      setError('Something went wrong while generating the document. Please try again.');
    } finally {
      setBusyAction(null);
      setZoom(prevZoom);
    }
  };

  const actionBtnClass =
    'flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[60] p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 my-8 overflow-hidden print-scope flex flex-col max-h-[92vh]">
        {/* Success Header */}
        <div className="bg-emerald-600 text-white px-6 py-4 flex items-center justify-between no-print">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </span>
            <div>
              <div className="font-bold text-sm">
                {type === 'invoice' ? 'Invoice Created Successfully' : 'Estimate Created Successfully'}
              </div>
              <div className="text-xs text-emerald-100 font-mono">
                {docNumber} • {doc.clientName}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-100 hover:text-white rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-2 no-print">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono mr-1">
            Export A4 Document:
          </span>
          <button
            onClick={() => runAction('print')}
            disabled={busyAction !== null}
            className={`${actionBtnClass} bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white`}
          >
            {busyAction === 'print' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5" />}
            <span>Print</span>
          </button>
          <button
            onClick={() => runAction('pdf')}
            disabled={busyAction !== null}
            className={`${actionBtnClass} bg-slate-900 hover:bg-slate-800 text-white`}
          >
            {busyAction === 'pdf' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
            <span>Save as PDF</span>
          </button>
          <button
            onClick={() => runAction('image')}
            disabled={busyAction !== null}
            className={`${actionBtnClass} bg-slate-200 hover:bg-slate-300 text-slate-800`}
          >
            {busyAction === 'image' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageDown className="w-3.5 h-3.5" />}
            <span>Save as Image</span>
          </button>

          <div className="flex-1" />

          <button
            onClick={onClose}
            disabled={busyAction !== null}
            className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Done
          </button>
        </div>

        {error && (
          <div className="px-6 py-2 bg-rose-50 text-rose-700 text-xs font-semibold border-b border-rose-100 no-print">
            {error}
          </div>
        )}

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

        {/* Live A4 Preview (scrollable, zoomable) */}
        <div ref={stageRef} className="flex-1 min-h-0 overflow-auto bg-slate-200/70 p-4 print-scope">
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
                <DocumentSheet document={doc} type={type} companyProfile={companyProfile} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};