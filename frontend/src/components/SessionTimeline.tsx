import React, { useState } from 'react';
import { SessionNote, Client } from '../types';
import { api } from '../services/api';
import { formatAppointmentDateTime } from '../utils/dateUtils';
import { Clock, Plus, BookOpen, Edit, Trash2, Eye, X, CheckCircle2, ShieldAlert, FileText, UserCheck } from 'lucide-react';

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
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<SessionNote | null>(null);
  const [viewingNote, setViewingNote] = useState<SessionNote | null>(null);

  // Form State
  const [sessionNumber, setSessionNumber] = useState<number>(sessionNotes.length + 1);
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState<string>('50 mins');
  const [notes, setNotes] = useState<string>('');
  const [clinicalObservation, setClinicalObservation] = useState<string>('');
  const [progress, setProgress] = useState<string>('');
  const [riskLevel, setRiskLevel] = useState<'Low' | 'Moderate' | 'High' | 'Severe'>('Low');
  const [homework, setHomework] = useState<string>('');
  const [treatmentRecommendation, setTreatmentRecommendation] = useState<string>('');
  const [followUpDate, setFollowUpDate] = useState<string>('');
  const [therapistSignature, setTherapistSignature] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const resetForm = () => {
    setEditingNote(null);
    setSessionNumber(sessionNotes.length + 1);
    setSessionDate(new Date().toISOString().split('T')[0]);
    setDuration('50 mins');
    setNotes('');
    setClinicalObservation('');
    setProgress('');
    setRiskLevel('Low');
    setHomework('');
    setTreatmentRecommendation('');
    setFollowUpDate('');
    setTherapistSignature('');
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowFormModal(true);
  };

  const handleOpenEditModal = (sn: SessionNote) => {
    setEditingNote(sn);
    setSessionNumber(sn.session_number || 1);
    setSessionDate(sn.session_date || new Date().toISOString().split('T')[0]);
    setDuration(sn.duration || '50 mins');
    setNotes(sn.notes || '');
    setClinicalObservation(sn.clinical_observation || '');
    setProgress(sn.progress || '');
    setRiskLevel(sn.risk_level || 'Low');
    setHomework(sn.homework || '');
    setTreatmentRecommendation(sn.treatment_recommendation || '');
    setFollowUpDate(sn.follow_up_date || '');
    setTherapistSignature(sn.therapist_signature || '');
    setShowFormModal(true);
  };

  const handleSaveSessionNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      client: client.id,
      psychologist: client.assigned_psychologist || null,
      session_number: sessionNumber,
      session_date: sessionDate,
      duration: duration,
      notes: notes,
      clinical_observation: clinicalObservation,
      progress: progress,
      risk_level: riskLevel,
      homework: homework,
      treatment_recommendation: treatmentRecommendation,
      follow_up_date: followUpDate || null,
      therapist_signature: therapistSignature
    };

    try {
      if (editingNote) {
        await api.put(`session-notes/${editingNote.id}/`, payload);
      } else {
        await api.post('session-notes/', payload);
      }

      setShowFormModal(false);
      resetForm();
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

  const handleDeleteSessionNote = async (sn: SessionNote) => {
    if (!window.confirm(`Are you sure you want to delete Session ${sn.session_number || ''} recorded on ${sn.session_date}?`)) {
      return;
    }
    try {
      await api.delete(`session-notes/${sn.id}/`);
      onRefresh();
    } catch (err: any) {
      console.error('Delete session note error:', err);
      alert('Failed to delete session note.');
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
      </div>

      {/* Session Counter Tracker Banner */}
      <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-600 text-white rounded-xl font-black text-sm">
            Session {sessionNotes.length + 1}
          </div>
          <div>
            <div className="font-extrabold text-slate-800">
              Total Sessions Already Written: <span className="text-purple-700 font-extrabold">{sessionNotes.length} Sessions</span>
            </div>
            <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
              Next Session You Are Writing: <strong className="text-purple-900 font-black">Session {sessionNotes.length + 1}</strong>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Session Note
        </button>
      </div>

      {/* Timeline View */}
      {sessionNotes.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          No therapy session notes recorded yet. Click "Add Session Note" to begin clinical logs for Session 1.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="relative border-l-2 border-sky-200 pl-6 ml-3 space-y-6">
            {sessionNotes.map((sn, idx) => (
              <div key={sn.id} className="relative group">
                {/* Timeline Marker */}
                <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-sky-600 border-2 border-white shadow-sm" />

                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3.5 shadow-2xs hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black bg-purple-100 text-purple-800 px-3 py-0.5 rounded-full border border-purple-200">
                        Session {sn.session_number || (idx + 1)}
                      </span>
                      <span className="text-xs font-bold text-slate-800">Date: {sn.session_date}</span>
                      <span className="text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                        Updated: {formatAppointmentDateTime(sn.created_at || sn.session_date)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        sn.risk_level === 'High' || sn.risk_level === 'Severe'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : sn.risk_level === 'Moderate'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        Risk: {sn.risk_level || 'Low'}
                      </span>
                      {sn.follow_up_date && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
                          Follow-up: {sn.follow_up_date}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Session Notes & Details Grid */}
                  <div className="space-y-2.5 text-xs text-slate-700">
                    <div>
                      <span className="font-extrabold uppercase text-[10px] text-slate-400 block mb-0.5 tracking-wider">Session Summary & Notes</span>
                      <div className="font-medium bg-white p-3 rounded-xl border border-slate-200 text-slate-800 whitespace-pre-line leading-relaxed">
                        {sn.notes}
                      </div>
                    </div>

                    {sn.clinical_observation && (
                      <div>
                        <span className="font-extrabold uppercase text-[10px] text-slate-400 block mb-0.5 tracking-wider">Clinical Observation</span>
                        <div className="font-medium text-slate-700 italic bg-white p-2.5 rounded-xl border border-slate-200">
                          {sn.clinical_observation}
                        </div>
                      </div>
                    )}

                    {sn.progress && (
                      <div>
                        <span className="font-extrabold uppercase text-[10px] text-slate-400 block mb-0.5 tracking-wider">Therapeutic Progress</span>
                        <div className="font-medium text-emerald-800 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                          {sn.progress}
                        </div>
                      </div>
                    )}

                    {sn.treatment_recommendation && (
                      <div>
                        <span className="font-extrabold uppercase text-[10px] text-slate-400 block mb-0.5 tracking-wider">Next Plan / Recommendation</span>
                        <div className="font-medium text-sky-900 bg-sky-50/60 p-2.5 rounded-xl border border-sky-100">
                          {sn.treatment_recommendation}
                        </div>
                      </div>
                    )}

                    {sn.homework && (
                      <div className="p-2.5 bg-purple-50/60 border border-purple-100 rounded-xl text-xs text-purple-900 font-medium flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-purple-600 shrink-0" />
                        <span><strong>Homework Assigned:</strong> {sn.homework}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Therapist: <strong>{sn.therapist_signature || sn.psychologist_detail?.user?.name || 'Assigned Clinician'}</strong></span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewingNote(sn)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100 rounded-lg transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Details
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(sn)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 rounded-lg transition-all"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSessionNote(sn)}
                        className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-all"
                        title="Delete Session Note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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

      {/* Add / Edit Session Note Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-purple-600" />
                  {editingNote ? `Editing Session Note #${sessionNumber}` : `Writing Therapy Session Note #${sessionNumber}`}
                </h3>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  Record detailed therapeutic notes, observations, progress, and homework
                </p>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSessionNote} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Session #</label>
                  <input
                    type="number"
                    min={1}
                    value={sessionNumber}
                    onChange={(e) => setSessionNumber(parseInt(e.target.value) || 1)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                    required
                  />
                </div>
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
                    placeholder="e.g. 50 mins"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Session Summary & Notes <span className="text-rose-500">*</span></label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Summarize main therapeutic topics discussed, client responses, cognitive restructuring, coping tools..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-sky-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Clinical Observation & Mental State</label>
                <textarea
                  rows={2}
                  value={clinicalObservation}
                  onChange={(e) => setClinicalObservation(e.target.value)}
                  placeholder="Affect, mood, thought process, engagement level, overt distress or anxious behavior..."
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
                  <label className="block font-bold text-slate-700 mb-1">Assigned Homework / Tasks</label>
                  <input
                    type="text"
                    value={homework}
                    onChange={(e) => setHomework(e.target.value)}
                    placeholder="Thought journal entries / Exposure exercises"
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
                    placeholder="Cognitive reframing / Behavioural activation"
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

              <div>
                <label className="block font-bold text-slate-700 mb-1">Therapist Signature / Clinician Name</label>
                <input
                  type="text"
                  value={therapistSignature}
                  onChange={(e) => setTherapistSignature(e.target.value)}
                  placeholder="e.g. Dr. Sarah Jenkins (Clinical Psychologist)"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm transition-all"
                >
                  {submitting ? 'Saving Session Note...' : editingNote ? 'Update Session Note' : 'Save Session Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Session Note Details Modal */}
      {viewingNote && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200 animate-in fade-in zoom-in duration-150 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black bg-purple-600 text-white px-3 py-0.5 rounded-full">
                    Session {viewingNote.session_number}
                  </span>
                  <span className="text-xs font-bold text-slate-700">Date: {viewingNote.session_date}</span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mt-1">
                  Clinical Session Details for {client.full_name} ({client.client_code})
                </h3>
              </div>
              <button
                onClick={() => setViewingNote(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Updated Date & Time</span>
                  <span className="font-extrabold text-slate-800 text-xs">{formatAppointmentDateTime(viewingNote.created_at || viewingNote.session_date)}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Risk Level</span>
                  <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    viewingNote.risk_level === 'High' || viewingNote.risk_level === 'Severe'
                      ? 'bg-rose-100 text-rose-800'
                      : viewingNote.risk_level === 'Moderate'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {viewingNote.risk_level || 'Low'} Risk
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Follow-Up Date</span>
                  <span className="font-extrabold text-purple-800 text-xs">{viewingNote.follow_up_date || 'None Scheduled'}</span>
                </div>
              </div>

              <div>
                <span className="font-extrabold uppercase text-[10px] text-slate-500 block mb-1">Session Notes & Clinical Summary</span>
                <div className="p-3 bg-white border border-slate-200 rounded-xl leading-relaxed whitespace-pre-line text-slate-800 font-medium">
                  {viewingNote.notes}
                </div>
              </div>

              {viewingNote.clinical_observation && (
                <div>
                  <span className="font-extrabold uppercase text-[10px] text-slate-500 block mb-1">Clinical Observation</span>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl italic text-slate-700 font-medium">
                    {viewingNote.clinical_observation}
                  </div>
                </div>
              )}

              {viewingNote.progress && (
                <div>
                  <span className="font-extrabold uppercase text-[10px] text-slate-500 block mb-1">Therapeutic Progress</span>
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-emerald-900 font-medium">
                    {viewingNote.progress}
                  </div>
                </div>
              )}

              {viewingNote.treatment_recommendation && (
                <div>
                  <span className="font-extrabold uppercase text-[10px] text-slate-500 block mb-1">Next Plan / Recommendation</span>
                  <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl text-sky-900 font-medium">
                    {viewingNote.treatment_recommendation}
                  </div>
                </div>
              )}

              {viewingNote.homework && (
                <div>
                  <span className="font-extrabold uppercase text-[10px] text-purple-700 block mb-1">Assigned Homework</span>
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 font-medium flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>{viewingNote.homework}</span>
                  </div>
                </div>
              )}

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Therapist Signature</span>
                  <span className="font-extrabold text-slate-800">{viewingNote.therapist_signature || viewingNote.psychologist_detail?.user?.name || 'Official Mindlap Clinician'}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">Logged on {viewingNote.created_at ? new Date(viewingNote.created_at).toLocaleDateString() : viewingNote.session_date}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setViewingNote(null)}
                className="px-4 py-2 font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
