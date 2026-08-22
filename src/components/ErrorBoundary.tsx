import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    // Ignore injected web3 / MetaMask extension errors if any occur during lifecycle
    const msg = error?.message || '';
    if (msg.includes('MetaMask') || msg.includes('ethereum') || msg.includes('chrome-extension')) {
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const msg = error?.message || '';
    if (!msg.includes('MetaMask') && !msg.includes('ethereum')) {
      console.error('Uncaught error in InvoicePro:', error, errorInfo);
    }
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900">
          <div className="bg-white max-w-md w-full p-8 rounded-xl shadow-xl border border-slate-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto ring-8 ring-amber-50/50">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Something went wrong</h2>
            <p className="text-xs text-slate-500">
              An unexpected display error occurred. You can reload the interface to continue.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

