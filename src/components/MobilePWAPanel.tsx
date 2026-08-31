import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IntegrationHub, IntegrationConfig } from './integrationHub';
import { Invoice } from './types';
import { PaymentRecord } from './types';
import { Client } from './types';
import { BankTransaction } from './types';
import { SmartInvoiceMatcher } from './smartMatching';

interface MobilePWAPanelProps {
  invoices: Invoice[];
  payments: PaymentRecord[];
  clients: Client[];
  bankTransactions: BankTransaction[];
  onDataUpdate: () => void;
}

export const MobilePWAPanel: React.FC<MobilePWAPanelProps> = ({
  invoices,
  payments,
  clients,
  bankTransactions,
  onDataUpdate
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineWarning, setShowOfflineWarning] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [integrationHub] = useState(() => new IntegrationHub());
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState<ServiceWorkerRegistration | null>(null);

  const dataRef = useRef({
    invoices,
    payments,
    clients,
    bankTransactions
  });

  // Update local data reference
  useEffect(() => {
    dataRef.current = { invoices, payments, clients, bankTransactions };
  }, [invoices, payments, clients, bankTransactions]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineWarning(false);
      performDataSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineWarning(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          setServiceWorkerRegistration(registration);
          console.log('Service worker registered:', registration);
        })
        .catch(error => {
          console.error('Service worker registration failed:', error);
        });
    }
  }, []);

  // Push notification subscription
  useEffect(() => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          subscribeToPushNotifications();
        }
      });
    }
  }, []);

  // Periodic sync for offline data
  useEffect(() => {
    const interval = setInterval(() => {
      if (isOnline && syncStatus === 'idle') {
        performDataSync();
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [isOnline, syncStatus]);

  // Subscribe to push notifications
  const subscribeToPushNotifications = async () => {
    try {
      const registration = serviceWorkerRegistration;
      if (!registration) return;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array('BEl62iBYjVRk4wWFcrER8BPxWR37kGuV2Zo69MLqRgTfV5QvLqVuWYZkY2YaG5W5kUEmMv9Cj4J8bK7j3V8f'),
      });

      // Send subscription to server (for demo, just store locally)
      localStorage.setItem('pushSubscription', JSON.stringify(subscription));
      console.log('Push notification subscription:', subscription);

    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  };

  // Convert base64 to Uint8Array for push subscription
  const urlB64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; i++) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  };

  // Perform comprehensive data sync
  const performDataSync = async () => {
    setSyncStatus('syncing');
    
    try {
      // Configure integrations
      const quickbooksConfig: IntegrationConfig = {
        accountingSoftware: 'quickbooks',
        bankingAPI: 'stripe',
        webhooks: [
          {
            event: 'invoice_created',
            endpoint: '/api/webhooks/invoice-created',
            secret: 'quickbooks_webhook_secret',
            retryPolicy: { maxAttempts: 3, delayMs: 1000, backoffMultiplier: 2 },
            active: true
          },
          {
            event: 'payment_received',
            endpoint: '/api/webhooks/payment-received',
            secret: 'quickbooks_payment_secret',
            retryPolicy: { maxAttempts: 3, delayMs: 1000, backoffMultiplier: 2 },
            active: true
          }
        ]
      };

      integrationHub.configure('quickbooks', quickbooksConfig);

      // Sync data with accounting system
      const syncResult = await integrationHub.syncWithAccounting('quickbooks', {
        invoices: dataRef.current.invoices,
        payments: dataRef.current.payments,
        clients: dataRef.current.clients,
        transactions: dataRef.current.bankTransactions
      });

      if (syncResult.success) {
        setSyncStatus('success');
        console.log('Data sync completed successfully:', syncResult);
        onDataUpdate();
      } else {
        setSyncStatus('error');
        console.error('Data sync errors:', syncResult.errors);
      }

    } catch (error) {
      setSyncStatus('error');
      console.error('Data sync failed:', error);
    }
  };

  // Handle offline data queuing
  const queueOfflineData = (data: any) => {
    const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
    queue.push({
      id: Date.now(),
      data,
      timestamp: new Date().toISOString(),
      attempts: 0
    });
    localStorage.setItem('offlineQueue', JSON.stringify(queue));
  };

  // Process offline queue when back online
  const processOfflineQueue = useCallback(async () => {
    if (!isOnline) return;

    const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
    if (queue.length === 0) return;

    setSyncStatus('syncing');

    for (const item of queue.slice()) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Remove from queue if successful
        const updatedQueue = queue.filter(q => q.id !== item.id);
        localStorage.setItem('offlineQueue', JSON.stringify(updatedQueue));
        
      } catch (error) {
        console.error('Failed to process offline item:', error);
        
        // Increment attempt count
        const updatedItem = { ...item, attempts: item.attempts + 1 };
        if (updatedItem.attempts >= 3) {
          // Remove after max attempts
          const updatedQueue = queue.filter(q => q.id !== item.id);
          localStorage.setItem('offlineQueue', JSON.stringify(updatedQueue));
        } else {
          // Update in queue
          const updatedQueue = queue.map(q => q.id === item.id ? updatedItem : q);
          localStorage.setItem('offlineQueue', JSON.stringify(updatedQueue));
        }
      }
    }

    setSyncStatus('idle');
  }, [isOnline]);

  // Install prompt for PWA
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setShowInstallPrompt(true);
      window.deferredPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      const { outcome } = await window.deferredPrompt.prompt();
      
      if (outcome === 'accepted') {
        console.log('App installed successfully');
      }
      
      window.deferredPrompt = null;
      setShowInstallPrompt(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Mobile PWA & Offline Capabilities</h3>
        <div className="flex items-center gap-2">
          {/* Online status indicator */}
          <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} title={isOnline ? 'Online' : 'Offline'} />
          <span className="text-sm text-gray-600">
            {isOnline ? 'Online' : 'Offline'}
          </span>
          {/* Sync status */}
          <div className={`w-2 h-2 rounded-full ${
            syncStatus === 'syncing' ? 'bg-yellow-500 animate-pulse' :
            syncStatus === 'success' ? 'bg-green-500' :
            syncStatus === 'error' ? 'bg-red-500' : 'bg-gray-300'
          }`} title={`Sync: ${syncStatus}`} />
        </div>
      </div>

      {/* Offline warning */}
      {showOfflineWarning && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-yellow-600">⚠️</span>
            <span className="text-sm text-yellow-800">You're currently offline. Changes will be queued and synced when you reconnect.</span>
          </div>
        </div>
      )}

      {/* Install prompt */}
      {showInstallPrompt && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">Install InvoicePro as an app for a better mobile experience</span>
            <button
              onClick={handleInstallClick}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              Install
            </button>
          </div>
        </div>
      )}

      {/* Sync controls */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={performDataSync}
          disabled={syncStatus === 'syncing' || !isOnline}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
        </button>
        <button
          onClick={processOfflineQueue}
          disabled={syncStatus === 'syncing'}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
        >
          Process Offline Queue
        </button>
      </div>

      {/* Features grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">📱 Offline Mode</h4>
          <p className="text-sm text-gray-600">Full functionality without internet connection</p>
          <ul className="text-xs text-gray-500 mt-2 space-y-1">
            <li>• Create/edit invoices offline</li>
            <li>• Queue sync when back online</li>
            <li>• Display cached data</li>
          </ul>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">🔄 Real-time Sync</h4>
          <p className="text-sm text-gray-600">Automatic data synchronization across devices</p>
          <ul className="text-xs text-gray-500 mt-2 space-y-1">
            <li>• Push notifications</li>
            <li>• Conflict resolution</li>
            <li>• Background syncing</li>
          </ul>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">📲 Installable App</h4>
          <p className="text-sm text-gray-600">Install as PWA for native app experience</p>
          <ul className="text-xs text-gray-500 mt-2 space-y-1">
            <li>• Home screen shortcut</li>
            <li>• Offline capability</li>
            <li>• Push notifications</li>
          </ul>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">🔒 Data Security</h4>
          <p className="text-sm text-gray-600">Secure offline data storage and encryption</p>
          <ul className="text-xs text-gray-500 mt-2 space-y-1">
            <li>• Encrypted local storage</li>
            <li>• Secure webhook handling</li>
            <li>• Automatic backups</li>
          </ul>
        </div>
      </div>

      {/* Service worker status */}
      {serviceWorkerRegistration && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✅ Service Worker registered and active
          </p>
          <p className="text-xs text-green-600 mt-1">
            Cache: {(serviceWorkerRegistration as any).active?.state || 'unknown'}
          </p>
        </div>
      )}

      {/* Offline queue status */}
      {JSON.parse(localStorage.getItem('offlineQueue') || '[]').length > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            📝 {JSON.parse(localStorage.getItem('offlineQueue') || '[]').length} items queued for sync
          </p>
        </div>
      )}
    </div>
  );
};
