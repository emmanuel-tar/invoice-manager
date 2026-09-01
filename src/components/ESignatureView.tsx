import React, { useState, useRef } from 'react';
import {
  PenTool,
  FileText,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Download,
  Eye,
  Plus,
  User,
  Mail,
  Calendar,
  Shield,
  Signature,
  Upload,
  Trash2,
  RefreshCw,
  Filter,
  Search,
} from 'lucide-react';
import { SignatureDocument, Invoice, Estimate } from '../types';

interface ESignatureViewProps {
  invoices: Invoice[];
  estimates: Estimate[];
  onSendForSignature: (docId: string, docType: 'invoice' | 'estimate', signerEmail: string, signerName: string) => void;
  onRevokeSignature: (docId: string) => void;
}

const mockSignatureDocuments: SignatureDocument[] = [
  {
    id: 'sig_1',
    documentType: 'invoice',
    documentId: 'inv_1',
    signatureData: 'data:image/png;base64,signature1',
    signedAt: '2026-08-30T14:30:00Z',
    signerName: 'John Adeyemi',
    signerEmail: 'john@abccorp.com',
    status: 'signed',
    expiresAt: '2026-09-15T23:59:59Z',
  },
  {
    id: 'sig_2',
    documentType: 'invoice',
    documentId: 'inv_2',
    status: 'pending',
    expiresAt: '2026-09-10T23:59:59Z',
  },
  {
    id: 'sig_3',
    documentType: 'estimate',
    documentId: 'est_1',
    signatureData: 'data:image/png;base64,signature2',
    signedAt: '2026-08-28T10:15:00Z',
    signerName: 'Sarah Okonkwo',
    signerEmail: 'sarah@xyzltd.com',
    status: 'signed',
    expiresAt: '2026-09-05T23:59:59Z',
  },
  {
    id: 'sig_4',
    documentType: 'invoice',
    documentId: 'inv_3',
    status: 'expired',
    expiresAt: '2026-08-25T23:59:59Z',
  },
  {
    id: 'sig_5',
    documentType: 'invoice',
    documentId: 'inv_4',
    status: 'pending',
    expiresAt: '2026-09-20T23:59:59Z',
  },
];

export const ESignatureView: React.FC<ESignatureViewProps> = ({
  invoices,
  estimates,
  onSendForSignature,
  onRevokeSignature,
}) => {
  const [activeTab, setActiveTab] = useState<'documents' | 'send' | 'templates'>('documents');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'signed' | 'expired'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<{ id: string; type: 'invoice' | 'estimate' } | null>(null);
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const filteredDocuments = mockSignatureDocuments.filter((doc) => {
    if (filterStatus !== 'all' && doc.status !== filterStatus) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const relatedDoc = doc.documentType === 'invoice'
        ? invoices.find((inv) => inv.id === doc.documentId)
        : estimates.find((est) => est.id === doc.documentId);
      if (
        !doc.signerName?.toLowerCase().includes(searchLower) &&
        !doc.signerEmail?.toLowerCase().includes(searchLower) &&
        !relatedDoc?.clientName.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    return true;
  });

  const getRelatedDocument = (doc: SignatureDocument) => {
    if (doc.documentType === 'invoice') {
      return invoices.find((inv) => inv.id === doc.documentId);
    }
    return estimates.find((est) => est.id === doc.documentId);
  };

  const getDocumentNumber = (doc: SignatureDocument) => {
    const relatedDoc = getRelatedDocument(doc);
    if (!relatedDoc) return doc.documentId;
    if (doc.documentType === 'invoice') {
      return (relatedDoc as Invoice).invoiceNumber;
    }
    return (relatedDoc as Estimate).estimateNumber;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSendForSignature = () => {
    if (selectedDoc && signerName && signerEmail) {
      onSendForSignature(selectedDoc.id, selectedDoc.type, signerEmail, signerName);
      setShowSendModal(false);
      setSignerName('');
      setSignerEmail('');
      setSelectedDoc(null);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const pendingCount = mockSignatureDocuments.filter((d) => d.status === 'pending').length;
  const signedCount = mockSignatureDocuments.filter((d) => d.status === 'signed').length;
  const expiredCount = mockSignatureDocuments.filter((d) => d.status === 'expired').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">E-Signatures & Approvals</h1>
          <p className="text-sm text-slate-400 mt-1">
            Send documents for digital signature and track approval status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSignaturePad(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-700"
          >
            <PenTool className="w-4 h-4" />
            Sign Document
          </button>
          <button
            onClick={() => setShowSendModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Send className="w-4 h-4" />
            Request Signature
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-blue-500/20">
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-xs text-slate-400">Total Documents</span>
          </div>
          <p className="text-2xl font-bold text-white">{mockSignatureDocuments.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20">
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-xs text-slate-400">Pending</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">{pendingCount}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-xs text-slate-400">Signed</span>
          </div>
          <p className="text-2xl font-bold text-emerald-400">{signedCount}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-red-500/20">
              <XCircle className="w-4 h-4 text-red-400" />
            </div>
            <span className="text-xs text-slate-400">Expired</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{expiredCount}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-lg w-fit">
        {(['documents', 'send', 'templates'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab === 'documents' && 'All Documents'}
            {tab === 'send' && 'Send New'}
            {tab === 'templates' && 'Templates'}
          </button>
        ))}
      </div>

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="signed">Signed</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Documents List */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="divide-y divide-slate-700/50">
              {filteredDocuments.length === 0 ? (
                <div className="p-8 text-center">
                  <PenTool className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No documents found</p>
                  <p className="text-xs text-slate-500 mt-1">Try adjusting your filters</p>
                </div>
              ) : (
                filteredDocuments.map((doc) => {
                  const relatedDoc = getRelatedDocument(doc);
                  return (
                    <div
                      key={doc.id}
                      className="px-4 py-4 flex items-center justify-between hover:bg-slate-700/20 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          doc.status === 'signed'
                            ? 'bg-emerald-500/20'
                            : doc.status === 'pending'
                            ? 'bg-amber-500/20'
                            : 'bg-red-500/20'
                        }`}>
                          {doc.status === 'signed' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : doc.status === 'pending' ? (
                            <Clock className="w-5 h-5 text-amber-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white">
                            {doc.documentType === 'invoice' ? 'Invoice' : 'Estimate'} - {getDocumentNumber(doc)}
                          </p>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              doc.status === 'signed'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : doc.status === 'pending'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {doc.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                              <User className="w-3 h-3" />
                              {relatedDoc?.clientName}
                            </span>
                            {doc.signerName && (
                              <span className="flex items-center gap-1 text-xs text-slate-400">
                                <Signature className="w-3 h-3" />
                                Signed by {doc.signerName}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                              <Calendar className="w-3 h-3" />
                              {doc.status === 'signed' ? formatDate(doc.signedAt!) : `Expires ${formatDate(doc.expiresAt)}`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {relatedDoc && (
                          <span className="text-sm font-bold text-white">
                            {formatCurrency(relatedDoc.total)}
                          </span>
                        )}
                        <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                        {doc.status === 'pending' && (
                          <button
                            onClick={() => onRevokeSignature(doc.id)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}

      {/* Send New Tab */}
      {activeTab === 'send' && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Send Document for Signature</h3>
          <p className="text-sm text-slate-400 mb-6">
            Select an invoice or estimate to send for digital signature.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...invoices.slice(0, 4), ...estimates.slice(0, 2)].map((doc) => (
              <button
                key={doc.id}
                onClick={() => {
                  setSelectedDoc({
                    id: doc.id,
                    type: 'invoiceNumber' in doc ? 'invoice' : 'estimate',
                  });
                  setShowSendModal(true);
                }}
                className="p-4 bg-slate-900 border border-slate-700 rounded-lg text-left hover:border-blue-500/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">
                    {'invoiceNumber' in doc ? 'Invoice' : 'Estimate'}
                  </span>
                  <span className="text-sm font-bold text-white">{formatCurrency(doc.total)}</span>
                </div>
                <p className="text-sm font-medium text-white">
                  {'invoiceNumber' in doc ? doc.invoiceNumber : doc.estimateNumber}
                </p>
                <p className="text-xs text-slate-400 mt-1">{doc.clientName}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Signature Templates</h3>
          <p className="text-sm text-slate-400 mb-6">
            Manage your document templates with pre-configured signature fields.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Standard Invoice', 'Service Agreement', 'NDA Template'].map((template, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-900 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-sm font-medium text-white">{template}</p>
                </div>
                <p className="text-xs text-slate-400 mb-3">
                  Last modified: {formatDate(new Date(Date.now() - idx * 86400000).toISOString())}
                </p>
                <button className="w-full px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors">
                  Use Template
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Send for Signature Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-white mb-2">Request Signature</h3>
            <p className="text-sm text-slate-400 mb-4">
              Enter the signer's details to send the document for signature.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Signer Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Enter signer's name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Signer Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={signerEmail}
                    onChange={(e) => setSignerEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Enter signer's email"
                  />
                </div>
              </div>
              <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                <p className="text-xs text-slate-400">Document</p>
                <p className="text-sm font-medium text-white">
                  {selectedDoc?.type === 'invoice' ? 'Invoice' : 'Estimate'} - {selectedDoc?.id}
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowSendModal(false);
                  setSignerName('');
                  setSignerEmail('');
                }}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendForSignature}
                disabled={!signerName || !signerEmail}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Send for Signature
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signature Pad Modal */}
      {showSignaturePad && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold text-white mb-2">Sign Document</h3>
            <p className="text-sm text-slate-400 mb-4">
              Draw your signature in the box below.
            </p>
            <div className="border-2 border-dashed border-slate-700 rounded-lg overflow-hidden mb-4">
              <canvas
                ref={canvasRef}
                width={440}
                height={200}
                className="w-full bg-slate-800 cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>
            <p className="text-xs text-slate-500 text-center mb-4">
              By signing above, you agree to the terms and conditions.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSignaturePad(false);
                  clearSignature();
                }}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={clearSignature}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => {
                  setShowSignaturePad(false);
                  clearSignature();
                }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Apply Signature
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
