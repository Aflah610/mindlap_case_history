import React, { useState } from 'react';
import { SessionNote, Client } from '../types';
import { api } from '../services/api';
import { Clock, Plus, BookOpen, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface SessionTimelineProps {
  client: Client;
  sessionNotes: SessionNote[];
  onRefresh: () => void;
}

export const SessionTimeline: React.FC<SessionTimelineProps> = ({
  client,
  sessionNotes,
  onRefresh
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState<string>('50 mins');
  const [notes, setNotes] = useState<string>('');
  const [clinicalObservation, setClinicalObservation] = useState<string>('');
  const [progress, setProgress] = useState<string>('');
  const [riskLevel, setRiskLevel] = useState<'Low' | 'Moderate' | 'High' | 'Severe'>('Low');
  const [homework, setHomework] = useState<string>('');
  const [treatmentRecommendation, setTreatmentRecommendation] = useState<string>('');
  const [followUpDate, setFollowUpDate] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleCreateSessionNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post('session-notes/', {
        client: client.id,
        psychologist: client.assigned_psychologist || 1,
        session_number: sessionNotes.length + 1,
        session_date: sessionDate,
        duration: duration,
        notes: notes,
        clinical_observation: clinicalObservation,
        progress: progress,
        risk_level: riskLevel,
        homework: homework,
        treatment_recommendation: treatmentRecommendation,
        follow_up_date: followUpDate || null
      });

      setShowAddModal(false);
      setNotes('');
      setHomework('');
      onRefresh();
    } catch (err) {
      alert('Failed to save session note.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-sky-600" />
            Therapy Session Notes Timeline — {client.full_name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Chronological log of clinical sessions and progress tracking</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Session Note
        </button>
      </div>

      {/* Timeline View */}
      {sessionNotes.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 italic">
          No therapy session notes recorded yet.
        </div>
      ) : (
        <div className="relative border-l-2 border-slate-200 pl-6 ml-3 space-y-6">
          {sessionNotes.map((sn, idx) => (
            <div key={sn.id} className="relative group">
              {/* Timeline Marker */}
              <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-sky-600 border-2 border-white shadow-sm" />

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full">
                      Session #{sn.session_number || (idx + 1)}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{sn.session_date}</span>
                    <span className="text-[10px] text-slate-500">({sn.duration})</span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    sn.risk_level === 'High' || sn.risk_level === 'Severe'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    Risk: {sn.risk_level || 'Low'}
                  </span>
                </div>

                <div className="text-xs text-slate-700 leading-relaxed font-medium">
                  {sn.notes}
                </div>

                {sn.homework && (
                  <div className="p-2.5 bg-sky-50/60 border border-sky-100 rounded-lg text-xs text-sky-900 font-medium flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-sky-600 shrink-0" />
                    <span><strong>Homework Assigned:</strong> {sn.homework}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Session Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <Plus className="w-5 h-5 text-sky-600" />
              Add Therapy Session Note #{sessionNotes.length + 1}
            </h3>

            <form onSubmit={handleCreateSessionNote} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Session Date</label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Session Clinical Notes</label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detailed notes of therapeutic interventions and client responses..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Homework</label>
                  <input
                    type="text"
                    value={homework}
                    onChange={(e) => setHomework(e.target.value)}
                    placeholder="e.g. CBT Thought Record"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Risk Assessment Level</label>
                  <select
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="Low">Low Risk</option>
                    <option value="Moderate">Moderate Risk</option>
                    <option value="High">High Risk</option>
                    <option value="Severe">Severe Risk</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Next Follow-up Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg"
                >
                  Save Session Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
