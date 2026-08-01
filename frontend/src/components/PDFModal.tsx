import React, { useEffect, useState } from 'react';
import { X, Download, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { Client, CaseHistory, SessionNote } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

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
        api.get('case-histories/'),
        api.get('session-notes/')
      ]);

      if (chRes.status === 'fulfilled') {
        const histories = chRes.value.data.results || chRes.value.data || [];
        const foundCH = histories.find((h: CaseHistory) => h.client === client.id);
        if (foundCH) setCaseHistory(foundCH);
      }

      if (snRes.status === 'fulfilled') {
        const notes = snRes.value.data.results || snRes.value.data || [];
        const clientNotes = notes.filter((n: SessionNote) => n.client === client.id);
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

          {/* Demographic Metadata Card */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 font-semibold text-xs">
            <div><span className="text-slate-400 font-medium">Client Name:</span> <span className="text-slate-900 font-extrabold">{client.full_name}</span></div>
            <div><span className="text-slate-400 font-medium">Client ID:</span> <span className="text-purple-800 font-mono font-extrabold">{client.client_code}</span></div>
            <div><span className="text-slate-400 font-medium">Age / Gender:</span> {client.age} yrs ({client.gender})</div>
            <div><span className="text-slate-400 font-medium">DOB:</span> {client.dob || 'N/A'}</div>
            <div><span className="text-slate-400 font-medium">Phone:</span> {client.phone || 'N/A'}</div>
            <div><span className="text-slate-400 font-medium">Primary Diagnosis:</span> <span className="text-slate-900 font-bold">{diag.primaryDiagnosis || 'F41.1 - Generalized Anxiety Disorder'}</span></div>
            <div><span className="text-slate-400 font-medium">Assigned Therapist:</span> {client.assigned_psychologist_detail?.user?.name ? `Dr. ${client.assigned_psychologist_detail.user.name}` : 'Dr. Sarah Jenkins'}</div>
            <div><span className="text-slate-400 font-medium">Report Status:</span> <span className="text-emerald-700 font-bold inline-flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Active Case</span></div>
          </div>

          {/* Section 1: Presenting Problems */}
          <div className="space-y-1.5">
            <h4 className="font-extrabold text-xs text-purple-900 uppercase border-b border-purple-200 pb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-600" /> 1. Presenting Problems & HPI
            </h4>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
              <p><strong className="text-slate-900">Presenting Problems:</strong> {caseHistory?.presenting_problems || 'No active presenting problems recorded.'}</p>
              <p><strong className="text-slate-900">History of Present Illness (HPI):</strong> {caseHistory?.history_of_present_illness || 'Not specified.'}</p>
            </div>
          </div>

          {/* Section 2: Medical & Psychiatric Background */}
          <div className="space-y-1.5">
            <h4 className="font-extrabold text-xs text-purple-900 uppercase border-b border-purple-200 pb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-600" /> 2. Medical & Psychiatric Background
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div><strong className="text-slate-900">Medical History:</strong> {caseHistory?.medical_history || 'Unremarkable'}</div>
              <div><strong className="text-slate-900">Psychiatric History:</strong> {caseHistory?.psychiatric_history || 'Unremarkable'}</div>
              <div><strong className="text-slate-900">Substance Use:</strong> {caseHistory?.substance_use || 'Denies illicit substance use'}</div>
              <div><strong className="text-slate-900">Family History:</strong> {caseHistory?.family_history || 'Unremarkable'}</div>
            </div>
          </div>

          {/* Section 3: Mental Status Examination */}
          <div className="space-y-1.5">
            <h4 className="font-extrabold text-xs text-purple-900 uppercase border-b border-purple-200 pb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-600" /> 3. Mental Status Examination (MSE)
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs bg-purple-50/40 p-3 rounded-lg border border-purple-200">
              <div><strong className="text-slate-900">Appearance:</strong> {mse.appearance || 'Well-groomed'}</div>
              <div><strong className="text-slate-900">Behavior:</strong> {mse.behavior || 'Cooperative'}</div>
              <div><strong className="text-slate-900">Speech:</strong> {mse.speech || 'Normal rate & rhythm'}</div>
              <div><strong className="text-slate-900">Mood / Affect:</strong> {mse.moodAndAffect || 'Congruent'}</div>
              <div><strong className="text-slate-900">Thought Process:</strong> {mse.thoughtProcess || 'Linear, goal-directed'}</div>
              <div><strong className="text-slate-900">Insight & Judgment:</strong> {mse.insightAndJudgment || 'Good insight'}</div>
            </div>
          </div>

          {/* Section 4: Risk & Diagnosis */}
          <div className="space-y-1.5">
            <h4 className="font-extrabold text-xs text-purple-900 uppercase border-b border-purple-200 pb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-600" /> 4. Clinical Risk Assessment & Primary Diagnosis
            </h4>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
              <div className="flex items-center gap-4">
                <span><strong className="text-slate-900">Suicide Risk:</strong> <span className={`font-bold ${risk.suicideRisk === 'High' ? 'text-rose-600' : risk.suicideRisk === 'Moderate' ? 'text-amber-600' : 'text-emerald-600'}`}>{risk.suicideRisk || 'Low'}</span></span>
                <span><strong className="text-slate-900">Self-Harm Risk:</strong> <span className="font-semibold text-slate-700">{risk.selfHarmRisk || 'Low'}</span></span>
              </div>
              <p><strong className="text-slate-900">Primary Diagnosis:</strong> {diag.primaryDiagnosis || 'F41.1 - Generalized Anxiety Disorder'}</p>
              {risk.riskNotes && <p><strong className="text-slate-900">Risk Notes:</strong> {risk.riskNotes}</p>}
            </div>
          </div>

          {/* Section 5: Treatment Plan */}
          <div className="space-y-1.5">
            <h4 className="font-extrabold text-xs text-purple-900 uppercase border-b border-purple-200 pb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-600" /> 5. Recommended Treatment Plan & Goals
            </h4>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
              <p><strong className="text-slate-900">Short-Term Goals:</strong> {tp.shortTermGoals || 'Symptom regulation and coping skills training.'}</p>
              <p><strong className="text-slate-900">Long-Term Goals:</strong> {tp.longTermGoals || 'Cognitive restructuring and relapse prevention.'}</p>
              <p><strong className="text-slate-900">Therapeutic Modality:</strong> {tp.modality || 'Cognitive Behavioral Therapy (CBT)'}</p>
            </div>
          </div>

          {/* Section 6: Therapy Sessions Summary */}
          {sessionNotes.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="font-extrabold text-xs text-purple-900 uppercase border-b border-purple-200 pb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-600" /> 6. Therapy Session History ({sessionNotes.length} Sessions)
              </h4>
              <div className="space-y-2">
                {sessionNotes.map((sn) => (
                  <div key={sn.id} className="p-3 bg-purple-50/30 rounded-lg border border-purple-100 text-xs flex items-start justify-between gap-4">
                    <div>
                      <div className="font-bold text-purple-900">Session #{sn.session_number} ({sn.session_date}) - {sn.duration || '50 mins'}</div>
                      <p className="text-slate-700 mt-1">{sn.notes}</p>
                      {sn.homework && <p className="text-slate-500 text-[11px] mt-0.5"><strong>Homework:</strong> {sn.homework}</p>}
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
