import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none no-print">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto p-4 rounded-xl shadow-xl border flex items-start gap-3 animate-in slide-in-from-bottom-2 duration-150 ${
            t.type === 'success'
              ? 'bg-slate-900 text-white border-slate-800'
              : t.type === 'error'
              ? 'bg-rose-950 text-white border-rose-800'
              : 'bg-slate-900 text-white border-slate-800'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
            {t.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
          </div>
          <div className="flex-1 text-xs">
            <div className="font-bold">{t.title}</div>
            {t.description && <div className="text-slate-300 mt-0.5 leading-relaxed">{t.description}</div>}
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
