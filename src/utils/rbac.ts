import { Role, WorkflowUser } from '../types';

/**
 * RBAC permission matrix.
 * Lowest privilege wins; higher roles implicitly inherit lower-role capabilities.
 */
export type Permission =
  | 'approve'
  | 'manage_users'
  | 'manage_settings'
  | 'manage_inventory'
  | 'manage_clients'
  | 'create_docs'
  | 'send_docs'
  | 'delete_docs'
  | 'mark_paid'
  | 'view_financials'
  | 'view_reports';

// Explicit grant map (most restrictive first). Higher roles inherit via ranking.
const ROLE_RANK: Record<Role, number> = {
  staff: 1,
  accountant: 2,
  admin: 3,
  owner: 4,
};

const PERMISSION_ROLES: Record<Permission, Role[]> = {
  // Only owners & admins can approve documents
  approve: ['owner', 'admin'],
  // Team/security management is owner-only (admins can edit settings but not users)
  manage_users: ['owner'],
  manage_settings: ['owner', 'admin'],
  // Accountants get full financial oversight
  view_financials: ['owner', 'admin', 'accountant'],
  view_reports: ['owner', 'admin', 'accountant'],
  // Everything below is available to all working roles
  create_docs: ['owner', 'admin', 'accountant', 'staff'],
  send_docs: ['owner', 'admin', 'accountant', 'staff'],
  delete_docs: ['owner', 'admin', 'accountant'],
  mark_paid: ['owner', 'admin', 'accountant'],
  manage_inventory: ['owner', 'admin', 'accountant', 'staff'],
  manage_clients: ['owner', 'admin', 'accountant'],
};

/** True if `role` may perform `permission` (admin/owner always inherit lower ranks). */
export function can(role: Role, permission: Permission): boolean {
  const granted = PERMISSION_ROLES[permission] ?? [];
  const rank = ROLE_RANK[role] ?? 0;
  return granted.some((r) => ROLE_RANK[r] <= rank);
}

/** Human label for display. */
export const ROLE_LABELS: Record<Role, string> = {
  owner: 'Owner',
  admin: 'Admin',
  accountant: 'Accountant (view-only)',
  staff: 'Staff',
};

export const ROLE_COLORS: Record<Role, string> = {
  owner: 'bg-amber-100 text-amber-800 border-amber-200',
  admin: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  accountant: 'bg-sky-100 text-sky-800 border-sky-200',
  staff: 'bg-slate-100 text-slate-700 border-slate-200',
};

/** Describes what a role can and cannot do (used by the RBAC settings panel). */
export function roleDescription(role: Role): string {
  switch (role) {
    case 'owner':
      return 'Full access. Manage team, roles, settings, approvals and all financial records.';
    case 'admin':
      return 'Manage settings, approve documents and oversee all records (cannot manage users).';
    case 'accountant':
      return 'View-only financial oversight: reports, invoices, payments. Cannot approve or delete.';
    case 'staff':
      return 'Can create invoices, estimates, clients and inventory but cannot approve, send or delete.';
  }
}

export function isApprover(role: Role): boolean {
  return can(role, 'approve');
}

/** Build a display name from a WorkflowUser. */
export function userDisplayName(u?: WorkflowUser): string {
  if (!u) return 'Unknown';
  const parts = u.name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  return u.name.slice(0, 2).toUpperCase();
}