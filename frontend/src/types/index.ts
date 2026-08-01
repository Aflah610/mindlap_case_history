export type UserRole = 'owner' | 'operation_manager' | 'psychologist' | 'ccd' | 'admin';

export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: 'active' | 'inactive';
  is_active?: boolean;
  is_superuser?: boolean;
  created_at: string;
}

export interface Psychologist {
  id: number;
  user: User;
  specialization: string;
  qualification: string;
  experience: string;
  license_number: string;
}

export interface CCDStaff {
  id: number;
  user: User;
  department: string;
}

export interface Client {
  id: number;
  client_code: string;
  full_name: string;
  gender: string;
  age: number;
  dob?: string;
  phone: string;
  email?: string;
  address?: string;
  occupation?: string;
  marital_status?: string;
  emergency_contact?: string;
  assigned_psychologist?: number;
  assigned_psychologist_detail?: Psychologist;
  created_by?: number;
  created_by_detail?: User;
  created_at: string;
}

export interface MentalStatusExamination {
  appearance?: string;
  behavior?: string;
  speech?: string;
  moodAndAffect?: string;
  thoughtProcess?: string;
  thoughtContent?: string;
  perception?: string;
  cognition?: string;
  insightAndJudgment?: string;
}

export interface RiskAssessment {
  suicideRisk?: 'Low' | 'Moderate' | 'High' | 'Severe';
  homicideRisk?: 'Low' | 'Moderate' | 'High' | 'Severe';
  selfHarmRisk?: 'Low' | 'Moderate' | 'High' | 'Severe';
  riskNotes?: string;
}

export interface ClinicalDiagnosis {
  primaryDiagnosis?: string;
  secondaryDiagnosis?: string;
  specifiers?: string;
}

export interface TreatmentPlan {
  shortTermGoals?: string;
  longTermGoals?: string;
  modality?: string;
}

export interface CaseHistory {
  id: number;
  client: number;
  client_detail?: Client;
  psychologist?: number;
  psychologist_detail?: Psychologist;
  presenting_problems?: string;
  history_of_present_illness?: string;
  medical_history?: string;
  psychiatric_history?: string;
  family_history?: string;
  personal_history?: string;
  educational_history?: string;
  occupational_history?: string;
  relationship_history?: string;
  substance_use?: string;
  social_history?: string;
  mental_status_examination?: MentalStatusExamination;
  clinical_observation?: string;
  diagnosis?: ClinicalDiagnosis;
  treatment_goals?: string;
  treatment_plan?: TreatmentPlan;
  risk_assessment?: RiskAssessment;
  therapist_notes?: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface SessionNote {
  id: number;
  client: number;
  client_detail?: Client;
  psychologist: number;
  psychologist_detail?: Psychologist;
  session_number: number;
  session_date: string;
  duration: string;
  notes: string;
  clinical_observation?: string;
  progress?: string;
  risk_level?: 'Low' | 'Moderate' | 'High' | 'Severe';
  homework?: string;
  treatment_recommendation?: string;
  follow_up_date?: string;
  therapist_signature?: string;
  created_at: string;
}

export interface Appointment {
  id: number;
  client: number;
  client_detail?: Client;
  psychologist: number;
  psychologist_detail?: Psychologist;
  appointment_date: string;
  duration?: string;
  consultation_type?: 'Initial Consultation' | 'Follow-up';
  mode?: 'Offline' | 'Online';
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
  remarks?: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  user?: number;
  user_detail?: User;
  action: string;
  table_name?: string;
  record_id?: string;
  details?: string;
  timestamp: string;
  ip_address?: string;
  browser?: string;
  device?: string;
}

export interface TherapistWorkload {
  id: number;
  name: string;
  specialization: string;
  assigned_clients: number;
  today_sessions: number;
}

export interface DashboardStats {
  total_clients: number;
  active_clients: number;
  total_therapists: number;
  today_appointments_count: number;
  pending_reports: number;
  completed_reports: number;
  therapist_workload: TherapistWorkload[];
}
