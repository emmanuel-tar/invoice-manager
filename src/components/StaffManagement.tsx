import React, { useState } from 'react';
import {
  Users,
  Search,
  MoreVertical,
  Edit3,
  Trash2,
  UserPlus,
  Mail,
  Shield,
  UserCheck,
  UserX,
  Download,
  Upload,
  Key,
  X,
  Clock,
  Copy,
  CheckSquare,
  Square,
  Filter,
  MailOpen,
} from 'lucide-react';
import { WorkflowUser, Role } from '../types';
import { ROLE_LABELS, ROLE_COLORS, roleDescription, can, userDisplayName } from '../utils/rbac';

interface StaffManagementProps {
  team: WorkflowUser[];
  currentUser: WorkflowUser;
  onAddUser: (user: Omit<WorkflowUser, 'id'>) => void;
  onUpdateUser: (user: WorkflowUser) => void;
  onDeleteUser: (userId: string) => void;
  onResetPassword: (userId: string) => void;
  onInviteUser: (email: string, role: Role) => void;
}

const ALL_ROLES: Role[] = ['owner', 'admin', 'accountant', 'staff'];

export const StaffManagement: React.FC<StaffManagementProps> = ({
  team,
  currentUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onResetPassword,
  onInviteUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | Role>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<WorkflowUser | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'staff' as Role });
  const [inviteData, setInviteData] = useState({ email: '', role: 'staff' as Role });

  const canManageUsers = can(currentUser.role, 'manage_users');

  const filteredTeam = team.filter((user) => {
    if (filterRole !== 'all' && user.role !== filterRole) return false;
    if (filterStatus === 'active' && !user.isActive) return false;
    if (filterStatus === 'inactive' && user.isActive) return false;
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return user.name.toLowerCase().includes(searchLower) || user.email.toLowerCase().includes(searchLower) || ROLE_LABELS[user.role].toLowerCase().includes(searchLower);
    }
    return true;
  });

  const roleStats = ALL_ROLES.map((role) => ({
    role,
    count: team.filter((u) => u.role === role).length,
    active: team.filter((u) => u.role === role && u.isActive).length,
  }));

  const handleAddUser = () => {
    if (newUser.name && newUser.email) {
      onAddUser({ name: newUser.name, email: newUser.email, role: newUser.role, isActive: true });
      setShowAddModal(false);
      setNewUser({ name: '', email: '', role: 'staff' });
    }
  };

  const handleInviteUser = () => {
    if (inviteData.email) {
      onInviteUser(inviteData.email, inviteData.role);
      setShowInviteModal(false);
      setInviteData({ email: '', role: 'staff' });
    }
  };

  const handleUpdateUser = () => {
    if (editingUser) {
      onUpdateUser(editingUser);
      setEditingUser(null);
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (userId !== currentUser.id) onDeleteUser(userId);
    setShowDeleteConfirm(null);
  };

  const copyToClipboard = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getAvatarColor = (role: Role) => {
    const colors: Record<Role, string> = { owner: 'bg-amber-500', admin: 'bg-indigo-500', accountant: 'bg-sky-500', staff: 'bg-emerald-500' };
    return colors[role];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Staff Management</h1>
          <p className="text-sm text-slate-400 mt-1">Manage team members, roles, and access permissions</p>
        </div>
        {canManageUsers && (
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-700">
              <Upload className="w-4 h-4" />Import
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-700">
              <Download className="w-4 h-4" />Export
            </button>
            <button onClick={() => setShowInviteModal(true)} className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-700">
              <MailOpen className="w-4 h-4" />Invite
            </button>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
              <UserPlus className="w-4 h-4" />Add Member
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {roleStats.map(({ role, count, active }) => (
          <button key={role} onClick={() => setFilterRole(filterRole === role ? 'all' : role)}
            className={`p-4 rounded-xl border transition-all text-left ${filterRole === role ? 'bg-blue-600/10 border-blue-500/50 ring-1 ring-blue-500/30' : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${ROLE_COLORS[role]}`}>{ROLE_LABELS[role]}</span>
              <Shield className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-white">{count}</p>
            <p className="text-xs text-slate-400 mt-1">{active} active</p>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by name, email, or role..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value as any)} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
            <option value="all">All Roles</option>
            {ALL_ROLES.map((role) => (<option key={role} value={role}>{ROLE_LABELS[role]}</option>))}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/80">
          <h3 className="text-sm font-medium text-white">Team Members ({filteredTeam.length})</h3>
        </div>
        <div className="divide-y divide-slate-700/50">
          {filteredTeam.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No team members found</p>
              <p className="text-sm text-slate-500 mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredTeam.map((user) => (
              <div key={user.id} className="px-4 py-4 flex items-center justify-between hover:bg-slate-700/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white ${getAvatarColor(user.role)}`}>
                    {userDisplayName(user)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">{user.name}</p>
                      {user.id === currentUser.id && (<span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">You</span>)}
                      {!user.isActive && (<span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">Inactive</span>)}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-xs text-slate-400"><Mail className="w-3 h-3" />{user.email}</span>
                      <button onClick={() => copyToClipboard(user.email)} className="p-0.5 text-slate-500 hover:text-white transition-colors" title="Copy email">
                        {copiedEmail === user.email ? (<CheckSquare className="w-3 h-3 text-emerald-400" />) : (<Copy className="w-3 h-3" />)}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${ROLE_COLORS[user.role]}`}>{ROLE_LABELS[user.role]}</span>
                    {user.lastLogin && (<p className="text-xs text-slate-500 mt-1 flex items-center gap-1 justify-end"><Clock className="w-3 h-3" />{formatDate(user.lastLogin)}</p>)}
                  </div>
                  {canManageUsers && (
                    <div className="relative">
                      <button onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenuId === user.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 py-1">
                          <button onClick={() => { setEditingUser(user); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"><Edit3 className="w-4 h-4" />Edit Role</button>
                          <button onClick={() => { onResetPassword(user.id); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"><Key className="w-4 h-4" />Reset Password</button>
                          <div className="border-t border-slate-700 my-1" />
                          <button onClick={() => { onUpdateUser({ ...user, isActive: !user.isActive }); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors">
                            {user.isActive ? (<><UserX className="w-4 h-4" />Deactivate</>) : (<><UserCheck className="w-4 h-4" />Activate</>)}
                          </button>
                          {user.id !== currentUser.id && (
                            <button onClick={() => { setShowDeleteConfirm(user.id); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="w-4 h-4" />Remove User</button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Role Permissions Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ALL_ROLES.map((role) => (
            <div key={role} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${ROLE_COLORS[role]}`}>{ROLE_LABELS[role]}</span>
              </div>
              <p className="text-sm text-slate-400">{roleDescription(role)}</p>
            </div>
          ))}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Add Team Member</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label><input type="text" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500" placeholder="Enter full name" /></div>
              <div><label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label><input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500" placeholder="Enter email address" /></div>
              <div><label className="block text-sm font-medium text-slate-300 mb-2">Role</label><select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500">{ALL_ROLES.filter((r) => r !== 'owner').map((role) => (<option key={role} value={role}>{ROLE_LABELS[role]}</option>))}</select><p className="text-xs text-slate-500 mt-2">{roleDescription(newUser.role)}</p></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors">Cancel</button>
              <button onClick={handleAddUser} disabled={!newUser.name || !newUser.email} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-colors">Add Member</button>
            </div>
          </div>
        </div>
      )}

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Invite Team Member</h3>
              <button onClick={() => setShowInviteModal(false)} className="p-1 text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-blue-600/10 border border-blue-500/30 rounded-lg"><p className="text-sm text-blue-300">An invitation email will be sent with a link to join your workspace.</p></div>
              <div><label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label><input type="email" value={inviteData.email} onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500" placeholder="colleague@company.com" /></div>
              <div><label className="block text-sm font-medium text-slate-300 mb-2">Role</label><select value={inviteData.role} onChange={(e) => setInviteData({ ...inviteData, role: e.target.value as Role })} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500">{ALL_ROLES.filter((r) => r !== 'owner').map((role) => (<option key={role} value={role}>{ROLE_LABELS[role]}</option>))}</select></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowInviteModal(false)} className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors">Cancel</button>
              <button onClick={handleInviteUser} disabled={!inviteData.email} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-sm font-medium transition-colors">Send Invite</button>
            </div>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Edit Team Member</h3>
              <button onClick={() => setEditingUser(null)} className="p-1 text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label><input type="text" value={editingUser.name} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500" /></div>
              <div><label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label><input type="email" value={editingUser.email} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500" /></div>
              <div><label className="block text-sm font-medium text-slate-300 mb-2">Role</label><select value={editingUser.role} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as Role })} className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500">{ALL_ROLES.map((role) => (<option key={role} value={role}>{ROLE_LABELS[role]}</option>))}</select><p className="text-xs text-slate-500 mt-2">{roleDescription(editingUser.role)}</p></div>
              <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
                <input type="checkbox" checked={editingUser.isActive} onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.checked })} className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600" />
                <label className="text-sm text-slate-300">Account is active</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditingUser(null)} className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors">Cancel</button>
              <button onClick={handleUpdateUser} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-7 h-7 text-red-400" /></div>
              <h3 className="text-lg font-bold text-white mb-2">Remove Team Member?</h3>
              <p className="text-sm text-slate-400 mb-6">This action cannot be undone. The user will lose access immediately.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors">Cancel</button>
                <button onClick={() => handleDeleteUser(showDeleteConfirm)} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">Remove</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
