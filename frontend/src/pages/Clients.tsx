import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Client, Psychologist } from '../types';
import { UserPlus, Eye, UserCheck, Search, X, Edit3, Trash2, AlertCircle } from 'lucide-react';

export const Clients: React.FC = () => {
  const { effectiveRole } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [search, setSearch] = useState('');
  const [showRegModal, setShowRegModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // New Client Form state
  const [newClientData, setNewClientData] = useState({
    client_code: `ML-2026-${Math.floor(100 + Math.random() * 900)}`,
    full_name: '',
    gender: 'Female',
    age: 29,
    phone: '',
    email: '',
    occupation: '',
    marital_status: 'Single',
    address: '',
    assigned_psychologist: ''
  });

  // Edit Client Form state
  const [editData, setEditData] = useState({
    full_name: '',
    gender: 'Female',
    age: 29,
    phone: '',
    email: '',
    occupation: '',
    marital_status: 'Single',
    address: '',
    assigned_psychologist: ''
  });

  useEffect(() => {
    fetchClients();
    fetchPsychologists();
  }, [effectiveRole]);

  const fetchClients = async () => {
    try {
      const res = await api.get('clients/');
      setClients(res.data.results || res.data || []);
    } catch (e) {
      console.error('Failed to load clients:', e);
    }
  };

  const fetchPsychologists = async () => {
    try {
      const res = await api.get('auth/psychologists/');
      setPsychologists(res.data.results || res.data || []);
    } catch (e) {
      console.error('Failed to load psychologists:', e);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...newClientData };
      if (newClientData.assigned_psychologist) {
        payload.assigned_psychologist = parseInt(newClientData.assigned_psychologist, 10);
      } else {
        delete payload.assigned_psychologist;
      }
      await api.post('clients/', payload);
      fetchClients();
      setShowRegModal(false);
      setNewClientData({
        client_code: `ML-2026-${Math.floor(100 + Math.random() * 900)}`,
        full_name: '',
        gender: 'Female',
        age: 29,
        phone: '',
        email: '',
        occupation: '',
        marital_status: 'Single',
        address: '',
        assigned_psychologist: ''
      });
    } catch (err) {
      alert('Failed to register new client.');
    }
  };

  const openEditModal = (c: Client) => {
    setEditingClient(c);
    setEditData({
      full_name: c.full_name || '',
      gender: c.gender || 'Female',
      age: c.age || 25,
      phone: c.phone || '',
      email: c.email || '',
      occupation: c.occupation || '',
      marital_status: c.marital_status || 'Single',
      address: c.address || '',
      assigned_psychologist: c.assigned_psychologist ? String(c.assigned_psychologist) : ''
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    try {
      const payload: any = { ...editData };
      if (editData.assigned_psychologist) {
        payload.assigned_psychologist = parseInt(editData.assigned_psychologist, 10);
      } else {
        payload.assigned_psychologist = null;
      }
      await api.patch(`clients/${editingClient.id}/`, payload);
      fetchClients();
      setEditingClient(null);
    } catch (err) {
      alert('Failed to update client record.');
    }
  };

  const handleDeleteClient = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete client record for "${name}"?`)) return;
    try {
      await api.delete(`clients/${id}/`);
      fetchClients();
    } catch (err) {
      alert('Failed to delete client record.');
    }
  };

  const filteredClients = clients.filter(c =>
    (c.full_name && c.full_name.toLowerCase().includes(search.toLowerCase())) ||
    (c.client_code && c.client_code.toLowerCase().includes(search.toLowerCase())) ||
    (c.phone && c.phone.includes(search))
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Client Directory</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Manage intake registrations, basic demographics, and psychologist assignments
          </p>
        </div>
        {effectiveRole !== 'psychologist' && (
          <button
            onClick={() => setShowRegModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4" /> Register New Client
          </button>
        )}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="relative w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Name, Client ID or Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 font-medium"
            />
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Showing {filteredClients.length} of {clients.length} Clients
          </span>
        </div>

        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-3.5">Client Code</th>
              <th className="px-6 py-3.5">Full Name</th>
              <th className="px-6 py-3.5">Age / Gender</th>
              <th className="px-6 py-3.5">Phone & Email</th>
              <th className="px-6 py-3.5">Assigned Psychologist</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-mono font-bold text-slate-800">{client.client_code}</td>
                <td className="px-6 py-4 font-bold text-slate-900">{client.full_name}</td>
                <td className="px-6 py-4 text-slate-600">{client.age} yrs ({client.gender})</td>
                <td className="px-6 py-4">
                  <div className="text-slate-800 font-semibold">{client.phone || '—'}</div>
                  <div className="text-[11px] text-slate-400">{client.email || '—'}</div>
                </td>
                <td className="px-6 py-4 font-semibold text-sky-700">
                  {client.assigned_psychologist_detail?.user?.name ? `Dr. ${client.assigned_psychologist_detail.user.name}` : 'Unassigned'}
                </td>
                <td className="px-6 py-4 text-right flex items-center justify-end gap-1">
                  {/* CCD & Managers can Edit and Delete clients */}
                  {effectiveRole !== 'psychologist' && (
                    <>
                      <button
                        onClick={() => openEditModal(client)}
                        className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                        title="Edit Client Information"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client.id, client.full_name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Delete Client Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {filteredClients.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400 italic">
                  No registered clients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Register Client Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-sky-600" /> Register New Client
              </h3>
              <button onClick={() => setShowRegModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs font-medium">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newClientData.full_name}
                  onChange={(e) => setNewClientData({ ...newClientData, full_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500"
                  placeholder="e.g. Eleanor Vance"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={newClientData.age}
                    onChange={(e) => setNewClientData({ ...newClientData, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={newClientData.gender}
                    onChange={(e) => setNewClientData({ ...newClientData, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary">Non-binary</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newClientData.phone}
                    onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500"
                    placeholder="+1 (555) 019-2831"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newClientData.email}
                    onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500"
                    placeholder="eleanor@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Psychologist</label>
                <select
                  value={newClientData.assigned_psychologist}
                  onChange={(e) => setNewClientData({ ...newClientData, assigned_psychologist: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500 font-bold text-sky-800"
                >
                  <option value="">-- Assign Later --</option>
                  {psychologists.map(p => (
                    <option key={p.id} value={p.id}>Dr. {p.user?.name} ({p.specialization})</option>
                  ))}
                </select>
              </div>
              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Register Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {editingClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-sky-600" /> Edit Client Record ({editingClient.client_code})
              </h3>
              <button onClick={() => setEditingClient(null)} className="text-slate-400 font-bold">✕</button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs font-medium">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editData.full_name}
                  onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={editData.age}
                    onChange={(e) => setEditData({ ...editData, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={editData.gender}
                    onChange={(e) => setEditData({ ...editData, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary">Non-binary</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Psychologist</label>
                <select
                  value={editData.assigned_psychologist}
                  onChange={(e) => setEditData({ ...editData, assigned_psychologist: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500 font-bold text-sky-800"
                >
                  <option value="">-- Unassigned --</option>
                  {psychologists.map(p => (
                    <option key={p.id} value={p.id}>Dr. {p.user?.name} ({p.specialization})</option>
                  ))}
                </select>
              </div>
              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
