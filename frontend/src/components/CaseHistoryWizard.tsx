import React, { useState } from 'react';
import { Client, CaseHistory, MentalStatusExamination, RiskAssessment, ClinicalDiagnosis, TreatmentPlan, SessionNote } from '../types';
import { api } from '../services/api';
import {
  FileText, CheckCircle2, ChevronRight, ChevronLeft, Save,
  AlertCircle, ShieldAlert, HeartPulse, Sparkles, Clock, Plus
} from 'lucide-react';
import { SessionTimeline } from './SessionTimeline';

interface CaseHistoryWizardProps {
  client: Client;
  existingCaseHistory?: CaseHistory | null;
  sessionNotes?: SessionNote[];
  onSaveSuccess: () => void;
  onRefreshSessionNotes?: () => void;
}

export const CaseHistoryWizard: React.FC<CaseHistoryWizardProps> = ({
  client,
  existingCaseHistory,
  sessionNotes = [],
  onSaveSuccess,
  onRefreshSessionNotes
}) => {
  const [mainTab, setMainTab] = useState<'assessment' | 'sessions'>('assessment');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form State
  const [presentingProblems, setPresentingProblems] = useState(existingCaseHistory?.presenting_problems || '');
  const [historyOfPresentIllness, setHistoryOfPresentIllness] = useState(existingCaseHistory?.history_of_present_illness || '');
  const [medicalHistory, setMedicalHistory] = useState(existingCaseHistory?.medical_history || '');
  const [psychiatricHistory, setPsychiatricHistory] = useState(existingCaseHistory?.psychiatric_history || '');
  const [familyHistory, setFamilyHistory] = useState(existingCaseHistory?.family_history || '');
  const [personalHistory, setPersonalHistory] = useState(existingCaseHistory?.personal_history || '');
  const [educationalHistory, setEducationalHistory] = useState(existingCaseHistory?.educational_history || '');
  const [occupationalHistory, setOccupationalHistory] = useState(existingCaseHistory?.occupational_history || '');
  const [relationshipHistory, setRelationshipHistory] = useState(existingCaseHistory?.relationship_history || '');
  const [substanceUse, setSubstanceUse] = useState(existingCaseHistory?.substance_use || '');
  const [socialHistory, setSocialHistory] = useState(existingCaseHistory?.social_history || '');
  const [clinicalObservation, setClinicalObservation] = useState(existingCaseHistory?.clinical_observation || '');
  const [treatmentGoals, setTreatmentGoals] = useState(existingCaseHistory?.treatment_goals || '');
  const [therapistNotes, setTherapistNotes] = useState(existingCaseHistory?.therapist_notes || '');

  // Structured MSE
  const [mse, setMse] = useState<MentalStatusExamination>(existingCaseHistory?.mental_status_examination || {
    appearance: 'Well-groomed',
    behavior: 'Cooperative',
    speech: 'Normal rate and tone',
    moodAndAffect: 'Euthymic',
    thoughtProcess: 'Goal-directed',
    thoughtContent: 'No delusions or suicidal ideation',
    perception: 'No hallucinations',
    cognition: 'Alert and oriented x4',
    insightAndJudgment: 'Good insight'
  });

  // Structured Risk
  const [risk, setRisk] = useState<RiskAssessment>(existingCaseHistory?.risk_assessment || {
    suicideRisk: 'Low',
    homicideRisk: 'Low',
    selfHarmRisk: 'Low',
    riskNotes: 'No acute suicidal or homicidal intent.'
  });

  // Structured Diagnosis
  const [diagnosis, setDiagnosis] = useState<ClinicalDiagnosis>(existingCaseHistory?.diagnosis || {
    primaryDiagnosis: '',
    secondaryDiagnosis: '',
    specifiers: ''
  });

  // Structured Treatment Plan
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan>(existingCaseHistory?.treatment_plan || {
    shortTermGoals: '',
    longTermGoals: '',
    modality: 'Cognitive Behavioral Therapy (CBT)'
  });

  const steps = [
    { number: 1, title: 'Demographics' },
    { number: 2, title: 'Complaints & HPI' },
    { number: 3, title: 'Medical & Family' },
    { number: 4, title: 'Life History' },
    { number: 5, title: 'MSE & Observation' },
    { number: 6, title: 'Diagnosis & Plan' },
  ];

  const handleSave = async () => {
    setSubmitting(true);
    setSaveMessage(null);
    setErrorMessage(null);
    setFieldErrors({});

    const payload = {
      client: client.id,
      psychologist: client.assigned_psychologist || existingCaseHistory?.psychologist || null,
      presenting_problems: presentingProblems,
      history_of_present_illness: historyOfPresentIllness,
      medical_history: medicalHistory,
      psychiatric_history: psychiatricHistory,
      family_history: familyHistory,
      personal_history: personalHistory,
      educational_history: educationalHistory,
      occupational_history: occupationalHistory,
      relationship_history: relationshipHistory,
      substance_use: substanceUse,
      social_history: socialHistory,
      mental_status_examination: mse,
      clinical_observation: clinicalObservation,
      diagnosis: diagnosis,
      treatment_goals: treatmentGoals,
      treatment_plan: treatmentPlan,
      risk_assessment: risk,
      therapist_notes: therapistNotes
    };

    try {
      if (existingCaseHistory?.id) {
        await api.put(`case-histories/${existingCaseHistory.id}/`, payload);
      } else {
        await api.post('case-histories/', payload);
      }
      setSaveMessage('Case History saved successfully!');
      onSaveSuccess();
    } catch (err: any) {
      console.error('Save case history error:', err);
      const data = err.response?.data;
      const errorsMap: Record<string, string> = {};

      if (data && typeof data === 'object') {
        Object.keys(data).forEach((key) => {
          const val = data[key];
          errorsMap[key] = Array.isArray(val) ? val.join(' ') : String(val);
        });
        setFieldErrors(errorsMap);

        if (errorsMap.presenting_problems || errorsMap.history_of_present_illness) setActiveStep(2);
        else if (errorsMap.medical_history || errorsMap.psychiatric_history || errorsMap.family_history || errorsMap.substance_use) setActiveStep(3);
        else if (errorsMap.personal_history || errorsMap.educational_history || errorsMap.occupational_history || errorsMap.relationship_history || errorsMap.social_history) setActiveStep(4);
        else if (errorsMap.mental_status_examination || errorsMap.clinical_observation) setActiveStep(5);
        else if (errorsMap.diagnosis || errorsMap.treatment_goals || errorsMap.treatment_plan || errorsMap.risk_assessment || errorsMap.therapist_notes) setActiveStep(6);
        else if (errorsMap.client || errorsMap.psychologist) setActiveStep(1);

        const fieldsList = Object.keys(errorsMap).map(k => k.replace(/_/g, ' ')).join(', ');
        setErrorMessage(`Validation error on field(s): ${fieldsList}. Please check highlighted fields below.`);
      } else {
        setErrorMessage(err.message || 'Failed to save Case History. Please check server configuration.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderFieldError = (fieldName: string) => {
    if (!fieldErrors[fieldName]) return null;
    return (
      <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        {fieldErrors[fieldName]}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-sky-50 text-sky-700 text-[11px] font-bold px-3 py-1 rounded-full uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Clinical Case History & Assessment
          </div>
          <h2 className="text-lg font-extrabold text-slate-800 mt-1">
            {client.full_name} ({client.client_code})
          </h2>
        </div>

        {mainTab === 'assessment' && (
          <button
            onClick={handleSave}
            disabled={submitting}
            className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            <Save className="w-4 h-4" />
            {submitting ? 'Saving...' : 'Save Case History'}
          </button>
        )}
      </div>

      {/* Session Counter Tracker Banner */}
      <div className="bg-gradient-to-r from-purple-50 via-sky-50 to-purple-50 border border-purple-200 p-4 rounded-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-600 text-white rounded-xl font-black text-sm">
            #{sessionNotes.length + 1}
          </div>
          <div>
            <div className="font-extrabold text-slate-800">
              Session Tracking: <span className="text-purple-700 font-extrabold">{sessionNotes.length} Sessions Already Written</span>
            </div>
            <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
              Next Session You Are Writing: <strong className="text-purple-900 font-black">Session #{sessionNotes.length + 1}</strong>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMainTab('assessment')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              mainTab === 'assessment' ? 'bg-sky-600 text-white shadow-sm' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            📋 Assessment Area
          </button>

          <button
            onClick={() => setMainTab('sessions')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              mainTab === 'sessions' ? 'bg-purple-600 text-white shadow-sm' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            📝 Session Notes ({sessionNotes.length})
          </button>
        </div>
      </div>

      {mainTab === 'sessions' ? (
        <SessionTimeline
          client={client}
          sessionNotes={sessionNotes}
          onRefresh={onRefreshSessionNotes || onSaveSuccess}
        />
      ) : (
        <div className="space-y-6">
          {saveMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {saveMessage}
            </div>
          )}

          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-start justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-extrabold text-rose-900">Unable to Save Case History</div>
                  <div className="mt-0.5 text-rose-700">{errorMessage}</div>
                </div>
              </div>
              <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-700 font-bold text-xs">✕</button>
            </div>
          )}

          {/* Progress Bar & Stepper */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
            {steps.map((s) => (
              <button
                key={s.number}
                onClick={() => setActiveStep(s.number)}
                className={`flex-1 min-w-[120px] p-2.5 rounded-xl border text-left transition-all ${
                  activeStep === s.number
                    ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                    : activeStep > s.number
                    ? 'bg-sky-50 text-sky-800 border-sky-200 font-semibold'
                    : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}
              >
                <div className="text-[10px] font-bold uppercase opacity-80">Step {s.number}</div>
                <div className="text-xs font-bold truncate">{s.title}</div>
              </button>
            ))}
          </div>

          {/* Step Contents */}
          <div className="space-y-4 pt-2">
            {/* Step 1: Basic Demographics */}
            {activeStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b pb-2">Step 1: Patient Demographics & Intake Information</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div><span className="font-bold text-slate-600">Full Name:</span> {client.full_name}</div>
                  <div><span className="font-bold text-slate-600">Client Code:</span> {client.client_code}</div>
                  <div><span className="font-bold text-slate-600">Gender / Age:</span> {client.gender}, {client.age} yrs</div>
                  <div><span className="font-bold text-slate-600">Occupation:</span> {client.occupation || 'N/A'}</div>
                  <div><span className="font-bold text-slate-600">Phone:</span> {client.phone}</div>
                  <div><span className="font-bold text-slate-600">Emergency Contact:</span> {client.emergency_contact || 'N/A'}</div>
                </div>
                {renderFieldError('client')}
                {renderFieldError('psychologist')}
              </div>
            )}

            {/* Step 2: Presenting Complaints & HPI */}
            {activeStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b pb-2">Step 2: Presenting Complaints & History of Present Illness (HPI)</h3>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Presenting Complaints</label>
                  <textarea
                    rows={3}
                    value={presentingProblems}
                    onChange={(e) => setPresentingProblems(e.target.value)}
                    placeholder="Chief complaints reported by client in verbatim..."
                    className={`w-full text-xs p-3 rounded-xl transition-all ${
                      fieldErrors.presenting_problems ? 'bg-rose-50 border-2 border-rose-500 text-rose-900 focus:outline-none' : 'bg-slate-50 border border-slate-300 text-slate-900'
                    }`}
                  />
                  {renderFieldError('presenting_problems')}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">History of Present Illness (HPI)</label>
                  <textarea
                    rows={4}
                    value={historyOfPresentIllness}
                    onChange={(e) => setHistoryOfPresentIllness(e.target.value)}
                    placeholder="Detailed timeline of onset, course, triggers, and intensity of symptoms..."
                    className={`w-full text-xs p-3 rounded-xl transition-all ${
                      fieldErrors.history_of_present_illness ? 'bg-rose-50 border-2 border-rose-500 text-rose-900 focus:outline-none' : 'bg-slate-50 border border-slate-300 text-slate-900'
                    }`}
                  />
                  {renderFieldError('history_of_present_illness')}
                </div>
              </div>
            )}

        {/* Step 3: Medical & Family */}
        {activeStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b pb-2">Step 3: Past Medical, Psychiatric & Family History</h3>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Medical History</label>
              <textarea
                rows={2}
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                placeholder="Chronic medical conditions, medications, surgeries..."
                className={`w-full text-xs p-3 rounded-xl transition-all ${
                  fieldErrors.medical_history ? 'bg-rose-50 border-2 border-rose-500 text-rose-900 focus:outline-none' : 'bg-slate-50 border border-slate-300 text-slate-900'
                }`}
              />
              {renderFieldError('medical_history')}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Past Psychiatric History</label>
              <textarea
                rows={2}
                value={psychiatricHistory}
                onChange={(e) => setPsychiatricHistory(e.target.value)}
                placeholder="Previous therapy episodes, hospitalizations, psychiatric meds..."
                className={`w-full text-xs p-3 rounded-xl transition-all ${
                  fieldErrors.psychiatric_history ? 'bg-rose-50 border-2 border-rose-500 text-rose-900 focus:outline-none' : 'bg-slate-50 border border-slate-300 text-slate-900'
                }`}
              />
              {renderFieldError('psychiatric_history')}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Family History</label>
              <textarea
                rows={2}
                value={familyHistory}
                onChange={(e) => setFamilyHistory(e.target.value)}
                placeholder="Family psychiatric history, substance abuse, familial stressors..."
                className={`w-full text-xs p-3 rounded-xl transition-all ${
                  fieldErrors.family_history ? 'bg-rose-50 border-2 border-rose-500 text-rose-900 focus:outline-none' : 'bg-slate-50 border border-slate-300 text-slate-900'
                }`}
              />
              {renderFieldError('family_history')}
            </div>
          </div>
        )}

        {/* Step 4: Life History */}
        {activeStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b pb-2">Step 4: Personal, Educational, Occupational & Relationship History</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Educational Background</label>
                <textarea
                  rows={2}
                  value={educationalHistory}
                  onChange={(e) => setEducationalHistory(e.target.value)}
                  className={`w-full text-xs p-2.5 rounded-xl transition-all ${
                    fieldErrors.educational_history ? 'bg-rose-50 border-2 border-rose-500 text-rose-900 focus:outline-none' : 'bg-slate-50 border border-slate-300 text-slate-900'
                  }`}
                />
                {renderFieldError('educational_history')}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Occupational History</label>
                <textarea
                  rows={2}
                  value={occupationalHistory}
                  onChange={(e) => setOccupationalHistory(e.target.value)}
                  className={`w-full text-xs p-2.5 rounded-xl transition-all ${
                    fieldErrors.occupational_history ? 'bg-rose-50 border-2 border-rose-500 text-rose-900 focus:outline-none' : 'bg-slate-50 border border-slate-300 text-slate-900'
                  }`}
                />
                {renderFieldError('occupational_history')}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Relationship & Marital History</label>
                <textarea
                  rows={2}
                  value={relationshipHistory}
                  onChange={(e) => setRelationshipHistory(e.target.value)}
                  className={`w-full text-xs p-2.5 rounded-xl transition-all ${
                    fieldErrors.relationship_history ? 'bg-rose-50 border-2 border-rose-500 text-rose-900 focus:outline-none' : 'bg-slate-50 border border-slate-300 text-slate-900'
                  }`}
                />
                {renderFieldError('relationship_history')}
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Substance Use History</label>
                <textarea
                  rows={2}
                  value={substanceUse}
                  onChange={(e) => setSubstanceUse(e.target.value)}
                  placeholder="Alcohol, tobacco, illicit substances..."
                  className={`w-full text-xs p-2.5 rounded-xl transition-all ${
                    fieldErrors.substance_use ? 'bg-rose-50 border-2 border-rose-500 text-rose-900 focus:outline-none' : 'bg-slate-50 border border-slate-300 text-slate-900'
                  }`}
                />
                {renderFieldError('substance_use')}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: MSE & Clinical Observation */}
        {activeStep === 5 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b pb-2">Step 5: Mental Status Examination (MSE) & Clinical Observation</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Appearance</label>
                <input
                  type="text"
                  value={mse.appearance || ''}
                  onChange={(e) => setMse({ ...mse, appearance: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Behavior & Eye Contact</label>
                <input
                  type="text"
                  value={mse.behavior || ''}
                  onChange={(e) => setMse({ ...mse, behavior: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Mood & Affect</label>
                <input
                  type="text"
                  value={mse.moodAndAffect || ''}
                  onChange={(e) => setMse({ ...mse, moodAndAffect: e.target.value })}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
            </div>
            {renderFieldError('mental_status_examination')}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Observation Notes</label>
              <textarea
                rows={3}
                value={clinicalObservation}
                onChange={(e) => setClinicalObservation(e.target.value)}
                placeholder="Therapist's observations on client affect, non-verbal cues, and interaction..."
                className={`w-full text-xs p-3 rounded-xl transition-all ${
                  fieldErrors.clinical_observation ? 'bg-rose-50 border-2 border-rose-500 text-rose-900 focus:outline-none' : 'bg-slate-50 border border-slate-300 text-slate-900'
                }`}
              />
              {renderFieldError('clinical_observation')}
            </div>
          </div>
        )}

        {/* Step 6: Diagnosis & Plan */}
        {activeStep === 6 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 border-b pb-2">Step 6: Risk Assessment, Clinical Diagnosis & Treatment Plan</h3>
            
            {/* Risk Box */}
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
              <span className="text-xs font-extrabold text-rose-800 flex items-center gap-1.5 uppercase">
                <ShieldAlert className="w-4 h-4" /> Risk Assessment Matrix
              </span>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-rose-900 mb-1">Suicide Risk</label>
                  <select
                    value={risk.suicideRisk || 'Low'}
                    onChange={(e) => setRisk({ ...risk, suicideRisk: e.target.value as any })}
                    className="w-full text-xs p-2 bg-white border border-rose-300 rounded-lg"
                  >
                    <option value="Low">Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                    <option value="Severe">Severe</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-rose-900 mb-1">Self-Harm Risk</label>
                  <select
                    value={risk.selfHarmRisk || 'Low'}
                    onChange={(e) => setRisk({ ...risk, selfHarmRisk: e.target.value as any })}
                    className="w-full text-xs p-2 bg-white border border-rose-300 rounded-lg"
                  >
                    <option value="Low">Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                    <option value="Severe">Severe</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-rose-900 mb-1">Homicide Risk</label>
                  <select
                    value={risk.homicideRisk || 'Low'}
                    onChange={(e) => setRisk({ ...risk, homicideRisk: e.target.value as any })}
                    className="w-full text-xs p-2 bg-white border border-rose-300 rounded-lg"
                  >
                    <option value="Low">Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                    <option value="Severe">Severe</option>
                  </select>
                </div>
              </div>
              {renderFieldError('risk_assessment')}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Primary Clinical Diagnosis (DSM-5 / ICD-11)</label>
              <input
                type="text"
                value={diagnosis.primaryDiagnosis || ''}
                onChange={(e) => setDiagnosis({ ...diagnosis, primaryDiagnosis: e.target.value })}
                placeholder="e.g. F41.1 Generalized Anxiety Disorder"
                className={`w-full text-xs p-2.5 rounded-xl transition-all ${
                  fieldErrors.diagnosis ? 'bg-rose-50 border-2 border-rose-500 text-rose-900 focus:outline-none' : 'bg-slate-50 border border-slate-300 text-slate-900'
                }`}
              />
              {renderFieldError('diagnosis')}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Treatment Plan & Modality</label>
              <textarea
                rows={3}
                value={treatmentGoals}
                onChange={(e) => setTreatmentGoals(e.target.value)}
                placeholder="Short-term & long-term therapy goals, modality (CBT, ACT, Psychodynamic)..."
                className={`w-full text-xs p-3 rounded-xl transition-all ${
                  fieldErrors.treatment_goals || fieldErrors.treatment_plan ? 'bg-rose-50 border-2 border-rose-500 text-rose-900 focus:outline-none' : 'bg-slate-50 border border-slate-300 text-slate-900'
                }`}
              />
              {renderFieldError('treatment_goals')}
              {renderFieldError('treatment_plan')}
            </div>
          </div>
        )}
      </div>
          {/* Footer Navigation */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <button
              onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
              disabled={activeStep === 1}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous Step
            </button>

            {activeStep < 6 ? (
              <button
                onClick={() => setActiveStep(prev => Math.min(6, prev + 1))}
                className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                Next Step <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={submitting}
                className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl transition-all shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" /> Complete & Save
              </button>
            )}
          </div>

          {/* Integrated Session Notes Timeline */}
          <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-200">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600" />
                Therapy Session Notes Timeline for {client.full_name}
              </h3>
              <span className="text-xs font-extrabold bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                Total Recorded: {sessionNotes.length} Sessions | Next: #{sessionNotes.length + 1}
              </span>
            </div>
            <SessionTimeline
              client={client}
              sessionNotes={sessionNotes}
              onRefresh={onRefreshSessionNotes || onSaveSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
};
