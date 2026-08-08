import React, { useEffect, useState } from 'react';
import { X, Download, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { Client, CaseHistory, SessionNote } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatAppointmentDateTime } from '../utils/dateUtils';

interface PDFModalProps {
  client: Client;
  caseHistory?: CaseHistory;
  onClose: () => void;
}

export const PDFModal: React.FC<PDFModalProps> = ({ client, caseHistory: initialCaseHistory, onClose }) => {
  const { effectiveRole } = useAuth();
  const isAllowedToDownload = effectiveRole !== 'ccd';
  const [caseHistory, setCaseHistory] = useState<CaseHistory | undefined>(initialCaseHistory);
  const [sessionNotes, setSessionNotes] = useState<SessionNote[]>([]);
  const [loading, setLoading] = useState<boolean>(!initialCaseHistory);
  const [downloading, setDownloading] = useState<boolean>(false);

  useEffect(() => {
    fetchReportDetails();
  }, [client.id]);

  const fetchReportDetails = async () => {
    try {
      if (effectiveRole === 'ccd') return;
      
      const [chRes, snRes] = await Promise.allSettled([
        api.get('case-history/'),
        api.get('session-notes/')
      ]);

      if (chRes.status === 'fulfilled') {
        const histories = chRes.value.data.results || chRes.value.data || [];
        const foundCH = histories.find((h: CaseHistory) => {
          const cId = Number(typeof h.client === 'object' ? (h.client as any).id : h.client);
          return cId === client.id;
        });
        if (foundCH) setCaseHistory(foundCH);
      }

      if (snRes.status === 'fulfilled') {
        const notes = snRes.value.data.results || snRes.value.data || [];
        const clientNotes = notes.filter((n: SessionNote) => {
          const cId = Number(typeof n.client === 'object' ? (n.client as any).id : n.client);
          return cId === client.id;
        });
        setSessionNotes(clientNotes);
      }
    } catch (e) {
      console.error('Error loading report details:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await api.get(`case-history/${client.id}/pdf/`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Case_History_${client.client_code}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download PDF report. Please check server status.');
    } finally {
      setDownloading(false);
    }
  };

  const mse = caseHistory?.mental_status_examination || {};
  const risk = caseHistory?.risk_assessment || {};
  const diag = caseHistory?.diagnosis || {};
  const tp = caseHistory?.treatment_plan || {};

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-purple-100 flex items-center justify-between bg-gradient-to-r from-purple-50 via-white to-slate-50">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Mindlap Logo" className="h-9 object-contain" />
            <div className="h-6 w-px bg-slate-300 mx-1"></div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Clinical Evaluation Report</h3>
              <p className="text-[11px] font-medium text-purple-700">{client.full_name} ({client.client_code})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          
          {/* Header Banner */}
          <div className="text-center border-b-2 border-purple-600 pb-4 bg-purple-50/50 p-4 rounded-xl">
            <h2 className="text-xl font-black text-purple-900 tracking-tight">MINDLAP THERAPY CLINIC</h2>
            <p className="text-[11px] font-extrabold text-purple-700 uppercase tracking-widest mt-0.5">
              Confidential Psychological Assessment & Clinical Case Report
            </p>
          </div>

          {/* Unassigned / No Case History Warning Banner */}
          {!caseHistory && (
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-amber-900 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-bold block">No Case History Recorded</span>
                <span>A clinical case evaluation report has not been created or filled out for this client yet.</span>
              </div>
            </div>
          )}

          {/* Demographic Metadata Card */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 font-semibold text-xs">
            <div><span className="text-slate-400 font-medium">Client Name:</span> <span className="text-slate-900 font-extrabold">{client.full_name}</span></div>
            <div><span className="text-slate-400 font-medium">Client ID:</span> <span className="text-purple-800 font-mono font-extrabold">{client.client_code}</span></div>
            <div><span className="text-slate-400 font-medium">Age / Gender:</span> {client.age} yrs ({client.gender})</div>
            <div><span className="text-slate-400 font-medium">DOB:</span> {client.dob || 'N/A'}</div>
            <div><span className="text-slate-400 font-medium">Phone:</span> {client.phone || 'N/A'}</div>
            <div><span className="text-slate-400 font-medium">Primary Diagnosis:</span> <span className="text-slate-900 font-bold">{diag.primaryDiagnosis || 'Pending Assessment'}</span></div>
            <div><span className="text-slate-400 font-medium">Assigned Therapist:</span> {client.assigned_psychologist_detail?.user?.name ? `Dr. ${client.assigned_psychologist_detail.user.name}` : <span className="text-amber-700 italic">Unassigned</span>}</div>
            <div><span className="text-slate-400 font-medium">Report Status:</span> {caseHistory ? <span className="text-emerald-700 font-bold inline-flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Active Case</span> : <span className="text-amber-700 font-bold inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Pending Evaluation</span>}</div>
          </div>

          {/* Section 1: Presenting Problems */}
          <div className="space-y-1.5">
            <h4 className="font-extrabold text-xs text-purple-900 uppercase border-b border-purple-200 pb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-600" /> 1. Presenting Problems & HPI
            </h4>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
              <p><strong className="text-slate-900">Presenting Problems:</strong> {caseHistory?.presenting_problems || 'No active presenting problems recorded.'}</p>
              <p><strong className="text-slate-900">History of Present Illness (HPI):</strong> {caseHistory?.history_of_present_illness || 'Not recorded.'}</p>
            </div>
          </div>

          {/* Section 2: Medical & Psychiatric Background */}
          <div className="space-y-1.5">
            <h4 className="font-extrabold text-xs text-purple-900 uppercase border-b border-purple-200 pb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-600" /> 2. Medical & Psychiatric Background
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div><strong className="text-slate-900">Medical History:</strong> {caseHistory?.medical_history || 'Not recorded.'}</div>
              <div><strong className="text-slate-900">Psychiatric History:</strong> {caseHistory?.psychiatric_history || 'Not recorded.'}</div>
              <div><strong className="text-slate-900">Substance Use:</strong> {caseHistory?.substance_use || 'Not recorded.'}</div>
              <div><strong className="text-slate-900">Family History:</strong> {caseHistory?.family_history || 'Not recorded.'}</div>
            </div>
          </div>

          {/* Section 3: Mental Status Examination */}
          <div className="space-y-1.5">
            <h4 className="font-extrabold text-xs text-purple-900 uppercase border-b border-purple-200 pb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-600" /> 3. Mental Status Examination (MSE)
            </h4>
            <div className="grid grid-cols-3 gap-2.5 text-xs bg-purple-50/40 p-3 rounded-lg border border-purple-200">
              <div><strong className="text-slate-900">Appearance:</strong> {mse.appearance || 'Not assessed'}</div>
              <div><strong className="text-slate-900">Behavior:</strong> {mse.behavior || 'Not assessed'}</div>
              <div><strong className="text-slate-900">Speech:</strong> {mse.speech || 'Not assessed'}</div>
              <div><strong className="text-slate-900">Mood / Affect:</strong> {mse.moodAndAffect || 'Not assessed'}</div>
              <div><strong className="text-slate-900">Thought Process:</strong> {mse.thoughtProcess || 'Not assessed'}</div>
              <div><strong className="text-slate-900">Thought Content:</strong> {mse.thoughtContent || 'Not assessed'}</div>
              <div><strong className="text-slate-900">Perception:</strong> {mse.perception || 'Not assessed'}</div>
              <div><strong className="text-slate-900">Cognition:</strong> {mse.cognition || 'Not assessed'}</div>
              <div><strong className="text-slate-900">Insight & Judgment:</strong> {mse.insightAndJudgment || 'Not assessed'}</div>
            </div>
          </div>

          {/* Section 4: Risk & Diagnosis */}
          <div className="space-y-1.5">
            <h4 className="font-extrabold text-xs text-purple-900 uppercase border-b border-purple-200 pb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-600" /> 4. Clinical Risk Assessment & Primary Diagnosis
            </h4>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center gap-4">
                <span><strong className="text-slate-900">Suicide Risk:</strong> <span className={`font-bold ${risk.suicideRisk === 'High' ? 'text-rose-600' : risk.suicideRisk === 'Moderate' ? 'text-amber-600' : risk.suicideRisk === 'Low' ? 'text-emerald-600' : 'text-slate-500'}`}>{risk.suicideRisk || 'Not assessed'}</span></span>
                <span><strong className="text-slate-900">Self-Harm Risk:</strong> <span className="font-semibold text-slate-700">{risk.selfHarmRisk || 'Not assessed'}</span></span>
              </div>
              <p><strong className="text-slate-900">Primary Diagnosis:</strong> {diag.primaryDiagnosis || 'Pending Assessment'}</p>
              {diag.secondaryDiagnosis && <p><strong className="text-slate-900">Secondary Diagnosis:</strong> {diag.secondaryDiagnosis}</p>}
              {risk.riskNotes && <p><strong className="text-slate-900">Risk Notes:</strong> {risk.riskNotes}</p>}
            </div>
          </div>

          {/* Section 5: Treatment Plan */}
          <div className="space-y-1.5">
            <h4 className="font-extrabold text-xs text-purple-900 uppercase border-b border-purple-200 pb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-600" /> 5. Recommended Treatment Plan & Goals
            </h4>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
              <p><strong className="text-slate-900">Short-Term Goals:</strong> {tp.shortTermGoals || caseHistory?.treatment_goals || 'Symptom reduction & coping skill development'}</p>
              <p><strong className="text-slate-900">Long-Term Goals:</strong> {tp.longTermGoals || 'Relapse prevention & emotional regulation'}</p>
              <p><strong className="text-slate-900">Therapeutic Modality:</strong> {tp.modality || 'Cognitive Behavioral Therapy (CBT)'}</p>
              {caseHistory?.treatment_goals && caseHistory.treatment_goals !== tp.shortTermGoals && (
                <p><strong className="text-slate-900">Overall Strategy:</strong> {caseHistory.treatment_goals}</p>
              )}
            </div>
          </div>

          {/* Section 6: Therapy Sessions Summary */}
          {sessionNotes.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-xs text-purple-900 uppercase border-b border-purple-200 pb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-600" /> 6. Therapy Session History ({sessionNotes.length} Sessions)
              </h4>
              <div className="space-y-2.5">
                {sessionNotes.map((sn) => (
                  <div key={sn.id} className="p-3.5 bg-purple-50/30 rounded-xl border border-purple-100 text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold text-purple-900 pb-1.5 border-b border-purple-100">
                      <span>Session {sn.session_number} ({sn.session_date}) — Updated: {formatAppointmentDateTime(sn.created_at || caseHistory?.updated_at || sn.session_date)}</span>
                      <div className="flex items-center gap-2 text-[11px]">
                        {sn.risk_level && (
                          <span className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] ${
                            sn.risk_level === 'High' || sn.risk_level === 'Severe' ? 'bg-rose-100 text-rose-800' :
                            sn.risk_level === 'Moderate' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            Risk: {sn.risk_level}
                          </span>
                        )}
                        {sn.follow_up_date && <span className="text-slate-500 font-medium">Follow-up: {sn.follow_up_date}</span>}
                      </div>
                    </div>

                    <div>
                      <strong className="text-slate-900">Summary & Session Notes:</strong>
                      <p className="text-slate-700 mt-0.5 whitespace-pre-wrap">{sn.notes || 'No detailed notes recorded.'}</p>
                    </div>

                    {sn.clinical_observation && (
                      <div>
                        <strong className="text-slate-900">Clinical Observations:</strong>
                        <p className="text-slate-700 mt-0.5 whitespace-pre-wrap">{sn.clinical_observation}</p>
                      </div>
                    )}

                    {sn.progress && (
                      <div>
                        <strong className="text-slate-900">Therapeutic Progress:</strong>
                        <p className="text-emerald-800 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100 mt-0.5 whitespace-pre-wrap">{sn.progress}</p>
                      </div>
                    )}

                    {sn.homework && (
                      <div className="p-2 bg-purple-50 border border-purple-100 rounded-lg">
                        <strong className="text-purple-900">Homework Assigned:</strong> <span className="text-slate-800">{sn.homework}</span>
                      </div>
                    )}

                    {sn.treatment_recommendation && (
                      <div>
                        <strong className="text-slate-900">Treatment Recommendation / Next Plan:</strong>
                        <p className="text-sky-900 bg-sky-50/50 p-2 rounded-lg border border-sky-100 mt-0.5 whitespace-pre-wrap">{sn.treatment_recommendation}</p>
                      </div>
                    )}

                    <div className="pt-1.5 text-[11px] text-slate-400 border-t border-purple-100/50 flex justify-between items-center italic">
                      <span>Therapist Signature: <strong className="text-slate-700 not-italic">{sn.therapist_signature || (typeof sn.psychologist === 'object' ? (sn.psychologist as any)?.user?.name : '') || 'Assigned Clinician'}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Bar */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-medium">
            Confidential Mindlap Clinical Case Report
          </div>

          <div className="flex items-center gap-3">
            {isAllowedToDownload ? (
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" /> {downloading ? 'Generating PDF...' : 'Download PDF Report'}
              </button>
            ) : (
              <span className="text-xs text-rose-600 font-semibold italic flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Restricted (CCD Confidentiality)
              </span>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
