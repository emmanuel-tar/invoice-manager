import React, { useState } from 'react';
import { X, UserPlus, StickyNote } from 'lucide-react';
import { Client } from '../types';
import { generateSecurePortalToken } from '../utils/portalUtils';
import { RichTextEditor } from './RichTextEditor';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClient: (client: Client) => void;
}

export const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  onAddClient,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const newClientId = `client-${Date.now()}`;
    const newClient: Client = {
      id: newClientId,
      name,
      contactPerson: contactPerson || name,
      email,
      phone: phone || '+1 (555) 000-0000',
      address: address || '100 Main St, City, Country',
      logo: initials || 'CL',
      outstanding: 0,
      totalRevenue: 0,
      invoiceCount: 0,
      activeProjects: 1,
      status: 'active',
      portalToken: generateSecurePortalToken(newClientId, name),
      portalTokenCreatedAt: new Date().toISOString(),
      notes: notes.trim() ? notes : undefined,
      notesUpdatedAt: notes.trim() ? new Date().toISOString() : undefined,
    };

    onAddClient(newClient);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200/80 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Add New Client</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company / Client Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Acme Corporation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Primary Contact Person</label>
            <input
              type="text"
              placeholder="e.g. Sarah Jenkins"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Billing Email *</label>
              <input
                type="email"
                required
                placeholder="billing@acme.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Billing Street Address</label>
            <textarea
              rows={2}
              placeholder="450 Mission Street, Suite 2200, San Francisco, CA 94105"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Rich Notes Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <StickyNote className="w-3.5 h-3.5 text-amber-600" />
                <span>Client Notes & Directives</span>
              </label>
              <span className="text-[10px] text-slate-400">Payment terms, PO requirements, discount rates</span>
            </div>
            <RichTextEditor
              value={notes}
              onChange={setNotes}
              minHeight="120px"
              maxHeight="200px"
              placeholder="Add client billing requirements, key contract clauses, specialized payment terms, or contact reminders..."
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg shadow-sm transition-all"
            >
              Save Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
