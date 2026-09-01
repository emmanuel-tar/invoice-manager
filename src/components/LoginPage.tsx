import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Building2,
  Shield,
  Users,
  AlertCircle,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { WorkflowUser, Role } from '../types';
import { ROLE_LABELS } from '../utils/rbac';

interface LoginPageProps {
  onLogin: (user: WorkflowUser) => void;
  team: WorkflowUser[];
}

const demoAccounts: { email: string; password: string; role: Role }[] = [
  { email: 'owner@invoicepro.test', password: 'owner123', role: 'owner' },
  { email: 'admin@invoicepro.test', password: 'admin123', role: 'admin' },
  { email: 'accountant@invoicepro.test', password: 'acct123', role: 'accountant' },
  { email: 'staff@invoicepro.test', password: 'staff123', role: 'staff' },
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, team }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const demoAccount = demoAccounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );

    if (demoAccount) {
      const user = team.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        onLogin(user);
      } else {
        setError('User account not found. Contact your administrator.');
      }
    } else {
      setError('Invalid email or password. Please try again.');
    }

    setIsLoading(false);
  };

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setShowDemoAccounts(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Layers className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">InvoicePro</h1>
              <p className="text-xs text-blue-200">ERP & Precision Ledger</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight">
              Streamline your<br />
              <span className="text-blue-200">business operations</span>
            </h2>
            <p className="text-blue-100 mt-4 text-lg">
              Manage invoices, track time, reconcile bank accounts, and collaborate with your team — all in one place.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Shield, label: 'Role-Based Access', desc: 'Secure team management' },
              { icon: Users, label: 'Team Collaboration', desc: 'Work together seamlessly' },
              { icon: Building2, label: 'Multi-Bank Support', desc: 'Reconcile transactions' },
              { icon: CheckCircle2, label: 'E-Signatures', desc: 'Digital approvals' },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10">
                <feature.icon className="w-6 h-6 text-blue-200 mb-2" />
                <p className="text-sm font-medium text-white">{feature.label}</p>
                <p className="text-xs text-blue-200">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-sm text-blue-200">
          © 2026 InvoicePro. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">InvoicePro</h1>
              <p className="text-xs text-slate-400">ERP & Precision Ledger</p>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white">Welcome back</h2>
              <p className="text-slate-400 mt-2">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="you@company.com"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <span className="text-sm text-slate-400">Remember me</span>
                </label>
                <button type="button" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-xl font-medium transition-colors"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Demo Accounts */}
            <div className="mt-6 pt-6 border-t border-slate-800">
              <button
                onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                className="w-full text-center text-sm text-slate-400 hover:text-white transition-colors"
              >
                {showDemoAccounts ? 'Hide' : 'Show'} demo accounts
              </button>

              {showDemoAccounts && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-slate-500 text-center mb-3">
                    Click any account to auto-fill credentials
                  </p>
                  {demoAccounts.map((account) => {
                    const user = team.find((u) => u.email === account.email);
                    return (
                      <button
                        key={account.email}
                        onClick={() => handleDemoLogin(account.email, account.password)}
                        className="w-full flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                            account.role === 'owner' ? 'bg-amber-500' :
                            account.role === 'admin' ? 'bg-indigo-500' :
                            account.role === 'accountant' ? 'bg-sky-500' : 'bg-slate-500'
                          }`}>
                            {user?.name.split(' ').map(n => n[0]).join('') || account.role[0].toUpperCase()}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-medium text-white">{user?.name || account.role}</p>
                            <p className="text-xs text-slate-400">{account.email}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          account.role === 'owner' ? 'bg-amber-500/20 text-amber-400' :
                          account.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400' :
                          account.role === 'accountant' ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-700 text-slate-400'
                        }`}>
                          {ROLE_LABELS[account.role]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-500 mt-6">
            Protected by enterprise-grade security. Your session is encrypted and secure.
          </p>
        </div>
      </div>
    </div>
  );
};
