import React, { useState } from 'react';
import { 
  X, 
  Link as LinkIcon, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Mail, 
  RefreshCw, 
  Lock, 
  AlertCircle,
  Eye,
  FileSpreadsheet
} from 'lucide-react';
import { Client, Invoice } from '../types';
import { getClientPortalUrl, generateSecurePortalToken } from '../utils/portalUtils';

interface ClientPortalShareModalProps {
  client: Client | null;
  invoices: Invoice[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateClientToken: (clientId: string, newToken: string) => void;
  onOpenPortalView: (client: Client) => void;
  onSendPortalEmail?: (client: Client, portalUrl: string) => void;
}

export const ClientPortalShareModal: React.FC<ClientPortalShareModalProps> = ({
  client,
  invoices,
  isOpen,
  onClose,
  onUpdateClientToken,
  onOpenPortalView,
  onSendPortalEmail,
}) => {
  if (!isOpen || !client) return null;

  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);

  // Guarantee token exists
  const portalToken = client.portalToken || `pt_${client.id}_${Math.random().toString(36).slice(2, 10)}`;
  const portalUrl = getClientPortalUrl(portalToken);

  // Filter invoices for this client
  const clientInvoices = invoices.filter(
    (inv) => inv.clientName.toLowerCase() === client.name.toLowerCase() || inv.clientEmail.toLowerCase() === client.email.toLowerCase()
  );
  const unpaidCount = clientInvoices.filter((i) => i.status === 'pending' || i.status === 'overdue').length;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(portalUrl);
      } else {
        const input = document.createElement('input');
        input.value = portalUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      const newToken = generateSecurePortalToken(client.id, client.name);
      onUpdateClientToken(client.id, newToken);
      setIsRegenerating(false);
      setShowRegenerateConfirm(false);
      setCopied(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200/80 overflow-hidden relative">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure Client Access</span>
          </div>

          <h3 className="text-xl font-black text-white tracking-tight">
            Client Portal Link
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Provide <span className="font-semibold text-white">{client.name}</span> with a secure, unique URL to view their invoice ledger and pay balances directly.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-slate-700">
          {/* Client summary badge */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {client.logo || 'CL'}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">{client.name}</div>
                <div className="text-xs text-slate-500">{client.email}</div>
              </div>
            </div>

            <div className="text-right font-mono">
              <div className="text-[10px] uppercase font-bold text-slate-400">Outstanding Balance</div>
              <div className="text-sm font-black text-slate-900">
                ₦{client.outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Unique URL Box */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
              Unique Client URL
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  readOnly
                  value={portalUrl}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="w-full pl-3 pr-8 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>

              <button
                id="btn-copy-portal-url"
                onClick={handleCopyLink}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                onOpenPortalView(client);
                onClose();
              }}
              className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/40 text-slate-800 transition-all text-left group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs group-hover:text-blue-600 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span>Preview Portal</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
              </div>
              <p className="text-[11px] text-slate-500">
                View statement as the client ({clientInvoices.length} invoices, {unpaidCount} unpaid)
              </p>
            </button>

            {onSendPortalEmail && (
              <button
                onClick={() => {
                  onSendPortalEmail(client, portalUrl);
                  onClose();
                }}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-400 bg-white hover:bg-emerald-50/40 text-slate-800 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs group-hover:text-emerald-700 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-emerald-600" />
                    <span>Email Link</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                </div>
                <p className="text-[11px] text-slate-500">
                  Dispatch email invitation with direct login-free portal URL
                </p>
              </button>
            )}
          </div>

          {/* Security details & Token regeneration */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs space-y-2">
            <div className="flex items-start gap-2 text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                This encrypted link grants <span className="font-semibold text-slate-800">read-only access</span> exclusively to {client.name}'s invoices, receipts, and online checkout without exposing any other clients or account settings.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-400 truncate max-w-[220px]">
                Token: {portalToken.slice(0, 16)}...
              </span>

              {!showRegenerateConfirm ? (
                <button
                  onClick={() => setShowRegenerateConfirm(true)}
                  className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Regenerate Key</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-rose-600 font-semibold">Revoke old key?</span>
                  <button
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold hover:bg-rose-700"
                  >
                    {isRegenerating ? 'Generating...' : 'Confirm'}
                  </button>
                  <button
                    onClick={() => setShowRegenerateConfirm(false)}
                    className="text-[10px] text-slate-500 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
