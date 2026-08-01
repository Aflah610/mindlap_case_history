import React, { useState, useEffect } from 'react';
import { UserCheck, UserPlus, Key, Copy, Check, Trash2, Edit3, Mail, Phone, Shield, AlertCircle, Filter, Eye, EyeOff } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface UserAccount {
  id: number;
  username: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  created_at: string;
}

export const StaffManagement: React.FC = () => {
  const { effectiveRole } = useAuth();
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  // New Staff Form State
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('Ccd@123');
  const [role, setRole] = useState<'ccd' | 'psychologist' | 'operation_manager'>('ccd');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Password visibility state
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  // Edit Staff Form State
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<string>('ccd');
  const [editPassword, setEditPassword] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editErrorMsg, setEditErrorMsg] = useState<string | null>(null);

  // Created Credentials Banner
  const [lastCreated, setLastCreated] = useState<{ username: string; name: string; email: string; password: string; role: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('auth/users/');
      setUsers(res.data.results || res.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await api.post('auth/users/', {
        username,
        name: name || username,
        email,
        phone,
        password,
        role,
        status: 'active'
      });

      setLastCreated({
        username: res.data.username || username,
        name: res.data.name || name || username,
        email: res.data.email || email,
        password: password,
        role: role.toUpperCase().replace('_', ' ')
      });

      setShowCreateModal(false);
      setUsername('');
      setName('');
      setEmail('');
      setPhone('');
      setPassword('Ccd@123');
      fetchUsers();
    } catch (err: any) {
      if (err.response?.data?.username) {
        setErrorMsg(`Username error: ${err.response.data.username[0]}`);
      } else if (err.response?.data?.detail) {
        setErrorMsg(err.response.data.detail);
      } else {
        setErrorMsg('Failed to create account. Check if username or email already exists.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (u: UserAccount) => {
    setEditingUser(u);
    setEditName(u.name || '');
    setEditEmail(u.email || '');
    setEditPhone(u.phone || '');
    setEditRole(u.role || 'ccd');
    setEditPassword('');
    setEditErrorMsg(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditSubmitting(true);
    setEditErrorMsg(null);

    try {
      const payload: any = {
        name: editName,
        email: editEmail,
        phone: editPhone,
        role: editRole,
      };
      if (editPassword) {
        payload.password = editPassword;
      }

      await api.patch(`auth/users/${editingUser.id}/`, payload);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      setEditErrorMsg(err.response?.data?.detail || 'Failed to update user account details.');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Offboarding / Reassignment Modal State
  const [offboardingUser, setOffboardingUser] = useState<UserAccount | null>(null);
  const [psychologists, setPsychologists] = useState<any[]>([]);
  const [allClients, setAllClients] = useState<any[]>([]);
  const [replacementPsychologistId, setReplacementPsychologistId] = useState<string>('');
  const [offboardingSubmitting, setOffboardingSubmitting] = useState(false);
  const [offboardSuccessMsg, setOffboardSuccessMsg] = useState<string | null>(null);

  const fetchOffboardData = async () => {
    try {
      const [psyRes, cliRes] = await Promise.all([
        api.get('auth/psychologists/'),
        api.get('clients/')
      ]);
      setPsychologists(psyRes.data.results || psyRes.data || []);
      setAllClients(cliRes.data.results || cliRes.data || []);
    } catch (err) {
      console.error('Failed to fetch psychologists or clients for offboarding:', err);
    }
  };

  const handleOpenOffboardModal = async (u: UserAccount) => {
    setOffboardingUser(u);
    setReplacementPsychologistId('');
    setOffboardSuccessMsg(null);
    await fetchOffboardData();
  };

  const handleConfirmOffboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offboardingUser) return;
    setOffboardingSubmitting(true);

    try {
      const res = await api.post(`auth/users/${offboardingUser.id}/offboard/`, {
        replacement_psychologist_id: replacementPsychologistId ? parseInt(replacementPsychologistId, 10) : null
      });

      setOffboardSuccessMsg(res.data.detail || 'Account deactivated and clients reassigned successfully.');
      setTimeout(() => {
        setOffboardingUser(null);
        setOffboardSuccessMsg(null);
        fetchUsers();
      }, 1800);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to complete psychologist offboarding.');
    } finally {
      setOffboardingSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: number, usernameStr: string) => {
    if (!window.confirm(`Are you sure you want to remove staff account @${usernameStr}?`)) return;
    try {
      await api.delete(`auth/users/${id}/`);
      fetchUsers();
    } catch (err) {
      alert('Failed to delete staff account.');
    }
  };

  const copyCredentials = () => {
    if (!lastCreated) return;
    const text = `Mindlap EMR Credentials:\nRole: ${lastCreated.role}\nName: ${lastCreated.name}\nUsername: ${lastCreated.username}\nEmail: ${lastCreated.email}\nPassword: ${lastCreated.password}\nLogin URL: http://localhost:3000/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const filteredUsers = users.filter(u => {
    if (filterRole === 'all') return true;
    return u.role === filterRole;
  });

  const getRoleBadge = (r: string) => {
    switch (r) {
      case 'owner':
      case 'admin':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200 uppercase">Admin / Owner</span>;
      case 'operation_manager':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200 uppercase">Ops Manager</span>;
      case 'ccd':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-800 border border-teal-200 uppercase">CCD Staff</span>;
      case 'psychologist':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200 uppercase">Psychologist</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 capitalize">{r}</span>;
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        Loading Staff Account Directory...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Staff Account Management</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Manage active clinic staff accounts, edit user details, and issue login credentials
          </p>
        </div>

        {(effectiveRole === 'owner' || effectiveRole === 'admin' || effectiveRole === 'operation_manager') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4" /> Create Staff Account
          </button>
        )}
      </div>

      {/* Newly Created Credentials Banner */}
      {lastCreated && (
        <div className="bg-emerald-50 border-2 border-emerald-500 p-4 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600 text-white rounded-xl">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-emerald-900 uppercase tracking-wider">
                  New {lastCreated.role} Account Created
                </h3>
                <p className="text-xs text-emerald-700">
                  Share these login details with the team member.
                </p>
              </div>
            </div>

            <button
              onClick={copyCredentials}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-all"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Credentials Copied!' : 'Copy Credentials'}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white/80 p-3 rounded-xl border border-emerald-200 text-xs font-medium">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Name</span>
              <div className="font-bold text-slate-800">{lastCreated.name}</div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Username</span>
              <div className="font-mono font-bold text-slate-800">@{lastCreated.username}</div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Email</span>
              <div className="text-slate-700">{lastCreated.email || '—'}</div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Password</span>
              <div className="font-mono font-bold text-emerald-700">{lastCreated.password}</div>
            </div>
          </div>
        </div>
      )}

      {/* Role Filter Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterRole('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterRole === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Accounts ({users.length})
          </button>
          <button
            onClick={() => setFilterRole('ccd')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterRole === 'ccd' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            CCD Staff ({users.filter(u => u.role === 'ccd').length})
          </button>
          <button
            onClick={() => setFilterRole('psychologist')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterRole === 'psychologist' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Psychologists ({users.filter(u => u.role === 'psychologist').length})
          </button>
          <button
            onClick={() => setFilterRole('operation_manager')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterRole === 'operation_manager' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Managers ({users.filter(u => u.role === 'operation_manager' || u.role === 'owner' || u.role === 'admin').length})
          </button>
        </div>
      </div>

      {/* Unified Staff Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider text-[11px]">
              <th className="px-6 py-3.5">Staff Member</th>
              <th className="px-6 py-3.5">Role</th>
              <th className="px-6 py-3.5">Email & Contact</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-bold text-slate-900">
                  {u.name} <br/>
                  <span className="font-mono text-[11px] font-normal text-slate-400">@{u.username}</span>
                </td>
                <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                <td className="px-6 py-4">
                  <div className="text-slate-800">{u.email || '—'}</div>
                  <div className="text-[11px] text-slate-400">{u.phone || ''}</div>
                </td>
                <td className="px-6 py-4">
                  {u.status === 'inactive' || (u as any).is_active === false ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200 shadow-2xs">
                      🔴 Worked Previously (Former Staff)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      🟢 Works Now (Active)
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right flex items-center justify-end gap-1">
                  <button
                    onClick={() => openEditModal(u)}
                    className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                    title="Edit Staff Account"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {u.username !== 'admin' && (
                    <button
                      onClick={() => handleOpenOffboardModal(u)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Deactivate & Reassign Staff Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">
                  No staff accounts found matching filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Staff Account Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-sky-600" />
                Edit Staff Account (@{editingUser.username})
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {editErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Account Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sky-800"
                >
                  <option value="ccd">CCD Staff (Intake & Scheduling Desk)</option>
                  <option value="psychologist">Psychologist (Clinical Therapy)</option>
                  <option value="operation_manager">Operation Manager</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Password (Leave blank to keep existing)</label>
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Enter new password if changing..."
                    className="w-full text-xs p-2.5 pr-10 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600 focus:outline-none"
                    title={showEditPassword ? 'Hide password' : 'Show password'}
                  >
                    {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm"
                >
                  {editSubmitting ? 'Saving Changes...' : 'Save Account Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-sky-600" />
                Create New Staff Account
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sky-800"
                >
                  <option value="ccd">CCD Staff (Intake & Scheduling Desk)</option>
                  <option value="psychologist">Psychologist (Clinical Therapy)</option>
                  <option value="operation_manager">Operation Manager</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. sarah.ccd"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah Connor"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@mindlap.com"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 019-2831"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password</label>
                <div className="relative">
                  <input
                    type={showCreatePassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs p-2.5 pr-32 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:outline-none focus:border-sky-500 font-bold text-slate-800"
                    required
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                      className="p-1 text-slate-400 hover:text-sky-600 focus:outline-none"
                      title={showCreatePassword ? 'Hide password' : 'Show password'}
                    >
                      {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPassword(`Ccd@${Math.floor(100 + Math.random() * 900)}`)}
                      className="text-[10px] font-bold bg-slate-200 hover:bg-slate-300 px-2 py-1 rounded-md text-slate-700"
                    >
                      Generate Random
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm"
                >
                  {submitting ? 'Creating Account...' : 'Create Account & Generate Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Offboarding & Client Reassignment Modal */}
      {offboardingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-rose-700">
                <Shield className="w-5 h-5" />
                <h3 className="text-base font-extrabold text-slate-800">
                  Staff Offboarding & Data Safety
                </h3>
              </div>
              <button
                onClick={() => setOffboardingUser(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {offboardSuccessMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-600" />
                <span>{offboardSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleConfirmOffboard} className="space-y-4">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    Offboarding Staff Member: {offboardingUser.name} (@{offboardingUser.username})
                  </div>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    To maintain HIPAA/GDPR medical compliance and prevent orphan client records, active clients and scheduled consultations will be bulk-transferred to another psychologist. Historical case notes remain permanently preserved.
                  </p>
                </div>

                {offboardingUser.role === 'psychologist' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Select Replacement Psychologist <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={replacementPsychologistId}
                      onChange={(e) => setReplacementPsychologistId(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sky-900 focus:outline-none focus:border-sky-500"
                    >
                      <option value="">-- Choose Replacement Psychologist --</option>
                      {psychologists
                        .filter((p: any) => p.user?.username !== offboardingUser.username)
                        .map((p: any) => (
                          <option key={p.id} value={p.id}>
                            Dr. {p.user?.name} ({p.specialization})
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setOffboardingUser(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={offboardingSubmitting}
                    className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-all"
                  >
                    {offboardingSubmitting ? 'Transferring Data & Offboarding...' : 'Confirm Offboarding & Reassign Clients'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
