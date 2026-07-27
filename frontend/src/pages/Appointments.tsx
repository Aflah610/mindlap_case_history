import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Appointment, Client, Psychologist } from '../types';
import { Calendar, PlusCircle, RefreshCw } from 'lucide-react';
import { AppointmentBookingModal } from '../components/AppointmentBookingModal';

export const Appointments: React.FC = () => {
  const { role } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [therapists, setTherapists] = useState<Psychologist[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [role]);

  const fetchData = async () => {
    try {
      const [appRes, clientsRes, psyRes] = await Promise.all([
        api.get('appointments/'),
        api.get('clients/'),
        api.get('auth/psychologists/')
      ]);
      setAppointments(appRes.data.results || appRes.data || []);
      setClients(clientsRes.data.results || clientsRes.data || []);
      setTherapists(psyRes.data.results || psyRes.data || []);
    } catch (e) {
      console.error('Failed to load appointments:', e);
    }
  };

  const handleUpdateStatus = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'Scheduled' ? 'Completed' : 'Scheduled';
    try {
      await api.patch(`appointments/${id}/`, { status: nextStatus });
      fetchData();
    } catch (e) {
      alert('Failed to update status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Appointment Management</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Schedule therapy sessions, track status, and prevent double-booking conflicts
          </p>
        </div>
        <button
          onClick={() => setShowBookingModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" /> Schedule Consultation
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-3">Client Name</th>
              <th className="px-6 py-3">Psychologist</th>
              <th className="px-6 py-3">Date & Time</th>
              <th className="px-6 py-3">Remarks</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {appointments.map((apt) => (
              <tr key={apt.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-bold text-slate-900">
                  {apt.client_detail?.full_name || `Client #${apt.client}`} <br/>
                  <span className="font-mono text-[10px] font-normal text-slate-400">{apt.client_detail?.client_code}</span>
                </td>
                <td className="px-6 py-4 text-sky-700 font-semibold">
                  {apt.psychologist_detail?.user?.name ? `Dr. ${apt.psychologist_detail.user.name}` : 'Unassigned'}
                </td>
                <td className="px-6 py-4 font-mono text-slate-700">
                  {new Date(apt.appointment_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                </td>
                <td className="px-6 py-4 text-slate-500">{apt.remarks || 'Intake / Follow-up session'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    apt.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                    apt.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                    apt.status === 'Rescheduled' ? 'bg-amber-100 text-amber-800' :
                    'bg-sky-100 text-sky-800'
                  }`}>
                    {apt.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleUpdateStatus(apt.id, apt.status)}
                    className="px-3 py-1 text-[11px] font-bold border border-slate-300 hover:bg-slate-100 rounded-md"
                  >
                    Toggle Status
                  </button>
                </td>
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-6 text-center text-slate-400 italic">
                  No appointments booked yet. Click "Book Appointment" above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showBookingModal && (
        <AppointmentBookingModal
          clients={clients}
          therapists={therapists}
          onClose={() => setShowBookingModal(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
};
