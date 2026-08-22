import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Guard against third-party browser extension injection errors (e.g. MetaMask / Web3 wallet background communication failures)
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    const message = event.message || '';
    const filename = event.filename || '';
    if (
      message.includes('MetaMask') ||
      message.includes('ethereum') ||
      message.includes('chrome-extension') ||
      message.includes('moz-extension') ||
      filename.includes('chrome-extension') ||
      filename.includes('moz-extension') ||
      filename.includes('inpage.js')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = String(event.reason?.message || event.reason || '');
    if (
      reasonStr.includes('MetaMask') ||
      reasonStr.includes('ethereum') ||
      reasonStr.includes('chrome-extension') ||
      reasonStr.includes('moz-extension')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

