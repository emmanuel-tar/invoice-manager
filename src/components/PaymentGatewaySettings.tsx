import React, { useState } from 'react';
import { CreditCard, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { PaymentGateway, PaymentTransaction } from '../types';

interface Props {
  gateways: PaymentGateway[];
  transactions: PaymentTransaction[];
  onSave: (g: PaymentGateway) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export const PaymentGatewaySettings: React.FC<Props> = ({ gateways, transactions, onSave, onDelete, onToggle }) => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-bold text-slate-900">Payment Gateways</h2></div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg"><Plus className="w-4 h-4" /> Add</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gateways.map((g) => (
          <div key={g.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${g.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}><CreditCard className="w-5 h-5" /></div>
                <div><h3 className="font-semibold">{g.name}</h3><p className="text-xs text-slate-500 capitalize">{g.type}</p></div>
              </div>
              <button onClick={() => onToggle(g.id)} className={`w-10 h-5 rounded-full ${g.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}><div className={`w-4 h-4 bg-white rounded-full ${g.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} /></button>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => onDelete(g.id)} className="flex-1 px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-lg flex items-center justify-center gap-1"><Trash2 className="w-3 h-3" />Remove</button>
            </div>
          </div>
        ))}
      </div>
      {showForm && <GatewayForm onSave={(g) => { onSave(g); setShowForm(false); }} onClose={() => setShowForm(false)} />}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm"><div className="p-5 border-b border-slate-100"><h3 className="font-semibold">Recent Transactions</h3></div>
        <div className="divide-y divide-slate-100">{transactions.slice(0, 5).map((tx) => (
          <div key={tx.id} className="p-4 flex items-center justify-between"><div className="flex items-center gap-3">{tx.status === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}<p className="text-sm font-medium">{tx.reference}</p></div>
          <p className="text-sm font-semibold">{tx.currency} {tx.amount.toLocaleString()}</p></div>
        ))}</div>
      </div>
    </div>
  );
};

const GatewayForm: React.FC<{ onSave: (g: PaymentGateway) => void; onClose: () => void }> = ({ onSave, onClose }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<PaymentGateway['type']>('paystack');
  const [apiKey, setApiKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave({ id: crypto.randomUUID(), name, type, apiKey, secretKey, isActive: true, supportedCurrencies: ['NGN'], transactionFee: 1.5, createdAt: new Date().toISOString() }); };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
      <h3 className="text-lg font-bold mb-4">Add Gateway</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="block text-sm font-medium mb-1">Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required /></div>
        <div><label className="block text-sm font-medium mb-1">Provider</label><select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full px-3 py-2 border rounded-lg"><option value="paystack">Paystack</option><option value="flutterwave">Flutterwave</option><option value="stripe">Stripe</option></select></div>
        <div><label className="block text-sm font-medium mb-1">API Key</label><input type="text" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required /></div>
        <div><label className="block text-sm font-medium mb-1">Secret Key</label><input type="password" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} className="w-full px-3 py-2 border rounded-lg" required /></div>
        <div className="flex gap-3"><button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button><button type="submit" className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg">Save</button></div>
      </form>
    </div></div>
  );
};
