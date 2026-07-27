import React, { useState } from 'react';
import { Client, Psychologist } from '../types';
import { Calendar, Clock, User, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

interface AppointmentBookingModalProps {
  clients: Client[];
  therapists: Psychologist[];
  onClose: () => void;
  onSuccess: () => void;
}

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  clients,
  therapists,
  onClose,
  onSuccess
}) => {
  const [clientId, setClientId] = useState<string>('');
  const [psychologistId, setPsychologistId] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [consultationType, setConsultationType] = useState<'Initial Consultation' | 'Follow-up'>('Initial Consultation');
  const [mode, setMode] = useState<'Offline' | 'Online'>('Offline');
  const [remarks, setRemarks] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      await api.post('appointments/', {
        client: parseInt(clientId, 10),
        psychologist: parseInt(psychologistId, 10),
        appointment_date: appointmentDate,
        consultation_type: consultationType,
        mode: mode,
        remarks: remarks,
        status: 'Scheduled'
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err.response?.data?.non_field_errors) {
        setErrorMsg(err.response.data.non_field_errors[0]);
      } else if (err.response?.data?.detail) {
        setErrorMsg(err.response.data.detail);
      } else {
        setErrorMsg('Double booking error! This psychologist is already booked at this time slot.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3 text-sky-700">
            <Calendar className="w-6 h-6" />
            <div>
              <h3 className="text-base font-extrabold text-slate-800">Book Client Appointment</h3>
              <p className="text-[11px] text-slate-500">Conflict-validated consultation scheduling</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Client</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500 font-medium"
              required
            >
              <option value="">-- Choose Client --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name} ({c.client_code}) - {c.phone}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Psychologist</label>
            <select
              value={psychologistId}
              onChange={(e) => setPsychologistId(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500 font-medium"
              required
            >
              <option value="">-- Choose Psychologist --</option>
              {therapists.map((t) => (
                <option key={t.id} value={t.id}>
                  Dr. {t.user?.name} ({t.specialization})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Appointment Date & Time</label>
              <input
                type="datetime-local"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as 'Offline' | 'Online')}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500 font-medium"
              >
                <option value="Offline">Offline (In-Clinic)</option>
                <option value="Online">Online Video Session</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Type</label>
            <select
              value={consultationType}
              onChange={(e) => setConsultationType(e.target.value as any)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500 font-medium"
            >
              <option value="Initial Consultation">Initial Intake Consultation</option>
              <option value="Follow-up">Follow-up Session</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Booking Notes / Remarks</label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. First visit intake, requested morning slot..."
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors shadow-sm"
            >
              {submitting ? 'Checking Availability...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
