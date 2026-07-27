import React from 'react';
import { Download, FileSpreadsheet, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const ExportDataPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-sky-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Clinical Data Export Suite</h1>
          <p className="text-xs text-slate-300 mt-1">
            Export clinic client registries, appointment logs, and clinical statistics as CSV / Excel files.
          </p>
        </div>

        <a
          href="http://127.0.0.1:8000/api/clients/export_csv/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md"
        >
          <Download className="w-4 h-4" />
          Download Complete CSV Export
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-sky-700">
            <FileSpreadsheet className="w-6 h-6" />
            <h3 className="text-base font-extrabold text-slate-800">Client Registry Export</h3>
          </div>
          <p className="text-xs text-slate-600">
            Generates a structured CSV file containing Client Codes, Full Names, Gender, Ages, Contacts, Emergency Contacts, and Assigned Psychologists.
          </p>

          <a
            href="http://127.0.0.1:8000/api/clients/export_csv/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 px-4 py-2 rounded-xl hover:bg-sky-100 transition-colors"
          >
            <Download className="w-4 h-4" /> Export Clients (.CSV)
          </a>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-teal-700">
            <ShieldCheck className="w-6 h-6" />
            <h3 className="text-base font-extrabold text-slate-800">Security Audit Log Export</h3>
          </div>
          <p className="text-xs text-slate-600">
            Exports complete system audit log history with timestamps, actor IDs, actions, IP addresses, and User-Agent info.
          </p>

          <button
            onClick={() => alert('Audit log export initiated.')}
            className="inline-flex items-center gap-2 text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 px-4 py-2 rounded-xl hover:bg-teal-100 transition-colors"
          >
            <Download className="w-4 h-4" /> Export Audit Logs (.CSV)
          </button>
        </div>
      </div>
    </div>
  );
};
