import React, { useEffect, useState } from 'react';
import { Client, Appointment, Psychologist } from '../types';
import { api } from '../services/api';
import { AppointmentBookingModal } from '../components/AppointmentBookingModal';
import {
  UserPlus, Calendar, ShieldAlert, CheckCircle2, Clock,
  Search, FilePlus, Phone, Mail, UserCheck, AlertTriangle, Edit3, UserCheck2, RefreshCw
} from 'lucide-react';

export const CCDDashboard: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [therapists, setTherapists] = useState<Psychologist[]>([]);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [showIntakeForm, setShowIntakeForm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'appointments' | 'clients'>('appointments');

  // Reschedule & Reassign Modal State
  const [selectedApp, setSelectedApp] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [reassignPsychologistId, setReassignPsychologistId] = useState<string>('');
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);
  const [updatingApp, setUpdatingApp] = useState<boolean>(false);

  // New Client Form State
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('Female');
  const [age, setAge] = useState<number>(30);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [occupation, setOccupation] = useState('');
  const [assignedPsychologistId, setAssignedPsychologistId] = useState('');

  useEffect(() => {
    fetchCCDData();
  }, []);

  const fetchCCDData = async () => {
    setLoading(true);
    try {
      const [clientsRes, appRes, psyRes] = await Promise.all([
        api.get('clients/'),
        api.get('appointments/'),
        api.get('auth/psychologists/')
      ]);
      setClients(clientsRes.data.results || clientsRes.data || []);
      setAppointments(appRes.data.results || appRes.data || []);
      setTherapists(psyRes.data.results || psyRes.data || []);
    } catch (err) {
      console.error('Failed to load CCD data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const clientCode = `ML-2026-${Math.floor(100 + Math.random() * 900)}`;
      await api.post('clients/', {
        client_code: clientCode,
        full_name: fullName,
        gender: gender,
        age: age,
        phone: phone,
        email: email,
        occupation: occupation,
        assigned_psychologist: assignedPsychologistId ? parseInt(assignedPsychologistId, 10) : null
      });

      alert(`Client ${fullName} registered successfully with code ${clientCode}!`);
      setShowIntakeForm(false);
      setFullName('');
      setPhone('');
      setEmail('');
      fetchCCDData();
    } catch (err) {
      alert('Failed to register client.');
    }
  };

  const handleUpdateStatus = async (appointmentId: number, newStatus: string) => {
    try {
      await api.patch(`appointments/${appointmentId}/`, { status: newStatus });
      fetchCCDData();
    } catch (err) {
      alert('Failed to update appointment status.');
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    setRescheduleError(null);
    setUpdatingApp(true);

    try {
      const payload: any = {};
      if (rescheduleDate) payload.appointment_date = rescheduleDate;
      if (reassignPsychologistId) payload.psychologist = parseInt(reassignPsychologistId, 10);

      await api.patch(`appointments/${selectedApp.id}/`, payload);
      setSelectedApp(null);
      fetchCCDData();
    } catch (err: any) {
      if (err.response?.data?.non_field_errors) {
        setRescheduleError(err.response.data.non_field_errors[0]);
      } else if (err.response?.data?.detail) {
        setRescheduleError(err.response.data.detail);
      } else {
        setRescheduleError('Double-booking conflict detected! This psychologist is already booked around this time.');
      }
    } finally {
      setUpdatingApp(false);
    }
  };

  const openRescheduleModal = (app: Appointment) => {
    setSelectedApp(app);
    setRescheduleDate(app.appointment_date ? new Date(app.appointment_date).toISOString().slice(0, 16) : '');
    setReassignPsychologistId(app.psychologist ? app.psychologist.toString() : '');
    setRescheduleError(null);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        Loading Consultation Coordination Department Workspace...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Confidentiality Warning Banner */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
          <div>
            <h3 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">CCD Confidentiality Protection Enforced</h3>
            <p className="text-[11px] text-amber-800 mt-0.5">
              CCD staff handle intake registration and scheduling. Clinical diagnoses, therapy notes, MSE, and risk assessments are strictly restricted and hidden.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2.5 py-1 rounded-full uppercase">
          HIPAA Shield Active
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-sky-950 rounded-2xl p-6 text-white shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">CCD Intake & Appointment Desk</h1>
          <p className="text-xs text-slate-300 mt-1">
            Register new clients, assign psychologists, and schedule conflict-free consultation appointments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowIntakeForm(true)}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition-all shadow-sm"
          >
            <UserPlus className="w-4 h-4 text-teal-400" />
            Register New Client
          </button>
          <button
            onClick={() => setShowBookingModal(true)}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md"
          >
            <Calendar className="w-4 h-4" />
            Schedule Consultation
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Registered Clients</span>
            <UserCheck className="w-5 h-5 text-sky-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-800">{clients.length}</div>
          <span className="text-[11px] text-sky-600 font-semibold">Active clinic roster</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Appointments Scheduled</span>
            <Calendar className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-800">{appointments.length}</div>
          <span className="text-[11px] text-teal-600 font-semibold">Conflict checking active</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Available Psychologists</span>
            <UserPlus className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-800">{therapists.length}</div>
          <span className="text-[11px] text-indigo-600 font-semibold">Ready for assignment</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'appointments'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" /> Appointments Roster ({appointments.length})
        </button>

        <button
          onClick={() => setActiveTab('clients')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'clients'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" /> Client Roster ({clients.length})
        </button>
      </div>

      {/* Tab 1: Scheduled Appointments Roster */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-600" />
              Scheduled Appointments Roster
            </h2>
            <button
              onClick={fetchCCDData}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-sky-600 bg-slate-50 hover:bg-sky-50 px-3 py-1.5 rounded-lg border border-slate-200"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh Roster
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Client Name</th>
                  <th className="p-3">Assigned Psychologist</th>
                  <th className="p-3">Appointment Date</th>
                  <th className="p-3">Mode</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">CCD Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {appointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-800">
                      {app.client_detail?.full_name || `Client #${app.client}`} <br/>
                      <span className="font-mono text-[10px] font-normal text-slate-400">{app.client_detail?.client_code}</span>
                    </td>
                    <td className="p-3 text-sky-700 font-semibold">
                      {app.psychologist_detail?.user?.name ? `Dr. ${app.psychologist_detail.user.name}` : 'Unassigned'}
                    </td>
                    <td className="p-3 font-mono">
                      {new Date(app.appointment_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${app.mode === 'Online' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'}`}>
                        {app.mode || 'Offline'}
                      </span>
                    </td>
                    <td className="p-3">
                      <select
                        value={app.status}
                        onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-full border cursor-pointer ${
                          app.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          app.status === 'Cancelled' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                          app.status === 'Rescheduled' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                          'bg-sky-100 text-sky-800 border-sky-300'
                        }`}
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Rescheduled">Rescheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => openRescheduleModal(app)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-all"
                      >
                        <Edit3 className="w-3 h-3" /> Reschedule / Reassign
                      </button>
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400 italic">
                      No appointments scheduled yet. Click "Book Appointment" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Client Directory Roster */}
      {activeTab === 'clients' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-sky-600" />
              Registered Clients Roster
            </h2>
            <button
              onClick={() => setShowIntakeForm(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 px-3 py-1.5 rounded-lg shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" /> Register Client
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="p-3">Client Code</th>
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Age / Gender</th>
                  <th className="p-3">Phone & Email</th>
                  <th className="p-3">Assigned Psychologist</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-800">{c.client_code}</td>
                    <td className="p-3 font-bold text-slate-900">{c.full_name}</td>
                    <td className="p-3 text-slate-600">{c.age} yrs ({c.gender})</td>
                    <td className="p-3">
                      <div>{c.phone}</div>
                      <div className="text-[10px] text-slate-400">{c.email}</div>
                    </td>
                    <td className="p-3 font-semibold text-sky-700">
                      {c.assigned_psychologist_detail?.user?.name ? `Dr. ${c.assigned_psychologist_detail.user.name}` : 'Unassigned'}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setShowBookingModal(true)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg"
                      >
                        <Calendar className="w-3 h-3" /> Book Appointment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Intake Modal */}
      {showIntakeForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-sky-600" />
              New Client Registration Form
            </h3>

            <form onSubmit={handleRegisterClient} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value, 10))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assign Psychologist</label>
                <select
                  value={assignedPsychologistId}
                  onChange={(e) => setAssignedPsychologistId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="">-- Assign Later --</option>
                  {therapists.map(t => (
                    <option key={t.id} value={t.id}>Dr. {t.user?.name} ({t.specialization})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowIntakeForm(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg"
                >
                  Register Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointment Booking Modal */}
      {showBookingModal && (
        <AppointmentBookingModal
          clients={clients}
          therapists={therapists}
          onClose={() => setShowBookingModal(false)}
          onSuccess={fetchCCDData}
        />
      )}

      {/* Reschedule / Reassign Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-sky-600" />
                Reschedule or Reassign Appointment
              </h3>
              <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            {rescheduleError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{rescheduleError}</span>
              </div>
            )}

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reassign Psychologist</label>
                <select
                  value={reassignPsychologistId}
                  onChange={(e) => setReassignPsychologistId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                >
                  {therapists.map((t) => (
                    <option key={t.id} value={t.id}>
                      Dr. {t.user?.name} ({t.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Appointment Date & Time</label>
                <input
                  type="datetime-local"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingApp}
                  className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm"
                >
                  {updatingApp ? 'Validating Slot...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
