import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Client, CaseHistory, SessionNote } from '../types';
import { ShieldAlert, FileText, PlusCircle, Edit, Download } from 'lucide-react';
import { CaseHistoryWizard } from '../components/CaseHistoryWizard';
import { SessionTimeline } from '../components/SessionTimeline';

export const CaseHistories: React.FC = () => {
  const { effectiveRole } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [caseHistories, setCaseHistories] = useState<Record<number, CaseHistory>>({});
  const [sessionNotesMap, setSessionNotesMap] = useState<Record<number, SessionNote[]>>({});
  const [selectedClientForWizard, setSelectedClientForWizard] = useState<Client | null>(null);
  const [selectedClientForTimeline, setSelectedClientForTimeline] = useState<Client | null>(null);

  useEffect(() => {
    fetchData();
  }, [effectiveRole]);

  const fetchData = async () => {
    try {
      const cRes = await api.get('clients/');
      const clientsList = cRes.data.results || cRes.data || [];
      setClients(clientsList);
      
      if (effectiveRole !== 'ccd') {
        const [chRes, snRes] = await Promise.all([
          api.get('case-histories/'),
          api.get('session-notes/')
        ]);

        const chMap: Record<number, CaseHistory> = {};
        (chRes.data.results || chRes.data || []).forEach((ch: CaseHistory) => {
          chMap[ch.client] = ch;
        });
        setCaseHistories(chMap);

        const snMap: Record<number, SessionNote[]> = {};
        (snRes.data.results || snRes.data || []).forEach((sn: SessionNote) => {
          if (!snMap[sn.client]) snMap[sn.client] = [];
          snMap[sn.client].push(sn);
        });
        setSessionNotesMap(snMap);
      }
    } catch (e) {
      console.error('Error fetching case histories:', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Clinical Case Histories</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Clinical assessments, Mental Status Examinations (MSE), diagnoses, treatment plans, and session timelines
          </p>
        </div>
      </div>

      {/* CCD Confidentiality Banner */}
      {effectiveRole === 'ccd' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center space-y-2">
          <ShieldAlert className="w-10 h-10 text-amber-600 mx-auto" />
          <h3 className="text-base font-extrabold text-amber-900">CCD Confidentiality Restriction Active</h3>
          <p className="text-xs text-amber-800 max-w-xl mx-auto">
            Client Care Department (CCD) staff can view basic client registration data and scheduling. Detailed psychological case notes, MSE evaluations, risk assessments, and diagnosis details are strictly confidential to clinical staff.
          </p>
        </div>
      )}

      {selectedClientForWizard ? (
        <div>
          <button
            onClick={() => setSelectedClientForWizard(null)}
            className="mb-4 text-xs font-bold text-slate-600 hover:text-slate-800"
          >
            ← Back to Client List
          </button>
          <CaseHistoryWizard
            client={selectedClientForWizard}
            existingCaseHistory={caseHistories[selectedClientForWizard.id]}
            onSaveSuccess={() => {
              fetchData();
              setSelectedClientForWizard(null);
            }}
          />
        </div>
      ) : selectedClientForTimeline ? (
        <div>
          <button
            onClick={() => setSelectedClientForTimeline(null)}
            className="mb-4 text-xs font-bold text-slate-600 hover:text-slate-800"
          >
            ← Back to Client List
          </button>
          <SessionTimeline
            client={selectedClientForTimeline}
            sessionNotes={sessionNotesMap[selectedClientForTimeline.id] || []}
            onRefresh={fetchData}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3">Client Name</th>
                <th className="px-6 py-3">Primary Diagnosis</th>
                <th className="px-6 py-3">Risk Level</th>
                <th className="px-6 py-3">Assigned Therapist</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {clients.map((client) => {
                const ch = caseHistories[client.id];
                const riskLevel = ch?.risk_assessment?.suicideRisk || 'Low';
                return (
                  <tr key={client.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{client.full_name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{client.client_code}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {effectiveRole === 'ccd' ? (
                        <span className="text-amber-700 font-semibold italic">[Confidential]</span>
                      ) : (
                        ch?.diagnosis?.primaryDiagnosis || 'F41.1 - Generalized Anxiety Disorder'
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {effectiveRole === 'ccd' ? (
                        <span className="text-amber-700 font-semibold italic">[Redacted]</span>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          riskLevel === 'High' ? 'bg-rose-100 text-rose-800' :
                          riskLevel === 'Moderate' ? 'bg-amber-100 text-amber-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          Risk: {riskLevel}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {client.assigned_psychologist_detail?.user?.name ? `Dr. ${client.assigned_psychologist_detail.user.name}` : 'Unassigned'}
                    </td>
                    <td className="px-6 py-4">
                      {effectiveRole === 'ccd' ? (
                        <span className="text-xs text-slate-400 font-semibold">Restricted</span>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedClientForWizard(client)}
                            className="flex items-center gap-1 px-3 py-1 text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100 rounded-md"
                          >
                            <Edit className="w-3.5 h-3.5" /> Wizard Assessment
                          </button>

                          <button
                            onClick={() => setSelectedClientForTimeline(client)}
                            className="flex items-center gap-1 px-3 py-1 text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 hover:bg-teal-100 rounded-md"
                          >
                            <FileText className="w-3.5 h-3.5" /> Sessions ({sessionNotesMap[client.id]?.length || 0})
                          </button>

                          <a
                            href={`http://127.0.0.1:8000/api/pdf/${client.id}/`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 px-3 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200 rounded-md"
                          >
                            <Download className="w-3.5 h-3.5" /> PDF
                          </a>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
