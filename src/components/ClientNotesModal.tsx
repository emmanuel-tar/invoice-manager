import React, { useState, useEffect } from 'react';
import { 
  X, 
  StickyNote, 
  Save, 
  Check, 
  Copy, 
  Clock, 
  User, 
  Sparkles, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { Client } from '../types';
import { RichTextEditor } from './RichTextEditor';

interface ClientNotesModalProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveNotes: (clientId: string, updatedNotes: string) => void;
}

export const ClientNotesModal: React.FC<ClientNotesModalProps> = ({
  client,
  isOpen,
  onClose,
  onSaveNotes,
}) => {
  if (!isOpen || !client) return null;

  const [notesContent, setNotesContent] = useState<string>(client.notes || '');
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNotesContent(client.notes || '');
  }, [client]);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onSaveNotes(client.id, notesContent);
      setIsSaving(false);
      onClose();
    }, 200);
  };

  const handleCopyPlainText = async () => {
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = notesContent;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(plainText);
      } else {
        const input = document.createElement('textarea');
        input.value = plainText;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleInsertTemplate = (templateHtml: string) => {
    const combined = notesContent 
      ? `${notesContent}<br>${templateHtml}` 
      : templateHtml;
    setNotesContent(combined);
  };

  const formattedDate = client.notesUpdatedAt 
    ? new Date(client.notesUpdatedAt).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <StickyNote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Client Notes &amp; Directives
                </h3>
                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-mono">
                  {client.name}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Internal team memos, contract milestones, discount terms, and billing instructions.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Client Mini Profile Strip */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200/70 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Contact: {client.contactPerson}</span>
            </span>
            <span className="text-slate-400">•</span>
            <span>{client.email}</span>
          </div>

          {formattedDate && (
            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
              <Clock className="w-3 h-3" />
              <span>Last updated: {formattedDate}</span>
            </div>
          )}
        </div>

        {/* Modal Body with Rich Text Editor */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Quick Insert Snippets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1 mr-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Quick Templates:
            </span>
            <button
              type="button"
              onClick={() => handleInsertTemplate('<p><strong>Billing Rule:</strong> Net-30 terms. Requires formal PO approval number on all invoices.</p>')}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-md transition-colors"
            >
              + Net-30 PO Rule
            </button>
            <button
              type="button"
              onClick={() => handleInsertTemplate('<p><strong>Discount Agreement:</strong> 5% volume discount applied to recurring quarterly retainers.</p>')}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-md transition-colors"
            >
              + Retainer Discount
            </button>
            <button
              type="button"
              onClick={() => handleInsertTemplate('<blockquote><strong>Tax Directive:</strong> Exemption Certificate #TX-2026 on file. Do not charge local sales tax.</blockquote>')}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-md transition-colors"
            >
              + Tax Exemption
            </button>
          </div>

          {/* Main Rich Text Editor */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-mono mb-1.5">
              Formatted Client Notes
            </label>
            <RichTextEditor
              value={notesContent}
              onChange={setNotesContent}
              minHeight="200px"
              maxHeight="380px"
              placeholder="Enter client billing requirements, key contract clauses, specialized payment terms, or contact reminders..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between">
          <button
            type="button"
            onClick={handleCopyPlainText}
            className="px-3 py-1.5 text-slate-600 hover:text-slate-900 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Copy note text to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Plain Text'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200 text-xs font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              id="btn-save-client-notes"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Notes'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
