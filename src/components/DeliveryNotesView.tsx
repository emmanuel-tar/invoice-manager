import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Printer, 
  Download, 
  FileText, 
  Calendar, 
  User, 
  MapPin, 
  PackageCheck, 
  X, 
  ChevronRight,
  ShieldCheck,
  Eye,
  Send,
  Trash2,
  Edit3
} from 'lucide-react';
import { DeliveryNote, DeliveryStatus, DeliveryItem, Client, Invoice, SaleOrder } from '../types';

interface DeliveryNotesViewProps {
  deliveryNotes: DeliveryNote[];
  clients: Client[];
  invoices: Invoice[];
  saleOrders: SaleOrder[];
  onAddDeliveryNote: (note: DeliveryNote) => void;
  onUpdateDeliveryNote: (note: DeliveryNote) => void;
  onDeleteDeliveryNote: (id: string) => void;
  currencySymbol: string;
  initialCreateOpen?: boolean;
}

export const DeliveryNotesView: React.FC<DeliveryNotesViewProps> = ({
  deliveryNotes,
  clients,
  invoices,
  saleOrders,
  onAddDeliveryNote,
  onUpdateDeliveryNote,
  onDeleteDeliveryNote,
  currencySymbol,
  initialCreateOpen = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(initialCreateOpen);
  const [selectedNoteForView, setSelectedNoteForView] = useState<DeliveryNote | null>(null);
  const [selectedNoteForEdit, setSelectedNoteForEdit] = useState<DeliveryNote | null>(null);

  // Form State
  const [clientName, setClientName] = useState(clients[0]?.name || '');
  const [clientEmail, setClientEmail] = useState(clients[0]?.email || '');
  const [clientPhone, setClientPhone] = useState(clients[0]?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState(clients[0]?.address || '');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [saleOrderNumber, setSaleOrderNumber] = useState('');
  const [dispatchDate, setDispatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [carrierName, setCarrierName] = useState('DHL Express Logistics');
  const [trackingNumber, setTrackingNumber] = useState(`TRK-${Math.floor(100000 + Math.random() * 900000)}`);
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [packagesCount, setPackagesCount] = useState<number>(1);
  const [totalWeightKg, setTotalWeightKg] = useState<number>(5.0);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<DeliveryStatus>('dispatched');

  const [items, setItems] = useState<DeliveryItem[]>([
    {
      id: 'dni-1',
      description: 'Standard Delivery Merchandise Batch',
      orderedQty: 1,
      deliveredQty: 1,
      unit: 'Units',
      packageDetails: 'Standard protective carton packaging',
    }
  ]);

  const handleClientChange = (name: string) => {
    setClientName(name);
    const found = clients.find(c => c.name === name);
    if (found) {
      setClientEmail(found.email);
      setClientPhone(found.phone);
      setDeliveryAddress(found.address);
    }
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `dni-${Date.now()}`,
        description: '',
        orderedQty: 1,
        deliveredQty: 1,
        unit: 'Units',
        packageDetails: '',
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof DeliveryItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newNoteNumber = `DN-2026-${String(deliveryNotes.length + 1).padStart(3, '0')}`;
    const newNote: DeliveryNote = {
      id: `dn-${Date.now()}`,
      noteNumber: newNoteNumber,
      invoiceNumber: invoiceNumber.trim() || undefined,
      saleOrderNumber: saleOrderNumber.trim() || undefined,
      clientName,
      clientEmail,
      clientPhone,
      deliveryAddress,
      dispatchDate,
      expectedDeliveryDate,
      carrierName,
      trackingNumber,
      driverName: driverName.trim() || undefined,
      driverPhone: driverPhone.trim() || undefined,
      vehicleNumber: vehicleNumber.trim() || undefined,
      packagesCount: Number(packagesCount) || 1,
      totalWeightKg: Number(totalWeightKg) || 0,
      items,
      status,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onAddDeliveryNote(newNote);
    setIsCreateModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setClientName(clients[0]?.name || '');
    setClientEmail(clients[0]?.email || '');
    setClientPhone(clients[0]?.phone || '');
    setDeliveryAddress(clients[0]?.address || '');
    setInvoiceNumber('');
    setSaleOrderNumber('');
    setDispatchDate(new Date().toISOString().split('T')[0]);
    setExpectedDeliveryDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setCarrierName('DHL Express Logistics');
    setTrackingNumber(`TRK-${Math.floor(100000 + Math.random() * 900000)}`);
    setDriverName('');
    setDriverPhone('');
    setVehicleNumber('');
    setPackagesCount(1);
    setTotalWeightKg(5.0);
    setNotes('');
    setStatus('dispatched');
    setItems([
      {
        id: 'dni-1',
        description: 'Standard Delivery Merchandise Batch',
        orderedQty: 1,
        deliveredQty: 1,
        unit: 'Units',
        packageDetails: 'Standard protective carton packaging',
      }
    ]);
  };

  const filteredNotes = useMemo(() => {
    return deliveryNotes.filter(note => {
      const matchesSearch = 
        note.noteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (note.invoiceNumber && note.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (note.carrierName && note.carrierName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || note.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [deliveryNotes, searchTerm, statusFilter]);

  const getStatusBadge = (status: DeliveryStatus) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'in_transit':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Truck className="w-3.5 h-3.5" /> In Transit
          </span>
        );
      case 'dispatched':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" /> Dispatched
          </span>
        );
      case 'returned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <AlertCircle className="w-3.5 h-3.5" /> Returned
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/20 text-slate-300 border border-slate-500/30">
            Draft
          </span>
        );
    }
  };

  const handleMarkDelivered = (note: DeliveryNote) => {
    const updated: DeliveryNote = {
      ...note,
      status: 'delivered',
      actualDeliveryDate: new Date().toISOString().split('T')[0],
      receivedBy: note.receivedBy || 'Consignee Receiver',
    };
    onUpdateDeliveryNote(updated);
    if (selectedNoteForView && selectedNoteForView.id === note.id) {
      setSelectedNoteForView(updated);
    }
  };

  return (
    <div id="delivery-notes-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Truck className="w-7 h-7 text-indigo-400" />
            Delivery Notes & Dispatch Slips
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Create, track, and generate professional goods delivery notes and proof-of-delivery vouchers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="create-delivery-note-btn"
            onClick={() => {
              resetForm();
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            Create Delivery Note
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Delivery Notes</span>
            <FileText className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-2">{deliveryNotes.length}</p>
          <span className="text-xs text-slate-500 mt-1 block">Active recorded consignments</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-400">In Transit</span>
            <Truck className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-300 mt-2">
            {deliveryNotes.filter(n => n.status === 'in_transit').length}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">On route with carriers</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-400">Dispatched Today</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-300 mt-2">
            {deliveryNotes.filter(n => n.status === 'dispatched').length}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Awaiting carrier transit</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-400">Successfully Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-300 mt-2">
            {deliveryNotes.filter(n => n.status === 'delivered').length}
          </p>
          <span className="text-xs text-slate-500 mt-1 block">Signed proof of delivery</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="search-delivery-notes"
            type="text"
            placeholder="Search note #, client, tracking #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          {(['all', 'dispatched', 'in_transit', 'delivered', 'returned'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st === 'all' ? 'All Statuses' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Delivery Notes Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Note #</th>
                <th className="py-3.5 px-4">Client & Address</th>
                <th className="py-3.5 px-4">Carrier & Tracking</th>
                <th className="py-3.5 px-4">Dates</th>
                <th className="py-3.5 px-4">Packages</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredNotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    <Truck className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                    <p className="text-base font-medium text-slate-400">No delivery notes found</p>
                    <p className="text-xs text-slate-500 mt-1">Create a new delivery note or adjust your search filters.</p>
                  </td>
                </tr>
              ) : (
                filteredNotes.map((note) => (
                  <tr key={note.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-indigo-300">
                      <div>{note.noteNumber}</div>
                      {note.invoiceNumber && (
                        <span className="text-[11px] text-slate-500 block font-normal">
                          Inv: {note.invoiceNumber}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-200">{note.clientName}</div>
                      <div className="text-xs text-slate-500 truncate max-w-xs">{note.deliveryAddress}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs font-medium text-slate-300">{note.carrierName}</div>
                      <div className="text-[11px] font-mono text-slate-400">{note.trackingNumber}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="text-slate-300">Disp: {note.dispatchDate}</div>
                      <div className="text-slate-500">Exp: {note.expectedDeliveryDate}</div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <div className="text-slate-200">{note.packagesCount} pkg(s)</div>
                      {note.totalWeightKg && (
                        <div className="text-slate-500">{note.totalWeightKg} kg</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(note.status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedNoteForView(note)}
                          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                          title="View / Print Dispatch Slip"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {note.status !== 'delivered' && (
                          <button
                            onClick={() => handleMarkDelivered(note)}
                            className="p-1.5 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors"
                            title="Mark as Delivered"
                          >
                            <PackageCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteDeliveryNote(note.id)}
                          className="p-1.5 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Delivery Note Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-semibold text-slate-100">Create New Delivery Note</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client selection */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Client / Consignee</label>
                  <select
                    value={clientName}
                    onChange={(e) => handleClientChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Delivery Address</label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Carrier / Logistics Provider</label>
                  <input
                    type="text"
                    value={carrierName}
                    onChange={(e) => setCarrierName(e.target.value)}
                    placeholder="e.g. DHL, FedEx, Company Fleet"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Waybill / Tracking Number</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Dispatch Date</label>
                  <input
                    type="date"
                    value={dispatchDate}
                    onChange={(e) => setDispatchDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Expected Delivery Date</label>
                  <input
                    type="date"
                    value={expectedDeliveryDate}
                    onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Related Invoice # (Optional)</label>
                  <select
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">None / Standalone Dispatch</option>
                    {invoices.map(inv => (
                      <option key={inv.id} value={inv.invoiceNumber}>{inv.invoiceNumber} - {inv.clientName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Related Sale Order # (Optional)</label>
                  <select
                    value={saleOrderNumber}
                    onChange={(e) => setSaleOrderNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">None</option>
                    {saleOrders.map(so => (
                      <option key={so.id} value={so.orderNumber}>{so.orderNumber} - {so.clientName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Packages Count</label>
                  <input
                    type="number"
                    min="1"
                    value={packagesCount}
                    onChange={(e) => setPackagesCount(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Total Gross Weight (KG)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={totalWeightKg}
                    onChange={(e) => setTotalWeightKg(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Driver & Vehicle Details */}
              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Driver / Courier Name</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Driver Phone #</label>
                  <input
                    type="text"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    placeholder="+1 555 000 0000"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Vehicle / Van Reg #</label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="e.g. VAN-8902"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Line Items for Delivery */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-slate-200">Dispatched Goods & Quantities</h4>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Dispatched Item
                  </button>
                </div>

                <div className="space-y-2.5">
                  {items.map((item, idx) => (
                    <div key={item.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl grid grid-cols-12 gap-2.5 items-center">
                      <div className="col-span-5">
                        <input
                          type="text"
                          placeholder="Item description / SKU"
                          value={item.description}
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Delivered Qty"
                          value={item.deliveredQty}
                          min="1"
                          onChange={(e) => handleItemChange(idx, 'deliveredQty', parseInt(e.target.value) || 1)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Unit (e.g. Box, Pcs)"
                          value={item.unit}
                          onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Packaging notes"
                          value={item.packageDetails || ''}
                          onChange={(e) => handleItemChange(idx, 'packageDetails', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 hover:bg-rose-500/20 text-rose-400 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Handling Instructions / Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Fragile items, keep dry, temperature monitored..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-indigo-600/20"
                >
                  Save & Issue Delivery Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View / Print Delivery Note Modal */}
      {selectedNoteForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl flex flex-col shadow-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-semibold text-slate-100">
                  Goods Delivery Note — {selectedNoteForView.noteNumber}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Voucher
                </button>
                <button
                  onClick={() => setSelectedNoteForView(null)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Document Slip */}
            <div className="p-8 bg-slate-950 text-slate-200 space-y-6 text-sm">
              <div className="flex justify-between items-start border-b border-slate-800 pb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-100 tracking-tight">DELIVERY DISPATCH NOTE</h2>
                  <p className="text-xs text-slate-400 mt-1">Official proof of shipment and receipt of goods</p>
                  <div className="mt-3 text-xs text-slate-400 space-y-0.5">
                    <p><strong className="text-slate-300">Carrier:</strong> {selectedNoteForView.carrierName}</p>
                    <p><strong className="text-slate-300">Tracking #:</strong> <span className="font-mono text-indigo-400">{selectedNoteForView.trackingNumber}</span></p>
                    {selectedNoteForView.driverName && (
                      <p><strong className="text-slate-300">Driver / Vehicle:</strong> {selectedNoteForView.driverName} ({selectedNoteForView.vehicleNumber || 'Standard Fleet'})</p>
                    )}
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="text-sm font-mono font-bold text-indigo-300">{selectedNoteForView.noteNumber}</div>
                  <div className="text-xs text-slate-400">Date: {selectedNoteForView.dispatchDate}</div>
                  {selectedNoteForView.invoiceNumber && (
                    <div className="text-xs text-slate-400">Ref Inv: {selectedNoteForView.invoiceNumber}</div>
                  )}
                  <div className="pt-2">{getStatusBadge(selectedNoteForView.status)}</div>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-2 gap-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ship To / Consignee</span>
                  <div className="mt-2 text-sm font-medium text-slate-100">{selectedNoteForView.clientName}</div>
                  <div className="text-xs text-slate-400 mt-1 whitespace-pre-line">{selectedNoteForView.deliveryAddress}</div>
                  {selectedNoteForView.clientPhone && (
                    <div className="text-xs text-slate-400 mt-1">Tel: {selectedNoteForView.clientPhone}</div>
                  )}
                </div>

                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Consignment Summary</span>
                  <div className="mt-2 text-xs space-y-1 text-slate-300">
                    <p>Total Packages: <strong className="text-slate-100">{selectedNoteForView.packagesCount} carton(s)</strong></p>
                    <p>Gross Weight: <strong className="text-slate-100">{selectedNoteForView.totalWeightKg || 0} kg</strong></p>
                    <p>Expected Arrival: <strong className="text-slate-100">{selectedNoteForView.expectedDeliveryDate}</strong></p>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 text-slate-400 uppercase font-medium">
                    <tr>
                      <th className="py-2.5 px-4">Item Description</th>
                      <th className="py-2.5 px-4 text-center">Ordered</th>
                      <th className="py-2.5 px-4 text-center">Delivered</th>
                      <th className="py-2.5 px-4">Packaging & Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {selectedNoteForView.items.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-900/40">
                        <td className="py-3 px-4 font-medium text-slate-200">{item.description}</td>
                        <td className="py-3 px-4 text-center text-slate-400">{item.orderedQty} {item.unit}</td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-400">{item.deliveredQty} {item.unit}</td>
                        <td className="py-3 px-4 text-slate-400">{item.packageDetails || 'Standard Carton'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Notes */}
              {selectedNoteForView.notes && (
                <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg text-xs text-slate-400">
                  <strong className="text-slate-300">Handling Notes:</strong> {selectedNoteForView.notes}
                </div>
              )}

              {/* Acknowledgement & Signatures */}
              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-800 text-xs">
                <div className="border border-dashed border-slate-800 rounded-xl p-4 text-center space-y-4">
                  <span className="text-slate-400 block font-medium">Dispatched By (Logistics / Warehouse)</span>
                  <div className="h-12 flex items-center justify-center font-serif text-slate-300 italic text-base">
                    Authorized Signatory
                  </div>
                  <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-1">
                    Date & Stamp: {selectedNoteForView.dispatchDate}
                  </div>
                </div>

                <div className="border border-dashed border-slate-800 rounded-xl p-4 text-center space-y-4">
                  <span className="text-slate-400 block font-medium">Received By (Customer Consignee)</span>
                  <div className="h-12 flex items-center justify-center font-serif text-emerald-400 italic text-base">
                    {selectedNoteForView.receiverSignature || 'Pending Receiver Sign-off'}
                  </div>
                  <div className="text-[10px] text-slate-500 border-t border-slate-800 pt-1">
                    Name: {selectedNoteForView.receivedBy || '_____________________'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
