// ============================================
// ArogyaX — Shared Type Definitions
// ============================================

// --- User Roles ---
export type UserRole = 'patient' | 'doctor' | 'admin';

// --- Visit Status ---
export type VisitStatus =
  | 'registered'
  | 'intake-in-progress'
  | 'intake-complete'
  | 'with-doctor'
  | 'consultation-complete'
  | 'cancelled';

// --- Priority Levels ---
export type Priority = 'normal' | 'review' | 'urgent-review';

// --- Supported Languages ---
export type SupportedLanguage = 'en' | 'hi';

// --- Confidence Levels ---
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

// --- Consent Types ---
export type ConsentType = 'data-collection' | 'ai-processing' | 'document-analysis';

// --- Verification Status ---
export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'needs-review';

// --- Document Analysis Status ---
export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';

// --- User ---
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

// --- Patient ---
export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  abha_id?: string;
  preferred_language: SupportedLanguage;
  created_at: string;
}

// --- Visit ---
export interface Visit {
  id: string;
  patient_id: string;
  token_number: number;
  status: VisitStatus;
  priority: Priority;
  created_at: string;
  completed_at?: string;
}

// --- Conversation Message ---
export interface ConversationMessage {
  id: string;
  visit_id: string;
  speaker: 'patient' | 'ai' | 'system';
  message: string;
  language: SupportedLanguage;
  created_at: string;
}

// --- Case Record ---
export interface CaseRecord {
  id: string;
  visit_id: string;
  structured_json: StructuredCase;
  ai_summary: string;
  doctor_notes: string;
  verification_status: VerificationStatus;
  created_at: string;
  updated_at: string;
}

// --- Document ---
export interface Document {
  id: string;
  visit_id: string;
  r2_key: string;
  filename: string;
  mime_type: string;
  size: number;
  extracted_json?: DocumentExtraction;
  analysis_status: AnalysisStatus;
  created_at: string;
}

// --- Consent ---
export interface Consent {
  id: string;
  patient_id: string;
  visit_id: string;
  consent_type: ConsentType;
  accepted: boolean;
  timestamp: string;
}

// --- Structured Case (AI Output) ---
export interface StructuredCase {
  chiefComplaint: string[];
  historyOfPresentIllness: {
    onset: string;
    duration: string;
    location: string;
    character: string;
    severity: string;
    aggravatingFactors: string[];
    relievingFactors: string[];
    associatedSymptoms: string[];
  };
  pastMedicalHistory: string[];
  pastSurgicalHistory: string[];
  medications: MedicationEntry[];
  allergies: string[];
  familyHistory: string[];
  personalHistory: Record<string, string>;
  diet: Record<string, string>;
  sleep: Record<string, string>;
  appetite: Record<string, string>;
  bowel: Record<string, string>;
  urine: Record<string, string>;
  habits: string[];
  occupation: string;
  lifestyle: Record<string, string>;
  ayurveda: AyurvedaAssessment;
  possibleRedFlags: string[];
  missingInformation: string[];
  recommendedNextQuestion: string;
  confidence: Record<string, ConfidenceLevel>;
}

export interface MedicationEntry {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  confidence: ConfidenceLevel;
}

export interface AyurvedaAssessment {
  trividhaPariksha: {
    darshana: string;
    sparshana: string;
    prashna: string;
  };
  ashtavidhaPariksha: {
    nadi: string;
    mutra: string;
    mala: string;
    jihva: string;
    shabda: string;
    sparsha: string;
    drik: string;
    akriti: string;
  };
  dashavidhaPariksha: {
    prakriti: string;
    vikriti: string;
    sara: string;
    samhanana: string;
    pramana: string;
    satmya: string;
    satva: string;
    aharaShakti: string;
    vyayamaShakti: string;
    vaya: string;
  };
}

// --- Document Extraction (AI Output) ---
export interface DocumentExtraction {
  documentType: string;
  date: string;
  doctor: string;
  hospital: string;
  medications: MedicationEntry[];
  diagnosesMentionedInDocument: string[];
  tests: string[];
  results: string[];
  allergies: string[];
  notes: string[];
  importantFindings: string[];
  confidence: Record<string, ConfidenceLevel>;
}

// --- API Response Wrapper ---
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// --- Health Check ---
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
  services: {
    worker: boolean;
    d1: boolean;
    r2: boolean;
    openai: boolean;
  };
}

// --- Visit with Patient (for Doctor Queue) ---
export interface VisitWithPatient extends Visit {
  patient: Patient;
  chief_complaint?: string;
  waiting_minutes?: number;
}

// --- Admin Stats ---
export interface AdminStats {
  patientsToday: number;
  casesCompleted: number;
  casesPending: number;
  averageIntakeMinutes: number;
  documentsProcessed: number;
  urgentReviewCount: number;
  languagesUsed: Record<string, number>;
}
