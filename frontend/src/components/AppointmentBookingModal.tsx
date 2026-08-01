import React, { useState, useMemo } from 'react';
import { Client, Psychologist } from '../types';
import { Calendar, Clock, User, ShieldAlert, CheckCircle2, AlertTriangle, Search, Check } from 'lucide-react';
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
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [clientId, setClientId] = useState<string>('');
  const [clientSearch, setClientSearch] = useState<string>('');
  const [psychologistId, setPsychologistId] = useState<string>('');

  // 12-Hour AM/PM Time Range States ("This Time to This Time")
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [startHour, setStartHour] = useState<string>('10');
  const [startMinute, setStartMinute] = useState<string>('00');
  const [startPeriod, setStartPeriod] = useState<'AM' | 'PM'>('AM');

  const [endHour, setEndHour] = useState<string>('11');
  const [endMinute, setEndMinute] = useState<string>('00');
  const [endPeriod, setEndPeriod] = useState<'AM' | 'PM'>('AM');

  const [consultationType, setConsultationType] = useState<'Initial Consultation' | 'Follow-up'>('Initial Consultation');
  const [mode, setMode] = useState<'Offline' | 'Online'>('Offline');
  const [remarks, setRemarks] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Filter clients dynamically based on clientSearch input
  const filteredClients = useMemo(() => {
    if (!clientSearch.trim()) return clients;
    const q = clientSearch.toLowerCase();
    return clients.filter(c =>
      c.full_name.toLowerCase().includes(q) ||
      (c.client_code && c.client_code.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q))
    );
  }, [clients, clientSearch]);

  const selectedClient = clients.find(c => String(c.id) === clientId);

  const convertTo24Hour = (hourStr: string, period: 'AM' | 'PM') => {
    let h = parseInt(hourStr, 10);
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return String(h).padStart(2, '0');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!clientId) {
      setErrorMsg('Please search and select a client for this consultation.');
      return;
    }
    if (!psychologistId) {
      setErrorMsg('Please select an assigned psychologist.');
      return;
    }
    setSubmitting(true);

    try {
      const start24 = convertTo24Hour(startHour, startPeriod);
      const isoDate = `${selectedDate}T${start24}:${startMinute}:00Z`;
      const timeRangeLabel = `${startHour}:${startMinute} ${startPeriod} to ${endHour}:${endMinute} ${endPeriod}`;
      const updatedRemarks = remarks.trim() ? `[Slot: ${timeRangeLabel}] ${remarks}` : `[Slot: ${timeRangeLabel}]`;

      await api.post('appointments/', {
        client: parseInt(clientId, 10),
        psychologist: parseInt(psychologistId, 10),
        appointment_date: isoDate,
        consultation_type: consultationType,
        mode: mode,
        remarks: updatedRemarks,
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
        setErrorMsg('Double-booking conflict! This psychologist is already scheduled at this time slot.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3 text-sky-700">
            <div className="p-2.5 bg-sky-100 text-sky-700 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">Schedule Consultation</h3>
              <p className="text-[11px] font-semibold text-slate-500">Intake scheduling & psychologist assignment</p>
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
          {/* Searchable Client Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Search & Choose Client <span className="text-rose-500">*</span>
            </label>

            {/* Search Input Box */}
            <div className="relative mb-2">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder="Search by client name, code (e.g. CLI-101), or phone..."
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500 font-medium"
              />
            </div>

            {/* Selected Client Badge */}
            {selectedClient && (
              <div className="p-2.5 mb-2 bg-sky-50 border border-sky-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-sky-600" />
                  <div>
                    <span className="font-bold text-slate-900">{selectedClient.full_name}</span>{' '}
                    <span className="font-mono text-[10px] text-sky-700">({selectedClient.client_code})</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" /> Selected
                </span>
              </div>
            )}

            {/* Scrollable Client Selection List */}
            <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
              {filteredClients.map((c) => {
                const isSelected = String(c.id) === clientId;
                return (
                  <div
                    key={c.id}
                    onClick={() => setClientId(String(c.id))}
                    className={`p-2.5 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected ? 'bg-sky-50 font-bold text-sky-900' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold">{c.full_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {c.client_code} • {c.phone || 'No Phone'} • {c.gender}, {c.age} y/o
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-sky-600 shrink-0" />}
                  </div>
                );
              })}
              {filteredClients.length === 0 && (
                <div className="p-3 text-center text-xs text-slate-400 italic">
                  No clients match "{clientSearch}"
                </div>
              )}
            </div>
          </div>

          {/* Psychologist Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Psychologist <span className="text-rose-500">*</span></label>
            <select
              value={psychologistId}
              onChange={(e) => setPsychologistId(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500 font-medium"
              required
            >
              <option value="">-- Select Psychologist --</option>
              {therapists.map((t) => (
                <option key={t.id} value={t.id}>
                  Dr. {t.user?.name} ({t.specialization})
                </option>
              ))}
            </select>
          </div>

          {/* Date & Mode Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Consultation Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500 font-semibold text-slate-800"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as 'Offline' | 'Online')}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500 font-medium text-slate-800"
              >
                <option value="Offline">Offline (In-Clinic Session)</option>
                <option value="Online">Online (Video Consultation)</option>
              </select>
            </div>
          </div>

          {/* 12-Hour AM/PM Time Range Picker ("This Time to This Time") */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-600" />
                Select Consultation Time Slot
              </label>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">
                12-Hour AM / PM Format
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              {/* Start Time */}
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Start Time</span>
                <div className="flex items-center gap-1">
                  <select
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                    className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-sky-500"
                  >
                    {['01','02','03','04','05','06','07','08','09','10','11','12'].map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <span className="font-bold text-slate-400">:</span>
                  <select
                    value={startMinute}
                    onChange={(e) => setStartMinute(e.target.value)}
                    className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-sky-500"
                  >
                    {['00','15','30','45'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setStartPeriod(startPeriod === 'AM' ? 'PM' : 'AM')}
                    className={`text-xs px-2.5 py-1.5 rounded-lg font-extrabold transition-all shadow-sm ${
                      startPeriod === 'AM'
                        ? 'bg-amber-500 text-white hover:bg-amber-600'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {startPeriod}
                  </button>
                </div>
              </div>

              {/* End Time */}
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">End Time</span>
                <div className="flex items-center gap-1">
                  <select
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}
                    className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-sky-500"
                  >
                    {['01','02','03','04','05','06','07','08','09','10','11','12'].map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <span className="font-bold text-slate-400">:</span>
                  <select
                    value={endMinute}
                    onChange={(e) => setEndMinute(e.target.value)}
                    className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:border-sky-500"
                  >
                    {['00','15','30','45'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setEndPeriod(endPeriod === 'AM' ? 'PM' : 'AM')}
                    className={`text-xs px-2.5 py-1.5 rounded-lg font-extrabold transition-all shadow-sm ${
                      endPeriod === 'AM'
                        ? 'bg-amber-500 text-white hover:bg-amber-600'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {endPeriod}
                  </button>
                </div>
              </div>
            </div>

            {/* Active Schedule Range Summary Badge */}
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-2.5 flex items-center justify-between text-xs font-bold text-sky-900">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Selected Slot:
              </span>
              <span className="bg-white px-2.5 py-1 rounded-lg border border-sky-200 font-mono text-sky-800 text-xs shadow-xs">
                {startHour}:{startMinute} {startPeriod} to {endHour}:{endMinute} {endPeriod}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Consultation Type</label>
            <select
              value={consultationType}
              onChange={(e) => setConsultationType(e.target.value as any)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500 font-medium"
            >
              <option value="Initial Consultation">Initial Intake Consultation</option>
              <option value="Follow-up">Follow-up Therapy Session</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Scheduling Remarks / Notes</label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Requested morning slot, first consultation intake..."
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl transition-colors shadow-sm"
            >
              {submitting ? 'Verifying Schedule...' : 'Schedule Consultation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

