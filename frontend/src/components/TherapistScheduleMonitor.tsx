import React, { useState } from 'react';
import { Appointment, Psychologist } from '../types';
import { Calendar as CalendarIcon, Clock, User, ArrowRightLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

interface TherapistScheduleMonitorProps {
  therapists: Psychologist[];
  appointments: Appointment[];
  onRefresh: () => void;
}

export const TherapistScheduleMonitor: React.FC<TherapistScheduleMonitorProps> = ({
  therapists,
  appointments,
  onRefresh
}) => {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [newPsychologistId, setNewPsychologistId] = useState<string>('');
  const [isReassigning, setIsReassigning] = useState<boolean>(false);

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '11:30 AM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  const handleReassignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment || !newPsychologistId) return;

    setIsReassigning(true);
    try {
      await api.patch(`appointments/${selectedAppointment.id}/reassign/`, {
        psychologist_id: newPsychologistId
      });
      setSelectedAppointment(null);
      onRefresh();
    } catch (err) {
      alert('Failed to reassign therapist.');
    } finally {
      setIsReassigning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-sky-600" />
            Centralized Therapist Scheduling Monitor
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time schedule grid showing therapist workload, bookings, and instant re-assignment control.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {therapists.length} Active Psychologists
          </span>
        </div>
      </div>

      {/* Grid view across therapists */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {therapists.map((therapist) => {
          const therapistApps = appointments.filter(a => a.psychologist === therapist.id || a.psychologist_detail?.id === therapist.id);

          return (
            <div key={therapist.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              {/* Therapist Header */}
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-sm">
                    {therapist.user?.name ? therapist.user.name[0] : 'D'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold leading-none">{therapist.user?.name ? `Dr. ${therapist.user.name}` : 'Psychologist'}</h3>
                    <span className="text-[11px] text-sky-300">{therapist.specialization}</span>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-800 rounded-full text-slate-300">
                  {therapistApps.length} Booked
                </span>
              </div>

              {/* Time Slots */}
              <div className="p-4 flex-1 space-y-3 bg-slate-50/50">
                {therapistApps.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 italic">
                    No appointments scheduled for today.
                  </div>
                ) : (
                  therapistApps.map((app) => {
                    const timeFormatted = new Date(app.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return (
                      <div
                        key={app.id}
                        className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-sky-300 transition-all flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md">
                            <Clock className="w-3 h-3" />
                            {timeFormatted}
                          </span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {app.mode || 'Offline'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              {app.client_detail?.full_name || `Client #${app.client}`}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {app.consultation_type || 'Initial Consultation'}
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedAppointment(app);
                              setNewPsychologistId(therapists.find(t => t.id !== therapist.id)?.id.toString() || '');
                            }}
                            className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                            title="Reassign to another therapist"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reassign Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-sky-700">
              <ArrowRightLeft className="w-6 h-6" />
              <h3 className="text-lg font-bold">Reassign Therapist</h3>
            </div>
            <p className="text-xs text-slate-600">
              Reassign appointment for <span className="font-bold text-slate-800">{selectedAppointment.client_detail?.full_name}</span>.
            </p>

            <form onSubmit={handleReassignSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select New Psychologist</label>
                <select
                  value={newPsychologistId}
                  onChange={(e) => setNewPsychologistId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                  required
                >
                  <option value="">-- Choose Psychologist --</option>
                  {therapists.map(t => (
                    <option key={t.id} value={t.id}>
                      Dr. {t.user?.name} ({t.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedAppointment(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReassigning}
                  className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors shadow-sm"
                >
                  {isReassigning ? 'Reassigning...' : 'Confirm Reassignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
