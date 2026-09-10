// ============================================
// ArogyaX — Zod Validation Schemas
// ============================================

import { z } from 'zod';

// --- Auth ---
export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// --- Patient Registration ---
export const PatientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  age: z.number().int().min(0).max(150),
  gender: z.enum(['male', 'female', 'other']),
  phone: z.string().min(10).max(15),
  abha_id: z.string().optional(),
  preferred_language: z.enum(['en', 'hi']),
});

// --- Visit Creation ---
export const CreateVisitSchema = z.object({
  patient_id: z.string().uuid(),
});

// --- Conversation Message ---
export const MessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(5000),
  language: z.enum(['en', 'hi']).default('en'),
});

// --- Consent ---
export const ConsentSchema = z.object({
  consent_type: z.enum(['data-collection', 'ai-processing', 'document-analysis']),
  accepted: z.boolean(),
});

// --- Doctor Case Update ---
export const CaseUpdateSchema = z.object({
  doctor_notes: z.string().max(10000).optional(),
  structured_json: z.record(z.unknown()).optional(),
  verification_status: z.enum(['pending', 'verified', 'rejected', 'needs-review']).optional(),
});

// --- Confidence Level ---
export const ConfidenceLevelSchema = z.enum(['HIGH', 'MEDIUM', 'LOW']);

// --- Medication Entry ---
export const MedicationEntrySchema = z.object({
  name: z.string(),
  dosage: z.string(),
  frequency: z.string(),
  duration: z.string(),
  confidence: ConfidenceLevelSchema,
});

// --- Structured Case (AI Output validation) ---
export const StructuredCaseSchema = z.object({
  chiefComplaint: z.array(z.string()),
  historyOfPresentIllness: z.object({
    onset: z.string(),
    duration: z.string(),
    location: z.string(),
    character: z.string(),
    severity: z.string(),
    aggravatingFactors: z.array(z.string()),
    relievingFactors: z.array(z.string()),
    associatedSymptoms: z.array(z.string()),
  }),
  pastMedicalHistory: z.array(z.string()),
  pastSurgicalHistory: z.array(z.string()),
  medications: z.array(MedicationEntrySchema),
  allergies: z.array(z.string()),
  familyHistory: z.array(z.string()),
  personalHistory: z.record(z.string()),
  diet: z.record(z.string()),
  sleep: z.record(z.string()),
  appetite: z.record(z.string()),
  bowel: z.record(z.string()),
  urine: z.record(z.string()),
  habits: z.array(z.string()),
  occupation: z.string(),
  lifestyle: z.record(z.string()),
  ayurveda: z.object({
    trividhaPariksha: z.object({
      darshana: z.string(),
      sparshana: z.string(),
      prashna: z.string(),
    }),
    ashtavidhaPariksha: z.object({
      nadi: z.string(),
      mutra: z.string(),
      mala: z.string(),
      jihva: z.string(),
      shabda: z.string(),
      sparsha: z.string(),
      drik: z.string(),
      akriti: z.string(),
    }),
    dashavidhaPariksha: z.object({
      prakriti: z.string(),
      vikriti: z.string(),
      sara: z.string(),
      samhanana: z.string(),
      pramana: z.string(),
      satmya: z.string(),
      satva: z.string(),
      aharaShakti: z.string(),
      vyayamaShakti: z.string(),
      vaya: z.string(),
    }),
  }),
  possibleRedFlags: z.array(z.string()),
  missingInformation: z.array(z.string()),
  recommendedNextQuestion: z.string(),
  confidence: z.record(ConfidenceLevelSchema),
});

// --- Document Extraction (AI Output validation) ---
export const DocumentExtractionSchema = z.object({
  documentType: z.string(),
  date: z.string(),
  doctor: z.string(),
  hospital: z.string(),
  medications: z.array(MedicationEntrySchema),
  diagnosesMentionedInDocument: z.array(z.string()),
  tests: z.array(z.string()),
  results: z.array(z.string()),
  allergies: z.array(z.string()),
  notes: z.array(z.string()),
  importantFindings: z.array(z.string()),
  confidence: z.record(ConfidenceLevelSchema),
});

// --- Export inferred types ---
export type LoginInput = z.infer<typeof LoginSchema>;
export type PatientInput = z.infer<typeof PatientSchema>;
export type MessageInput = z.infer<typeof MessageSchema>;
export type ConsentInput = z.infer<typeof ConsentSchema>;
export type CaseUpdateInput = z.infer<typeof CaseUpdateSchema>;
export type StructuredCaseInput = z.infer<typeof StructuredCaseSchema>;
export type DocumentExtractionInput = z.infer<typeof DocumentExtractionSchema>;
