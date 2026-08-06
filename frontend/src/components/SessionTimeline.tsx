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
        psychologist: client.assigned_psychologist || null,
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
      setClinicalObservation('');
      setProgress('');
      setHomework('');
      setTreatmentRecommendation('');
      setFollowUpDate('');
      onRefresh();
    } catch (err: any) {
      console.error('Save session note error:', err);
      const serverErr = err.response?.data
        ? (typeof err.response.data === 'object' ? JSON.stringify(err.response.data) : err.response.data)
        : (err.message || 'Please check inputs.');
      alert(`Failed to save session note: ${serverErr}`);
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
            Therapy Session Timeline — {client.full_name} ({client.client_code})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Chronological clinical log of therapy sessions, progress notes, and follow-up plans</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Session Note
        </button>
      </div>

      {/* Session Counter Tracker Banner */}
      <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-600 text-white rounded-xl font-black text-sm">
            #{sessionNotes.length + 1}
          </div>
          <div>
            <div className="font-extrabold text-slate-800">
              Total Sessions Already Written: <span className="text-purple-700 font-extrabold">{sessionNotes.length} Sessions</span>
            </div>
            <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
              Next Session You Are Writing: <strong className="text-purple-900 font-black">Session #{sessionNotes.length + 1}</strong>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Session Note #{sessionNotes.length + 1}
        </button>
      </div>

      {/* Timeline View */}
      {sessionNotes.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 italic">
          No therapy session notes recorded yet. Click "Add Session Note" to begin clinical logs for Session #1.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="relative border-l-2 border-sky-200 pl-6 ml-3 space-y-6">
            {sessionNotes.map((sn, idx) => (
              <div key={sn.id} className="relative group">
                {/* Timeline Marker */}
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-sky-600 border-2 border-white shadow-sm" />

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold bg-purple-100 text-purple-800 px-3 py-0.5 rounded-full">
                        Session #{sn.session_number || (idx + 1)}
                      </span>
                      <span className="text-xs font-bold text-slate-800">Date: {sn.session_date}</span>
                      <span className="text-[11px] text-slate-500">({sn.duration || '50 mins'})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        sn.risk_level === 'High' || sn.risk_level === 'Severe'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        Risk: {sn.risk_level || 'Low'}
                      </span>
                      {sn.follow_up_date && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                          Follow-up: {sn.follow_up_date}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Session Notes & Progress */}
                  <div className="space-y-2 text-xs text-slate-700">
                    <div>
                      <span className="font-extrabold uppercase text-[10px] text-slate-400 block mb-0.5">Session Summary & Notes</span>
                      <div className="font-medium bg-white p-2.5 rounded-xl border border-slate-200">{sn.notes}</div>
                    </div>

                    {sn.clinical_observation && (
                      <div>
                        <span className="font-extrabold uppercase text-[10px] text-slate-400 block mb-0.5">Clinical Observation</span>
                        <div className="font-medium text-slate-700 italic bg-white p-2.5 rounded-xl border border-slate-200">{sn.clinical_observation}</div>
                      </div>
                    )}

                    {sn.progress && (
                      <div>
                        <span className="font-extrabold uppercase text-[10px] text-slate-400 block mb-0.5">Therapeutic Progress</span>
                        <div className="font-medium text-emerald-800 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">{sn.progress}</div>
                      </div>
                    )}

                    {sn.treatment_recommendation && (
                      <div>
                        <span className="font-extrabold uppercase text-[10px] text-slate-400 block mb-0.5">Next Plan / Recommendation</span>
                        <div className="font-medium text-sky-900 bg-sky-50/60 p-2.5 rounded-xl border border-sky-100">{sn.treatment_recommendation}</div>
                      </div>
                    )}

                    {sn.homework && (
                      <div className="p-2.5 bg-purple-50/60 border border-purple-100 rounded-xl text-xs text-purple-900 font-medium flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-purple-600 shrink-0" />
                        <span><strong>Homework Assigned:</strong> {sn.homework}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Confidentiality Footer Banner */}
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-center text-[11px] font-extrabold text-purple-800 tracking-wide">
            CONFIDENTIAL – This document contains sensitive therapeutic information intended only for authorized clinical use by Mindlap.
          </div>
        </div>
      )}

      {/* Add Session Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-600" />
                Writing Therapy Session Note #{sessionNotes.length + 1}
              </h3>
              <div className="mt-2 p-2.5 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between text-xs">
                <span className="text-purple-900 font-bold">Sessions Already Written: <strong>{sessionNotes.length}</strong></span>
                <span className="text-purple-700 font-extrabold bg-purple-200/70 px-2.5 py-0.5 rounded-full text-[11px]">
                  Creating Session #{sessionNotes.length + 1}
                </span>
              </div>
            </div>

            <form onSubmit={handleCreateSessionNote} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Session Date</label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Session Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Session Notes & Summary <span className="text-rose-500">*</span></label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Previous homework reviewed, client triggers, coping responses..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Clinical Observation</label>
                <textarea
                  rows={2}
                  value={clinicalObservation}
                  onChange={(e) => setClinicalObservation(e.target.value)}
                  placeholder="Preoccupied with intrusive thoughts, reassurance seeking observed..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Therapeutic Progress</label>
                <input
                  type="text"
                  value={progress}
                  onChange={(e) => setProgress(e.target.value)}
                  placeholder="Client showed improved awareness of intrusive thoughts and compulsive behavior..."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Homework</label>
                  <input
                    type="text"
                    value={homework}
                    onChange={(e) => setHomework(e.target.value)}
                    placeholder="Thought journal entries / Labelling technique"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Risk Observation Level</label>
                  <select
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    <option value="Low">Low Risk</option>
                    <option value="Moderate">Moderate Risk</option>
                    <option value="High">High Risk</option>
                    <option value="Severe">Severe Risk</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Next Plan / Recommendation</label>
                  <input
                    type="text"
                    value={treatmentRecommendation}
                    onChange={(e) => setTreatmentRecommendation(e.target.value)}
                    placeholder="Labelling technique / Behavioural activation"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Follow-up Date</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm"
                >
                  {submitting ? 'Saving Session...' : 'Save Session Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
