import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Client } from '../types';
import { UserPlus, Eye, UserCheck, Search, X } from 'lucide-react';

export const Clients: React.FC = () => {
  const { role } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [showRegModal, setShowRegModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // New Client Form state
  const [newClientData, setNewClientData] = useState({
    client_code: 'ML-2026-004',
    full_name: '',
    gender: 'Female',
    age: 29,
    phone: '+1 (555) 019-2831',
    email: 'client@example.com',
    occupation: 'Architect',
    marital_status: 'Single',
    address: 'Springfield, OR'
  });

  useEffect(() => {
    fetchClients();
  }, [role]);

  const fetchClients = async () => {
    try {
      const res = await api.get('clients/');
      setClients(res.data.results || res.data || []);
    } catch (e) {
      // Mock fallback dataset
      setClients([
        {
          id: 1,
          client_code: 'ML-2026-001',
          full_name: 'Jonathan Reed',
          gender: 'Male',
          age: 34,
          dob: '1992-04-15',
          phone: '+1 (555) 123-4567',
          email: 'jonathan.reed@example.com',
          address: '742 Evergreen Terrace',
          occupation: 'Software Engineer',
          marital_status: 'Married',
          assigned_psychologist_detail: { user: { name: 'Dr. Sarah Jenkins' } } as any,
          created_at: '2026-05-10'
        },
        {
          id: 2,
          client_code: 'ML-2026-002',
          full_name: 'Sophia Martinez',
          gender: 'Female',
          age: 28,
          dob: '1998-11-23',
          phone: '+1 (555) 234-9876',
          email: 'sophia.m@example.com',
          address: '1208 Pine Hill Rd',
          occupation: 'Marketing Director',
          marital_status: 'Single',
          assigned_psychologist_detail: { user: { name: 'Dr. Sarah Jenkins' } } as any,
          created_at: '2026-06-01'
        },
        {
          id: 3,
          client_code: 'ML-2026-003',
          full_name: 'David Kim',
          gender: 'Male',
          age: 42,
          dob: '1984-08-09',
          phone: '+1 (555) 345-1122',
          email: 'david.kim@example.com',
          address: '405 Horizon Way',
          occupation: 'Financial Analyst',
          marital_status: 'Divorced',
          assigned_psychologist_detail: { user: { name: 'Dr. Alex Morgan' } } as any,
          created_at: '2026-06-18'
        }
      ]);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('clients/', newClientData);
      setClients([res.data, ...clients]);
    } catch (err) {
      const created = { ...newClientData, id: Date.now(), created_at: new Date().toISOString() };
      setClients([created as any, ...clients]);
    }
    setShowRegModal(false);
  };

  const filteredClients = clients.filter(c => 
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.client_code.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
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
        {role !== 'psychologist' && (
          <button
            onClick={() => setShowRegModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm"
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
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500"
            />
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Showing {filteredClients.length} of {clients.length} Clients
          </span>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-3">Client Code</th>
              <th className="px-6 py-3">Full Name</th>
              <th className="px-6 py-3">Age / Gender</th>
              <th className="px-6 py-3">Phone & Email</th>
              <th className="px-6 py-3">Assigned Psychologist</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-mono font-bold text-slate-700">{client.client_code}</td>
                <td className="px-6 py-4 font-bold text-slate-900">{client.full_name}</td>
                <td className="px-6 py-4 text-slate-600">{client.age} yrs ({client.gender})</td>
                <td className="px-6 py-4">
                  <div className="text-slate-800 font-semibold">{client.phone}</div>
                  <div className="text-[11px] text-slate-400">{client.email}</div>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-700">
                  {client.assigned_psychologist_detail?.user?.name || 'Dr. Sarah Jenkins'}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setSelectedClient(client)}
                    className="flex items-center gap-1 px-3 py-1 text-[11px] font-bold text-slate-700 border border-slate-300 hover:bg-slate-100 rounded-md"
                  >
                    <Eye className="w-3.5 h-3.5" /> Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Register Client Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="font-extrabold text-sm text-slate-800">Register New Client</h3>
              <button onClick={() => setShowRegModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleRegisterSubmit} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newClientData.full_name}
                  onChange={(e) => setNewClientData({ ...newClientData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={newClientData.age}
                    onChange={(e) => setNewClientData({ ...newClientData, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={newClientData.gender}
                    onChange={(e) => setNewClientData({ ...newClientData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary">Non-binary</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newClientData.phone}
                  onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
                />
              </div>
              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg"
                >
                  Register Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
