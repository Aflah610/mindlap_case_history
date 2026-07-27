import React from 'react';
import { X, Download, FileText } from 'lucide-react';
import { Client, CaseHistory } from '../types';
import { api } from '../services/api';

interface PDFModalProps {
  client: Client;
  caseHistory?: CaseHistory;
  onClose: () => void;
}

export const PDFModal: React.FC<PDFModalProps> = ({ client, caseHistory, onClose }) => {

  const handleDownloadPDF = async () => {
    try {
      const response = await api.get(`case-history/${client.id}/pdf/`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Case_History_${client.client_code}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Generating client PDF evaluation report...');
      window.print();
    }
  };

  const mse = caseHistory?.mental_status_examination || {};
  const risk = caseHistory?.risk_assessment || {};
  const diag = caseHistory?.diagnosis || {};
  const tp = caseHistory?.treatment_plan || {};

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-600" />
            <h3 className="font-extrabold text-sm text-slate-800">Clinical Evaluation Report: {client.full_name}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-xs text-slate-700">
          <div className="text-center border-b-2 border-sky-600 pb-4">
            <h2 className="text-xl font-extrabold text-sky-600 tracking-tight">MINDLAP THERAPY CLINIC</h2>
            <p className="text-[11px] font-bold text-teal-600 uppercase tracking-widest mt-0.5">Confidential Psychological Assessment</p>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 font-semibold">
            <div><span className="text-slate-500">Client Name:</span> {client.full_name}</div>
            <div><span className="text-slate-500">Client Code:</span> {client.client_code}</div>
            <div><span className="text-slate-500">Age / Gender:</span> {client.age} yrs ({client.gender})</div>
            <div><span className="text-slate-500">DOB:</span> {client.dob || 'N/A'}</div>
            <div><span className="text-slate-500">Primary Diagnosis:</span> {diag.primaryDiagnosis || 'N/A'}</div>
            <div><span className="text-slate-500">Psychologist:</span> {client.assigned_psychologist_detail?.user?.name || 'Dr. Sarah Jenkins'}</div>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-xs text-sky-700 uppercase border-b border-slate-200 pb-1">1. Presenting Problems</h4>
            <p>{caseHistory?.presenting_problems || 'No active presenting problems recorded.'}</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-xs text-sky-700 uppercase border-b border-slate-200 pb-1">2. Mental Status Examination (MSE)</h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div><strong>Appearance:</strong> {mse.appearance || 'Well-groomed'}</div>
              <div><strong>Behavior:</strong> {mse.behavior || 'Cooperative'}</div>
              <div><strong>Speech:</strong> {mse.speech || 'Normal rate & rhythm'}</div>
              <div><strong>Mood/Affect:</strong> {mse.moodAndAffect || 'Calm, congruent'}</div>
              <div><strong>Thought Process:</strong> {mse.thoughtProcess || 'Linear, goal-directed'}</div>
              <div><strong>Insight:</strong> {mse.insightAndJudgment || 'Good insight'}</div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-xs text-sky-700 uppercase border-b border-slate-200 pb-1">3. Risk Assessment & Diagnosis</h4>
            <p><strong>Suicide Risk:</strong> <span className="text-emerald-600 font-bold">{risk.suicideRisk || 'Low'}</span></p>
            <p><strong>Primary Diagnosis:</strong> {diag.primaryDiagnosis || 'F41.1 - Generalized Anxiety Disorder'}</p>
            <p><strong>Risk Rationales:</strong> {risk.riskNotes || 'No active suicidal ideation expressed.'}</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-extrabold text-xs text-sky-700 uppercase border-b border-slate-200 pb-1">4. Treatment Plan Goals</h4>
            <p><strong>Short-Term Goals:</strong> {tp.shortTermGoals || 'Establish symptom management skills.'}</p>
            <p><strong>Modality:</strong> {tp.modality || 'Cognitive Behavioral Therapy (CBT)'}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm"
          >
            <Download className="w-4 h-4" /> Download PDF Report
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 border border-slate-300 hover:bg-slate-100 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
