import React, { useState, useMemo } from 'react';
import { 
  Boxes, 
  Plus, 
  Search, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  QrCode, 
  Warehouse, 
  X, 
  Calendar, 
  Package, 
  Tag, 
  Filter,
  FileCheck,
  Building2,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { BatchItem, BatchStatus, InventoryItem, CompanyProfile } from '../types';

interface BatchTrackingViewProps {
  batches: BatchItem[];
  inventoryItems: InventoryItem[];
  companyProfile: CompanyProfile;
  onAddBatch: (batch: Omit<BatchItem, 'id' | 'createdAt'>) => void;
  onUpdateBatchStatus: (id: string, status: BatchStatus, qty?: number) => void;
  onDeleteBatch?: (id: string) => void;
}

export const BatchTrackingView: React.FC<BatchTrackingViewProps> = ({
  batches,
  inventoryItems,
  companyProfile,
  onAddBatch,
  onUpdateBatchStatus,
  onDeleteBatch,
}) => {
  const [subTab, setSubTab] = useState<'all' | 'compliance' | 'serials'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [warehouseFilter, setWarehouseFilter] = useState<string>('all');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [quantity, setQuantity] = useState<number>(20);
  const [mfgDate, setMfgDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState<string>(
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [warehouseLocation, setWarehouseLocation] = useState('Warehouse A - Bay 4 (Lagos Main)');
  const [supplierName, setSupplierName] = useState('');
  const [complianceCertNumber, setComplianceCertNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Auto-fill SKU when item selected
  const handleItemSelect = (itemId: string) => {
    setSelectedItemId(itemId);
    const item = inventoryItems.find((i) => i.id === itemId);
    if (item && !batchNumber) {
      const year = new Date().getFullYear();
      const code = item.sku.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4);
      setBatchNumber(`LOT-${year}-${code}-${Math.floor(100 + Math.random() * 900)}`);
      setSerialNumber(`SN-${code}-${Math.floor(10000 + Math.random() * 90000)}`);
    }
  };

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || quantity <= 0 || !batchNumber) return;

    const matchedItem = inventoryItems.find((i) => i.id === selectedItemId);
    if (!matchedItem) return;

    onAddBatch({
      batchNumber,
      serialNumber: serialNumber || undefined,
      itemId: matchedItem.id,
      itemName: matchedItem.name,
      sku: matchedItem.sku,
      quantity,
      initialQuantity: quantity,
      manufacturingDate: mfgDate,
      expiryDate,
      warehouseLocation: warehouseLocation || 'Main Hub',
      supplierName: supplierName || 'Direct Manufacturer',
      status: 'active',
      complianceCertNumber: complianceCertNumber || undefined,
      notes,
    });

    setIsAddModalOpen(false);
    setSelectedItemId('');
    setBatchNumber('');
    setSerialNumber('');
    setNotes('');
  };

  // Filtered Batches
  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      const matchSearch =
        b.batchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.serialNumber && b.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.complianceCertNumber && b.complianceCertNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      const matchWarehouse = warehouseFilter === 'all' || b.warehouseLocation.toLowerCase().includes(warehouseFilter.toLowerCase());

      return matchSearch && matchStatus && matchWarehouse;
    });
  }, [batches, searchQuery, statusFilter, warehouseFilter]);

  // Compliance & Expiry breakdown
  const complianceStats = useMemo(() => {
    const today = new Date();
    const thirtyDaysAhead = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const expiringSoon = batches.filter((b) => {
      const exp = new Date(b.expiryDate);
      return exp > today && exp <= thirtyDaysAhead && b.status !== 'depleted';
    });

    const expired = batches.filter((b) => {
      const exp = new Date(b.expiryDate);
      return exp <= today && b.status !== 'depleted';
    });

    const quarantine = batches.filter((b) => b.status === 'quarantine');
    const certified = batches.filter((b) => b.complianceCertNumber && b.status === 'active');

    return { expiringSoon, expired, quarantine, certified };
  }, [batches]);

  const getStatusBadge = (status: BatchStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Active Lot
          </span>
        );
      case 'low_stock':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            <TrendingDown className="w-3 h-3" /> Low Quantity
          </span>
        );
      case 'quarantine':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
            <AlertTriangle className="w-3 h-3" /> Quarantine QA
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
            <Clock className="w-3 h-3" /> Expired
          </span>
        );
      case 'depleted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
            Depleted
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-blue-600" />
            <span>Batch & Serial Number Tracking</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Seamlessly manage batch and serial number tracking in one place. Ensures your inventory stays compliant, traceable, and accurate at every stage.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Batch / Lot</span>
          </button>
        </div>
      </div>

      {/* Compliance & Quality Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Lots In Stock</div>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
            {batches.filter((b) => b.status === 'active' || b.status === 'low_stock').length} Batches
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Traceable SKU lineage
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Compliance Certified</div>
          <div className="text-2xl font-black text-blue-600 mt-1 font-mono">
            {complianceStats.certified.length} Lots
          </div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1">
            ISO / CE / NAFDAC Verified
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">QA Quarantine</div>
          <div className="text-2xl font-black text-purple-600 mt-1 font-mono">
            {complianceStats.quarantine.length} Lots
          </div>
          <div className="text-[11px] text-purple-600 font-semibold mt-1">
            Under lab evaluation
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Expiry Action Required</div>
          <div className="text-2xl font-black text-rose-600 mt-1 font-mono">
            {complianceStats.expiringSoon.length + complianceStats.expired.length} Lots
          </div>
          <div className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Expiry warning check
          </div>
        </div>
      </div>

      {/* Subtab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setSubTab('all')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            subTab === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Lots & Batches ({batches.length})
        </button>

        <button
          onClick={() => setSubTab('compliance')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            subTab === 'compliance'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Compliance & QA Expiry ({complianceStats.expiringSoon.length + complianceStats.quarantine.length})
        </button>

        <button
          onClick={() => setSubTab('serials')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            subTab === 'serials'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Serial Number Lookup
        </button>
      </div>

      {/* Main View: All Lots */}
      {subTab === 'all' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search batch #, serial, item name, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
              >
                <option value="all">All Lot Statuses</option>
                <option value="active">Active</option>
                <option value="low_stock">Low Stock</option>
                <option value="quarantine">Quarantine</option>
                <option value="expired">Expired</option>
                <option value="depleted">Depleted</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Batch / Lot #</th>
                    <th className="py-3.5 px-4">Item & SKU</th>
                    <th className="py-3.5 px-4">Serial Number</th>
                    <th className="py-3.5 px-4 text-center">Remaining / Initial</th>
                    <th className="py-3.5 px-4">Mfg / Expiry</th>
                    <th className="py-3.5 px-4">Warehouse Bay</th>
                    <th className="py-3.5 px-4">Supplier & Cert</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredBatches.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        No batch tracking records found matching search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredBatches.map((b) => {
                      const fillPct = Math.round((b.quantity / (b.initialQuantity || 1)) * 100);
                      return (
                        <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                            {b.batchNumber}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">{b.itemName}</div>
                            <div className="text-[11px] font-mono text-slate-400">SKU: {b.sku}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-700">
                            {b.serialNumber ? (
                              <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-bold">
                                {b.serialNumber}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Lot Tracked</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="font-mono font-bold text-slate-900">
                              {b.quantity} <span className="text-slate-400 font-normal">/ {b.initialQuantity}</span>
                            </div>
                            <div className="w-20 bg-slate-100 h-1.5 rounded-full mx-auto mt-1 overflow-hidden">
                              <div 
                                className={`h-full ${b.quantity === 0 ? 'bg-slate-300' : b.quantity <= 10 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(fillPct, 100)}%` }}
                              />
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-[11px]">
                            <div className="text-slate-500">Mfg: {b.manufacturingDate}</div>
                            <div className="font-semibold text-slate-800">Exp: {b.expiryDate}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 text-[11px] max-w-[150px] truncate">
                            {b.warehouseLocation}
                          </td>
                          <td className="py-3.5 px-4 text-[11px]">
                            <div className="font-semibold text-slate-800 truncate max-w-[130px]">{b.supplierName}</div>
                            {b.complianceCertNumber && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-blue-600">
                                <FileCheck className="w-3 h-3" /> {b.complianceCertNumber}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {getStatusBadge(b.status)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <select
                              value={b.status}
                              onChange={(e) => onUpdateBatchStatus(b.id, e.target.value as BatchStatus)}
                              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] font-medium text-slate-700"
                            >
                              <option value="active">Active</option>
                              <option value="low_stock">Low Stock</option>
                              <option value="quarantine">Quarantine</option>
                              <option value="expired">Expired</option>
                              <option value="depleted">Depleted</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Compliance & QA Expiry */}
      {subTab === 'compliance' && (
        <div className="space-y-6">
          {/* Quarantine Alert */}
          <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-5">
            <h3 className="font-bold text-purple-900 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-purple-600" />
              <span>Quarantine & Quality Hold Area ({complianceStats.quarantine.length} Lots)</span>
            </h3>
            <p className="text-xs text-purple-700 mt-1">
              These items are isolated for inspection, testing, or certification before being allowed for invoice dispatch.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {complianceStats.quarantine.map((q) => (
                <div key={q.id} className="p-3 bg-white rounded-lg border border-purple-200 text-xs flex justify-between items-center">
                  <div>
                    <div className="font-bold text-slate-900">{q.itemName}</div>
                    <div className="font-mono text-purple-700 font-bold">{q.batchNumber} • Qty: {q.quantity}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{q.notes || 'Awaiting lab validation'}</div>
                  </div>
                  <button
                    onClick={() => onUpdateBatchStatus(q.id, 'active')}
                    className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700"
                  >
                    Release Lot
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Expiry Tracking */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Upcoming Expiry Monitoring & Alerts</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Tracks lots nearing expiration within 30-180 days to prevent stock write-offs.
            </p>

            <div className="divide-y divide-slate-100 mt-4">
              {batches.map((b) => (
                <div key={b.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-mono font-bold text-slate-700 text-[11px]">
                      LOT
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{b.itemName} ({b.batchNumber})</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Expires: {b.expiryDate} • Location: {b.warehouseLocation}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-800">{b.quantity} in stock</span>
                    {getStatusBadge(b.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: Serial Number Lookup */}
      {subTab === 'serials' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <QrCode className="w-4 h-4 text-blue-600" />
                <span>Instant Serial Number Traceability Search</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Scan or type any unique serial number to retrieve its entire audit trail and manufacturing pedigree.
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Scan or enter Serial Number (e.g. SN-SVR-99210-A)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {filteredBatches.map((b) => (
                <div key={b.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-mono font-bold text-[11px]">
                      {b.serialNumber || 'SN-UNASSIGNED'}
                    </span>
                    {getStatusBadge(b.status)}
                  </div>
                  <div className="font-bold text-slate-900 text-sm">{b.itemName}</div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-2 border-t border-slate-200">
                    <div>Batch: <span className="font-mono font-semibold text-slate-800">{b.batchNumber}</span></div>
                    <div>SKU: <span className="font-mono font-semibold text-slate-800">{b.sku}</span></div>
                    <div>Mfg Date: <span className="font-semibold text-slate-800">{b.manufacturingDate}</span></div>
                    <div>Expiry: <span className="font-semibold text-slate-800">{b.expiryDate}</span></div>
                    <div>Cert #: <span className="font-mono font-semibold text-blue-600">{b.complianceCertNumber || 'N/A'}</span></div>
                    <div>Warehouse: <span className="font-semibold text-slate-800">{b.warehouseLocation}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add New Batch Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Register New Batch / Lot</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Catalog Item *</label>
                <select
                  required
                  value={selectedItemId}
                  onChange={(e) => handleItemSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="">-- Select Inventory Item --</option>
                  {inventoryItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} (SKU: {item.sku}) - Current Stock: {item.stock}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Batch / Lot Number *</label>
                  <input
                    type="text"
                    required
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="e.g. LOT-2026-04A"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Serial Number (Optional)</label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="e.g. SN-SVR-99210"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Batch Quantity (Units) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Warehouse Location</label>
                  <input
                    type="text"
                    value={warehouseLocation}
                    onChange={(e) => setWarehouseLocation(e.target.value)}
                    placeholder="Warehouse A - Bay 4"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Manufacturing Date</label>
                  <input
                    type="date"
                    required
                    value={mfgDate}
                    onChange={(e) => setMfgDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expiry / Best Before Date</label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Manufacturer / Supplier</label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="e.g. Cisco Systems Ltd"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Compliance Certificate #</label>
                  <input
                    type="text"
                    value={complianceCertNumber}
                    onChange={(e) => setComplianceCertNumber(e.target.value)}
                    placeholder="e.g. ISO-9001-CERT"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lot Audit Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Storage temperature, inspection notes, batch handling..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg font-semibold shadow-sm"
                >
                  Save & Register Lot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
