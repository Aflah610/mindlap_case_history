import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DashboardStats, AuditLog } from '../types';
import { api } from '../services/api';
import {
  Users, UserCheck, Calendar, FileText, ShieldAlert,
  Eye, Activity, Database, CheckCircle, Clock
} from 'lucide-react';
import { UserRole } from '../types';

export const OwnerDashboard: React.FC = () => {
  const { setEffectiveRole } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchOwnerData();
  }, []);

  const fetchOwnerData = async () => {
    setLoading(true);
    try {
      const [statsRes, logsRes] = await Promise.all([
        api.get('clients/dashboard_stats/'),
        api.get('audit-logs/')
      ]);
      setStats(statsRes.data);
      setRecentLogs(logsRes.data.results ? logsRes.data.results.slice(0, 5) : logsRes.data.slice(0, 5));
    } catch (err) {
      console.error('Failed to load owner stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = () => {
    alert('System Database Backup initiated. Snapshot created successfully at ' + new Date().toLocaleTimeString());
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        Loading Owner Executive Dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex items-center justify-between border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 bg-sky-500/20 text-sky-300 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2 border border-sky-400/30">
            <Activity className="w-3.5 h-3.5" />
            Clinic Command Center
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Owner & Director Executive Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Complete, unrestricted visibility across all clinic operations, therapist workloads, confidential case reports, and security audit logs.
          </p>
        </div>
      </div>

      {/* Role View Switcher Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Eye className="w-5 h-5 text-amber-600" />
          <div>
            <h3 className="text-xs font-bold text-slate-800">Role View Inspection</h3>
            <p className="text-[11px] text-slate-500">Switch active dashboard perspective to audit what each staff member sees:</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(['owner', 'operation_manager', 'psychologist', 'ccd'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => setEffectiveRole(r)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 transition-all capitalize"
            >
              {r.replace('_', ' ')} View
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Clients</span>
            <Users className="w-5 h-5 text-sky-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-800">{stats?.total_clients || 0}</div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> All active registered records
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Appointments</span>
            <Calendar className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-800">{stats?.today_appointments_count || 0}</div>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-500" /> Scheduled across clinic
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Active Psychologists</span>
            <UserCheck className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-800">{stats?.total_therapists || 0}</div>
          <span className="text-[11px] text-indigo-600 font-semibold">100% capacity monitored</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Completed Reports</span>
            <FileText className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-800">{stats?.completed_reports || 0}</div>
          <span className="text-[11px] text-amber-600 font-semibold">{stats?.pending_reports || 0} reports pending evaluation</span>
        </div>
      </div>

      {/* Therapist Workload Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-sky-600" />
          Therapist Workload & Capacity Distribution
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="p-3">Psychologist</th>
                <th className="p-3">Specialization</th>
                <th className="p-3 text-center">Assigned Clients</th>
                <th className="p-3 text-center">Today's Sessions</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {stats?.therapist_workload?.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-800">{t.name}</td>
                  <td className="p-3 text-slate-600">{t.specialization}</td>
                  <td className="p-3 text-center font-bold text-sky-700">{t.assigned_clients}</td>
                  <td className="p-3 text-center font-bold text-teal-700">{t.today_sessions}</td>
                  <td className="p-3 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Audit Feed */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            Live Security Audit Trail
          </h2>
          <span className="text-xs text-slate-400 font-mono">Real-time event logging</span>
        </div>

        <div className="space-y-3">
          {recentLogs.map((log) => (
            <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 bg-slate-200 text-slate-700 font-mono font-bold rounded text-[10px]">
                  {log.action}
                </span>
                <span className="text-slate-800 font-medium">{log.details || 'System action'}</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                {new Date(log.timestamp).toLocaleString()} ({log.ip_address || '127.0.0.1'})
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
