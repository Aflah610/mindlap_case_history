import React, { useEffect, useState } from 'react';
import { Appointment, Psychologist, Client } from '../types';
import { api } from '../services/api';
import { TherapistScheduleMonitor } from '../components/TherapistScheduleMonitor';
import {
  Calendar, Users, UserCheck, Clock, CheckCircle2,
  AlertCircle, ArrowRightLeft, RefreshCw
} from 'lucide-react';

export const OperationManagerDashboard: React.FC = () => {
  const [therapists, setTherapists] = useState<Psychologist[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchManagerData();
  }, []);

  const fetchManagerData = async () => {
    setLoading(true);
    try {
      const [therapistsRes, appRes, clientsRes] = await Promise.all([
        api.get('auth/psychologists/'),
        api.get('appointments/'),
        api.get('clients/')
      ]);
      setTherapists(therapistsRes.data.results || therapistsRes.data);
      setAppointments(appRes.data.results || appRes.data);
      setClients(clientsRes.data.results || clientsRes.data);
    } catch (err) {
      console.error('Failed to load Operation Manager dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        Loading Operations Command Center...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 rounded-2xl p-6 text-white shadow-xl flex items-center justify-between border border-teal-800/40">
        <div>
          <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-300 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2 border border-teal-400/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Operations Command Center
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Operation Manager Dashboard</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Control daily clinic scheduling, monitor therapist availability, reassign client sessions, and supervise clinical workflow progress.
          </p>
        </div>

        <button
          onClick={fetchManagerData}
          className="flex items-center gap-2 bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Operations
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Scheduled Today</span>
            <Calendar className="w-5 h-5 text-sky-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-800">{appointments.length}</div>
          <span className="text-[11px] text-sky-600 font-semibold">Active consultations</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Therapists</span>
            <UserCheck className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-800">{therapists.length}</div>
          <span className="text-[11px] text-teal-600 font-semibold">On-duty today</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Clients Intake</span>
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-800">{clients.length}</div>
          <span className="text-[11px] text-indigo-600 font-semibold">Registered in system</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Reassignments</span>
            <ArrowRightLeft className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-800">0</div>
          <span className="text-[11px] text-emerald-600 font-semibold">All slots balanced</span>
        </div>
      </div>

      {/* Centralized Schedule Monitor Component */}
      <TherapistScheduleMonitor
        therapists={therapists}
        appointments={appointments}
        onRefresh={fetchManagerData}
      />
    </div>
  );
};
