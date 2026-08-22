import { Client } from '../types';

/**
 * Generates a secure, cryptographically random unique token for client portal access
 */
export function generateSecurePortalToken(clientId?: string, clientName?: string): string {
  const prefix = 'pt_';
  const cleanName = (clientName || 'client')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 8);
  
  // Generate random hex string using crypto if available or fallback
  let randomHex = '';
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(12);
    window.crypto.getRandomValues(array);
    randomHex = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  } else {
    randomHex = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  return `${prefix}${cleanName}_${randomHex}`;
}

/**
 * Builds the full secure client portal URL
 */
export function getClientPortalUrl(portalToken: string): string {
  if (typeof window === 'undefined') {
    return `https://invoicepro.app/portal?token=${portalToken}`;
  }
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  return `${origin}${pathname}?portal=${encodeURIComponent(portalToken)}`;
}

/**
 * Extracts portal token from URL query params or hash
 */
export function extractPortalTokenFromUrl(): string | null {
  if (typeof window === 'undefined') return null;

  // 1. Check query parameter `portal` or `portal_token` or `token`
  const searchParams = new URLSearchParams(window.location.search);
  const queryToken = searchParams.get('portal') || searchParams.get('portal_token') || searchParams.get('token');
  if (queryToken) return queryToken;

  // 2. Check hash `#portal=...` or `#/portal/...`
  const hash = window.location.hash;
  if (hash) {
    const hashParams = new URLSearchParams(hash.replace(/^#\/?/, ''));
    const hashToken = hashParams.get('portal') || hashParams.get('portal_token') || hashParams.get('token');
    if (hashToken) return hashToken;

    if (hash.startsWith('#/portal/')) {
      return hash.replace('#/portal/', '');
    }
  }

  return null;
}

/**
 * Finds a client given a portal token
 */
export function getClientByPortalToken(clients: Client[], token: string): Client | undefined {
  if (!token) return undefined;
  return clients.find((c) => c.portalToken === token || c.id === token);
}
