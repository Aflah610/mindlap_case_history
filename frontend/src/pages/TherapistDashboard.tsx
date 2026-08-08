import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Client, Appointment, CaseHistory } from '../types';
import { api } from '../services/api';
import { TherapistPersonalCalendar } from '../components/TherapistPersonalCalendar';
import {
  Users, Calendar, FileText, Download, CheckCircle, Clock,
  ChevronRight, Plus, ShieldCheck, HeartPulse, RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const TherapistDashboard: React.FC = () => {
  const { user } = useAuth();
  const [assignedClients, setAssignedClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchTherapistData();
  }, []);

  const fetchTherapistData = async () => {
    setLoading(true);
    try {
      const [clientsRes, appRes] = await Promise.all([
        api.get('clients/'),
        api.get('appointments/')
      ]);
      setAssignedClients(clientsRes.data.results || clientsRes.data);
      setAppointments(appRes.data.results || appRes.data);
    } catch (err) {
      console.error('Failed to load therapist data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        Loading Psychologist Clinical Workspace...
      </div>
    );
  }

  const todayAppointmentsCount = appointments.filter(app => {
    if (!app.appointment_date) return false;
    const d = new Date(app.appointment_date);
    const today = new Date();
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  }).length;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-sky-950 rounded-2xl p-6 text-white shadow-xl flex items-center justify-between border border-sky-800/40">
        <div>
          <div className="inline-flex items-center gap-2 bg-sky-500/20 text-sky-300 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2 border border-sky-400/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            Clinical Practice Portal
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Therapist Workspace Dashboard</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            View assigned client rosters, manage session schedules, conduct clinical assessments, and author progress notes.
          </p>
        </div>

        <button
          onClick={fetchTherapistData}
          className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Dashboard
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">My Assigned Clients</span>
            <Users className="w-5 h-5 text-sky-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-800">{assignedClients.length}</div>
          <span className="text-[11px] text-sky-600 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" /> Isolated patient roster
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Sessions</span>
            <Calendar className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-800">{todayAppointmentsCount}</div>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-500" /> Scheduled consultations
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Clinical Evaluations</span>
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-800">{assignedClients.length}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">Protected patient records</span>
        </div>
      </div>

      {/* Personal Google Calendar View Component */}
      <TherapistPersonalCalendar appointments={appointments} />

      {/* My Patients List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-600" />
            My Active Patient Cases
          </h2>
          <Link to="/clients" className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignedClients.map((client) => (
            <div key={client.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-sky-300 transition-all flex items-center justify-between">
              <div>
                <div className="text-xs font-extrabold text-slate-800">{client.full_name} ({client.client_code})</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{client.gender}, {client.age} yrs • {client.occupation || 'N/A'}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-1">{client.phone}</div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/case-histories"
                  className="px-3 py-1.5 bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold rounded-lg text-xs transition-colors"
                >
                  View Case History
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
