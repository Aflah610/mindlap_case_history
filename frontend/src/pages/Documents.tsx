import React, { useState } from 'react';
import { UploadCloud, Download, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Documents: React.FC = () => {
  const { effectiveRole } = useAuth();
  const [docs, setDocs] = useState([
    {
      id: 1,
      title: 'Informed Consent & Confidentiality Agreement',
      client: 'Jonathan Reed',
      category: 'Consent Forms',
      uploaded_by: 'Marcus Vance (CCD)',
      date: '2026-05-10',
      size: '1.2 MB'
    },
    {
      id: 2,
      title: 'Previous Psychiatric Evaluation Report 2024',
      client: 'Jonathan Reed',
      category: 'Previous Psychological Reports',
      uploaded_by: 'Dr. Sarah Jenkins',
      date: '2026-05-12',
      size: '3.4 MB'
    },
    {
      id: 3,
      title: 'Blood Panel & Thyroid Function Lab Results',
      client: 'Sophia Martinez',
      category: 'Medical Reports',
      uploaded_by: 'Priya Sharma (CCD)',
      date: '2026-06-02',
      size: '2.1 MB'
    }
  ]);

  if (effectiveRole === 'ccd') {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-red-200 shadow-sm text-center">
        <div className="p-4 bg-red-50 rounded-full text-red-600 mb-4">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Access Restricted (HTTP 403 Forbidden)</h2>
        <p className="text-xs text-slate-500 max-w-md mt-2">
          CCD Staff members are not permitted to access patient clinical documents and consent files due to HIPAA & Mindlap confidentiality policies.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Clinical Documents & Files</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Consent forms, medical reports, prescriptions, and psychological evaluations
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm">
          <UploadCloud className="w-4 h-4" /> Upload Document
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-3">Document Title</th>
              <th className="px-6 py-3">Client Name</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Uploaded By</th>
              <th className="px-6 py-3">Date & Size</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs">
            {docs.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-bold text-slate-900">{doc.title}</td>
                <td className="px-6 py-4 text-slate-700">{doc.client}</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                    {doc.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{doc.uploaded_by}</td>
                <td className="px-6 py-4 text-slate-500">{doc.date} ({doc.size})</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => alert(`Downloading document: ${doc.title}`)}
                    className="flex items-center gap-1 px-3 py-1 text-[11px] font-bold text-slate-700 border border-slate-300 hover:bg-slate-100 rounded-md"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
