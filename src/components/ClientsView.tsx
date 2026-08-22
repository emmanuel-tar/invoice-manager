import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  MoreVertical, 
  DollarSign, 
  FileText, 
  Edit3, 
  Trash2, 
  ExternalLink,
  Send,
  Building2,
  X,
  ShieldCheck,
  Link as LinkIcon,
  Copy,
  Check,
  StickyNote,
  FileCode,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Client, Invoice } from '../types';
import { ClientPortalShareModal } from './ClientPortalShareModal';
import { ClientNotesModal } from './ClientNotesModal';
import { RichTextEditor } from './RichTextEditor';
import { generateSecurePortalToken, getClientPortalUrl } from '../utils/portalUtils';

interface ClientsViewProps {
  clients: Client[];
  invoices: Invoice[];
  onAddClient: (client: Client) => void;
  onEditClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => void;
  onSelectClientToInvoice: (client: Client) => void;
  onSendReminder: (client: Client) => void;
  onOpenPortalView?: (client: Client) => void;
  onUpdateClientToken?: (clientId: string, newToken: string) => void;
  onSendPortalEmail?: (client: Client, portalUrl: string) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  invoices,
  onAddClient,
  onEditClient,
  onDeleteClient,
  onSelectClientToInvoice,
  onSendReminder,
  onOpenPortalView,
  onUpdateClientToken,
  onSendPortalEmail,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClientForPortalShare, setSelectedClientForPortalShare] = useState<Client | null>(null);
  const [selectedClientForNotes, setSelectedClientForNotes] = useState<Client | null>(null);
  const [copiedClientId, setCopiedClientId] = useState<string | null>(null);
  const [expandedNotesClientIds, setExpandedNotesClientIds] = useState<Record<string, boolean>>({});

  // New/Edit client form state
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const openNewModal = () => {
    setEditingClient(null);
    setName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setAddress('');
    setNotes('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (c: Client) => {
    setEditingClient(c);
    setName(c.name);
    setContactPerson(c.contactPerson);
    setEmail(c.email);
    setPhone(c.phone);
    setAddress(c.address);
    setNotes(c.notes || '');
    setIsAddModalOpen(true);
  };

  const toggleExpandNote = (clientId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNotesClientIds((prev) => ({
      ...prev,
      [clientId]: !prev[clientId],
    }));
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (editingClient) {
      onEditClient({
        ...editingClient,
        name,
        contactPerson,
        email,
        phone,
        address,
        notes: notes.trim() ? notes : undefined,
        notesUpdatedAt: new Date().toISOString(),
      });
    } else {
      const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

      const newId = `client-${Date.now()}`;
      const newClient: Client = {
        id: newId,
        name,
        contactPerson,
        email,
        phone,
        address,
        logo: initials || 'CL',
        outstanding: 0,
        totalRevenue: 0,
        invoiceCount: 0,
        activeProjects: 1,
        status: 'active',
        portalToken: generateSecurePortalToken(newId, name),
        portalTokenCreatedAt: new Date().toISOString(),
        notes: notes.trim() ? notes : undefined,
        notesUpdatedAt: notes.trim() ? new Date().toISOString() : undefined,
      };
      onAddClient(newClient);
    }
    setIsAddModalOpen(false);
  };

  const handleSaveNotesDirectly = (clientId: string, updatedNotes: string) => {
    const targetClient = clients.find((c) => c.id === clientId);
    if (!targetClient) return;

    const updated = {
      ...targetClient,
      notes: updatedNotes.trim() ? updatedNotes : undefined,
      notesUpdatedAt: new Date().toISOString(),
    };
    onEditClient(updated);

    if (selectedClientForNotes && selectedClientForNotes.id === clientId) {
      setSelectedClientForNotes(updated);
    }
  };

  const handleQuickCopyPortalLink = async (client: Client, e: React.MouseEvent) => {
    e.stopPropagation();
    const token = client.portalToken || generateSecurePortalToken(client.id, client.name);
    const url = getClientPortalUrl(token);
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedClientId(client.id);
      setTimeout(() => setCopiedClientId(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredClients = clients.filter((c) => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(query) ||
      c.contactPerson.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query) ||
      (c.notes && c.notes.toLowerCase().includes(query));
    return matchesStatus && matchesSearch;
  });

  const totalOutstandingAll = clients.reduce((acc, c) => acc + c.outstanding, 0);
  const totalRevenueAll = clients.reduce((acc, c) => acc + c.totalRevenue, 0);

  return (
    <div id="clients-view-container" className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Clients</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage customer directories, billing addresses, rich account notes, and historical ledgers.
          </p>
        </div>

        <button
          id="btn-add-client-main"
          onClick={openNewModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Client</span>
        </button>
      </div>

      {/* KPI bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 font-mono uppercase">Total Clients</div>
          <div className="text-xl font-black text-slate-900 font-mono-data mt-1">{clients.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Active customer accounts</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-600 font-mono uppercase">Lifetime Revenue</div>
          <div className="text-xl font-black text-emerald-700 font-mono-data mt-1">
            ${totalRevenueAll.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Cumulative billed volume</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-blue-600 font-mono uppercase">Total Outstanding</div>
          <div className="text-xl font-black text-blue-700 font-mono-data mt-1">
            ${totalOutstandingAll.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Unsettled client balances</div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-600 font-mono uppercase">Active Accounts</div>
          <div className="text-xl font-black text-slate-900 font-mono-data mt-1">
            {clients.filter(c => c.status === 'active').length} Active
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{clients.filter(c => c.status === 'overdue').length} with overdue flags</div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'all', label: 'All Clients' },
            { id: 'active', label: 'Active' },
            { id: 'overdue', label: 'Overdue Balance' },
            { id: 'inactive', label: 'Inactive' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredClients.map((client) => {
          const clientInvoices = invoices.filter((i) => i.clientName === client.name);
          const hasOverdue = client.status === 'overdue' || client.outstanding > 0;
          const isNoteExpanded = expandedNotesClientIds[client.id] || false;
          const hasNotes = Boolean(client.notes && client.notes.trim());

          return (
            <div
              key={client.id}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                      {client.logo || 'CL'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                        {client.name}
                      </h3>
                      <p className="text-xs text-slate-500">{client.contactPerson}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      client.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : client.status === 'overdue'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {client.status}
                  </span>
                </div>

                {/* Contact items */}
                <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{client.address}</span>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-500 font-bold block">
                      Outstanding
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      ${client.outstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono text-slate-500 font-bold block">
                      Total Billed
                    </span>
                    <span className="font-mono font-bold text-slate-900">
                      ${client.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Rich Client Notes Block */}
                <div className="mt-3.5 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedClientForNotes(client)}
                      className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-800 hover:text-amber-900 transition-colors"
                      title="Open rich text client notes editor"
                    >
                      <StickyNote className="w-3.5 h-3.5 text-amber-600" />
                      <span>Client Notes</span>
                      {hasNotes && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      )}
                    </button>

                    <div className="flex items-center gap-1">
                      {hasNotes && (
                        <button
                          type="button"
                          onClick={(e) => toggleExpandNote(client.id, e)}
                          className="text-[10px] text-slate-400 hover:text-slate-700 flex items-center gap-0.5 px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors"
                        >
                          <span>{isNoteExpanded ? 'Collapse' : 'Expand'}</span>
                          {isNoteExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedClientForNotes(client)}
                        className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {hasNotes ? 'Edit' : '+ Add Note'}
                      </button>
                    </div>
                  </div>

                  {hasNotes ? (
                    <div 
                      onClick={() => setSelectedClientForNotes(client)}
                      className={`p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/60 text-xs text-slate-700 cursor-pointer hover:bg-amber-50 hover:border-amber-300 transition-all rich-notes-content ${
                        isNoteExpanded ? 'max-h-56 overflow-y-auto' : 'line-clamp-2 overflow-hidden'
                      }`}
                      dangerouslySetInnerHTML={{ __html: client.notes || '' }}
                    />
                  ) : (
                    <div 
                      onClick={() => setSelectedClientForNotes(client)}
                      className="p-2 rounded-lg bg-slate-50/80 border border-dashed border-slate-200 text-[11px] text-slate-400 cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 hover:text-blue-600 transition-all flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Click to add billing preferences or instructions...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectClientToInvoice(client)}
                    className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Invoice Client</span>
                  </button>

                  <button
                    id={`btn-portal-${client.id}`}
                    onClick={() => setSelectedClientForPortalShare(client)}
                    title="Generate & share secure client portal link"
                    className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors border border-emerald-200/60"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Portal Link</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    onClick={(e) => handleQuickCopyPortalLink(client, e)}
                    className="text-slate-500 hover:text-blue-600 font-medium flex items-center gap-1 text-[11px] transition-colors"
                    title="Quick copy direct client portal URL"
                  >
                    {copiedClientId === client.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Copied URL!</span>
                      </>
                    ) : (
                      <>
                        <LinkIcon className="w-3 h-3 text-slate-400" />
                        <span>Copy Unique URL</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedClientForNotes(client)}
                      title="Open & Edit Client Notes"
                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      <StickyNote className="w-3.5 h-3.5" />
                    </button>

                    {hasOverdue && (
                      <button
                        onClick={() => onSendReminder(client)}
                        title="Send Payment Reminder"
                        className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => openEditModal(client)}
                      title="Edit Client"
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteClient(client.id)}
                      title="Delete Client"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Client Notes Rich Text Modal */}
      <ClientNotesModal
        client={selectedClientForNotes}
        isOpen={Boolean(selectedClientForNotes)}
        onClose={() => setSelectedClientForNotes(null)}
        onSaveNotes={handleSaveNotesDirectly}
      />

      {/* Client Portal Share & URL Generator Modal */}
      <ClientPortalShareModal
        client={selectedClientForPortalShare}
        invoices={invoices}
        isOpen={Boolean(selectedClientForPortalShare)}
        onClose={() => setSelectedClientForPortalShare(null)}
        onUpdateClientToken={(clientId, newToken) => {
          if (onUpdateClientToken) {
            onUpdateClientToken(clientId, newToken);
          }
          if (selectedClientForPortalShare && selectedClientForPortalShare.id === clientId) {
            setSelectedClientForPortalShare({ ...selectedClientForPortalShare, portalToken: newToken });
          }
        }}
        onOpenPortalView={(c) => {
          if (onOpenPortalView) {
            onOpenPortalView(c);
          }
        }}
        onSendPortalEmail={onSendPortalEmail}
      />

      {/* Add / Edit Client Modal with Rich Notes */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200/80 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span>{editingClient ? 'Edit Client Details' : 'Add New Client'}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Company / Client Name *</label>
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
                <label className="block font-bold text-slate-700 mb-1">Primary Contact Person</label>
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
                  <label className="block font-bold text-slate-700 mb-1">Billing Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="billing@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
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
                <label className="block font-bold text-slate-700 mb-1">Billing Street Address</label>
                <textarea
                  rows={2}
                  placeholder="450 Mission Street, Suite 2200, San Francisco, CA 94105"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Rich-Text Client Notes Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <StickyNote className="w-3.5 h-3.5 text-amber-600" />
                    <span>Client Notes (Rich Text)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Payment terms, billing rules, PO requirements</span>
                </div>
                <RichTextEditor
                  value={notes}
                  onChange={setNotes}
                  minHeight="120px"
                  maxHeight="220px"
                  placeholder="e.g. Net-30 terms. Send invoices CC to accounting@client.com. PO # required."
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg shadow-sm"
                >
                  {editingClient ? 'Save Changes' : 'Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
