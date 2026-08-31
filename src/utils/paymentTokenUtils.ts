import { Invoice } from '../types';

/**
 * Generates a cryptographically random unique payment token for an invoice.
 * Example: pay_tok_1024_a8f9c2d1e4b8a3f5
 */
export function generatePaymentToken(invoiceNumber?: string, clientName?: string): string {
  const prefix = 'pay_tok_';
  const cleanNumber = (invoiceNumber || 'inv')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(-6);

  let randomHex = '';
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(10);
    window.crypto.getRandomValues(array);
    randomHex = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  } else {
    randomHex = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 8);
  }

  return `${prefix}${cleanNumber}_${randomHex}`;
}

/**
 * Builds the public-facing URL for a customer to view and pay an invoice using their unique payment token.
 */
export function getPublicInvoicePaymentUrl(paymentToken: string): string {
  if (typeof window === 'undefined') {
    return `https://invoicepro.app/pay?token=${encodeURIComponent(paymentToken)}`;
  }
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  return `${origin}${pathname}?pay_token=${encodeURIComponent(paymentToken)}`;
}

/**
 * Extracts a payment token from query parameters or hash in the current URL.
 */
export function extractPaymentTokenFromUrl(): string | null {
  if (typeof window === 'undefined') return null;

  // 1. Check query parameters
  const searchParams = new URLSearchParams(window.location.search);
  const queryToken = 
    searchParams.get('pay_token') || 
    searchParams.get('payment_token') || 
    searchParams.get('invoice_token') ||
    (searchParams.get('token')?.startsWith('pay_tok_') ? searchParams.get('token') : null);

  if (queryToken) return queryToken;

  // 2. Check URL hash (e.g. #pay_token=..., #/pay/..., #/invoice/...)
  const hash = window.location.hash;
  if (hash) {
    const hashWithoutPrefix = hash.replace(/^#\/?/, '');
    const hashParams = new URLSearchParams(hashWithoutPrefix);
    const hashToken = 
      hashParams.get('pay_token') || 
      hashParams.get('payment_token') || 
      hashParams.get('invoice_token') ||
      (hashParams.get('token')?.startsWith('pay_tok_') ? hashParams.get('token') : null);

    if (hashToken) return hashToken;

    if (hash.startsWith('#/pay/')) {
      return hash.replace('#/pay/', '').split('?')[0];
    }
    if (hash.startsWith('#/invoice/')) {
      return hash.replace('#/invoice/', '').split('?')[0];
    }
  }

  return null;
}

/**
 * Finds an invoice matching the provided secure payment token.
 */
export function findInvoiceByPaymentToken(invoices: Invoice[], token: string): Invoice | undefined {
  if (!token) return undefined;
  const trimmed = token.trim();
  return invoices.find(
    (inv) =>
      inv.payment_token === trimmed ||
      inv.paymentToken === trimmed ||
      inv.id === trimmed ||
      (trimmed.toLowerCase() === inv.invoiceNumber.toLowerCase())
  );
}

/**
 * Ensures an invoice object has a unique payment_token.
 */
export function ensureInvoicePaymentToken(invoice: Invoice): Invoice {
  if (invoice.payment_token && invoice.payment_token.trim() !== '') {
    return {
      ...invoice,
      paymentToken: invoice.paymentToken || invoice.payment_token,
    };
  }

  const generatedToken = generatePaymentToken(invoice.invoiceNumber, invoice.clientName);
  return {
    ...invoice,
    payment_token: generatedToken,
    paymentToken: generatedToken,
  };
}
