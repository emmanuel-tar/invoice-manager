import { WorkflowUser } from '../types';

const SESSION_KEY = 'invoicepro_session';
const SESSION_EXPIRY_KEY = 'invoicepro_session_expiry';
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours

export interface Session {
  user: WorkflowUser;
  loginTime: string;
  expiresAt: string;
}

/**
 * Create a new session for the authenticated user
 */
export function createSession(user: WorkflowUser): Session {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS);
  
  const session: Session = {
    user,
    loginTime: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(SESSION_EXPIRY_KEY, expiresAt.toISOString());
  } catch (e) {
    console.error('Failed to persist session:', e);
  }

  return session;
}

/**
 * Get the current session if valid
 */
export function getSession(): Session | null {
  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) return null;

    const session: Session = JSON.parse(sessionData);
    
    // Check if session has expired
    const expiresAt = new Date(session.expiresAt);
    if (new Date() > expiresAt) {
      clearSession();
      return null;
    }

    return session;
  } catch (e) {
    console.error('Failed to read session:', e);
    clearSession();
    return null;
  }
}

/**
 * Clear the current session (logout)
 */
export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_EXPIRY_KEY);
  } catch (e) {
    console.error('Failed to clear session:', e);
  }
}

/**
 * Check if the current session is valid
 */
export function isSessionValid(): boolean {
  return getSession() !== null;
}

/**
 * Get remaining session time in milliseconds
 */
export function getSessionTimeRemaining(): number {
  try {
    const expiryData = localStorage.getItem(SESSION_EXPIRY_KEY);
    if (!expiryData) return 0;

    const expiresAt = new Date(expiryData).getTime();
    const remaining = expiresAt - Date.now();
    return Math.max(0, remaining);
  } catch {
    return 0;
  }
}

/**
 * Format remaining time for display
 */
export function formatSessionTimeRemaining(): string {
  const remaining = getSessionTimeRemaining();
  if (remaining === 0) return 'Expired';

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Refresh session expiry (extend session)
 */
export function refreshSession(): Session | null {
  const currentSession = getSession();
  if (!currentSession) return null;

  return createSession(currentSession.user);
}

/**
 * Update user data in session
 */
export function updateSessionUser(user: WorkflowUser): Session | null {
  const currentSession = getSession();
  if (!currentSession) return null;

  const newSession: Session = {
    ...currentSession,
    user,
  };

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
  } catch (e) {
    console.error('Failed to update session:', e);
  }

  return newSession;
}
