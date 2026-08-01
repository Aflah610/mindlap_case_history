import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Client, CaseHistory, SessionNote, Psychologist } from '../types';
import { ShieldAlert, FileText, PlusCircle, Edit, Download, Eye, Filter } from 'lucide-react';
import { CaseHistoryWizard } from '../components/CaseHistoryWizard';
import { PDFModal } from '../components/PDFModal';

export const CaseHistories: React.FC = () => {
  const { effectiveRole } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [psychologists, setPsychologists] = useState<Psychologist[]>([]);
  const [caseHistories, setCaseHistories] = useState<Record<number, CaseHistory>>({});
  const [sessionNotesMap, setSessionNotesMap] = useState<Record<number, SessionNote[]>>({});
  const [selectedClientForWizard, setSelectedClientForWizard] = useState<Client | null>(null);
  const [selectedClientForReport, setSelectedClientForReport] = useState<Client | null>(null);
  const [selectedPsychologistFilter, setSelectedPsychologistFilter] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, [effectiveRole]);

  const fetchData = async () => {
    try {
      const [cRes, pRes] = await Promise.all([
        api.get('clients/'),
        api.get('auth/psychologists/')
      ]);
      setClients(cRes.data.results || cRes.data || []);
      setPsychologists(pRes.data.results || pRes.data || []);
      
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

  const activePsychologists = psychologists.filter(p => p.user?.status !== 'inactive' && p.user?.is_active !== false);
  const formerPsychologists = psychologists.filter(p => p.user?.status === 'inactive' || p.user?.is_active === false);

  const handleDownloadPDFDirect = async (client: Client) => {
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
      alert('Failed to download PDF report.');
    }
  };

  const filteredClients = clients.filter(c => {
    if (selectedPsychologistFilter === 'all') return true;
    if (selectedPsychologistFilter === 'unassigned') return !c.assigned_psychologist;
    return String(c.assigned_psychologist) === selectedPsychologistFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Clinical Case Histories</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Clinical assessments, Mental Status Examinations (MSE), diagnoses, treatment plans, and session timelines
          </p>
        </div>

        {/* Psychologist Filter Dropdown */}
        {(effectiveRole === 'owner' || effectiveRole === 'admin' || effectiveRole === 'operation_manager') && !selectedClientForWizard && (
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedPsychologistFilter}
              onChange={(e) => setSelectedPsychologistFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 font-bold text-slate-800 shadow-2xs"
            >
              <option value="all">Filter by Psychologist (All)</option>
              <option value="unassigned">Unassigned Clients</option>
              
              {activePsychologists.length > 0 && (
                <optgroup label="🟢 Works Now (Active Psychologists)">
                  {activePsychologists.map(p => (
                    <option key={p.id} value={p.id}>
                      Dr. {p.user?.name} ({p.specialization})
                    </option>
                  ))}
                </optgroup>
              )}

              {formerPsychologists.length > 0 && (
                <optgroup label="🔴 Worked Previously (Former Psychologists)" className="text-rose-600 font-bold">
                  {formerPsychologists.map(p => (
                    <option key={p.id} value={p.id} className="text-rose-600 font-bold">
                      🔴 Dr. {p.user?.name} (Former - Worked Previously)
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
        )}
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
            sessionNotes={sessionNotesMap[selectedClientForWizard.id] || []}
            onSaveSuccess={() => {
              fetchData();
              setSelectedClientForWizard(null);
            }}
            onRefreshSessionNotes={fetchData}
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
              {filteredClients.map((client) => {
                const ch = caseHistories[client.id];
                const riskLevel = ch?.risk_assessment?.suicideRisk || 'Low';
                const totalSessions = sessionNotesMap[client.id]?.length || 0;
                
                const psyUser = client.assigned_psychologist_detail?.user;
                const isFormerPsychologist = psyUser?.status === 'inactive' || psyUser?.is_active === false;

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
                    <td className="px-6 py-4 text-slate-700 font-semibold">
                      {psyUser?.name ? (
                        isFormerPsychologist ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200">
                            🔴 Dr. {psyUser.name} (Former - Worked Previously)
                          </span>
                        ) : (
                          <span className="text-sky-700 font-bold">
                            Dr. {psyUser.name}
                          </span>
                        )
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {effectiveRole === 'ccd' ? (
                        <span className="text-xs text-slate-400 font-semibold">Restricted</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedClientForWizard(client)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-extrabold text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100 rounded-lg shadow-2xs transition-all"
                          >
                            <Edit className="w-3.5 h-3.5" /> Case History & Notes ({totalSessions})
                          </button>

                          <button
                            onClick={() => setSelectedClientForReport(client)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 rounded-lg transition-all"
                            title="View Mindlap Clinical Report"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Report
                          </button>

                          <button
                            onClick={() => handleDownloadPDFDirect(client)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200 rounded-lg transition-all"
                            title="Download Mindlap PDF Report"
                          >
                            <Download className="w-3.5 h-3.5" /> PDF
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400 italic">
                    No case histories found matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Report Modal */}
      {selectedClientForReport && (
        <PDFModal
          client={selectedClientForReport}
          onClose={() => setSelectedClientForReport(null)}
        />
      )}
    </div>
  );
};
