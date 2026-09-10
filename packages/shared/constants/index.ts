// ============================================
// ArogyaX — Shared Constants
// ============================================

import type { SupportedLanguage } from '../types/index.js';

// --- Application ---
export const APP_NAME = 'ArogyaX';
export const APP_VERSION = '1.0.0';
export const APP_TAGLINE = 'AI-Powered Multilingual Patient Case-Taking';

// --- Supported Languages ---
export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, string> = {
  en: 'English',
  hi: 'हिन्दी',
};

// All languages planned for future support
export const PLANNED_LANGUAGES = [
  'bn', // Bengali
  'ta', // Tamil
  'te', // Telugu
  'mr', // Marathi
  'gu', // Gujarati
  'kn', // Kannada
  'ml', // Malayalam
  'pa', // Punjabi
  'or', // Odia
  'as', // Assamese
] as const;

// --- Visit Status Labels ---
export const VISIT_STATUS_LABELS: Record<string, string> = {
  'registered': 'Registered',
  'intake-in-progress': 'Intake In Progress',
  'intake-complete': 'Intake Complete',
  'with-doctor': 'With Doctor',
  'consultation-complete': 'Consultation Complete',
  'cancelled': 'Cancelled',
};

// --- Priority ---
export const PRIORITY_CONFIG = {
  'normal': { label: 'Normal', color: '#22c55e', icon: '🟢' },
  'review': { label: 'Review', color: '#f59e0b', icon: '🟡' },
  'urgent-review': { label: 'Urgent Review', color: '#ef4444', icon: '🔴' },
} as const;

// --- File Upload ---
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const;

export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const MAX_FILES_PER_VISIT = 10;

// --- Patient Intake Steps ---
export const INTAKE_STEPS = [
  'welcome',
  'language',
  'consent',
  'patient-details',
  'chief-complaint',
  'ai-interview',
  'medical-history',
  'ayurvedic-assessment',
  'document-upload',
  'review',
  'submit',
  'success',
] as const;

export type IntakeStep = (typeof INTAKE_STEPS)[number];

// --- Red Flag Keywords ---
export const RED_FLAG_KEYWORDS = [
  'chest pain',
  'seene mein dard',
  'difficulty breathing',
  'saans lene mein',
  'unconscious',
  'behosh',
  'heavy bleeding',
  'bahut khoon',
  'stroke',
  'lakwa',
  'severe allergic',
  'suicidal',
  'aatmhatya',
  'severe trauma',
  'accident',
] as const;

// --- Ayurvedic Assessment Fields ---
export const TRIVIDHA_FIELDS = ['darshana', 'sparshana', 'prashna'] as const;

export const ASHTAVIDHA_FIELDS = [
  'nadi', 'mutra', 'mala', 'jihva',
  'shabda', 'sparsha', 'drik', 'akriti',
] as const;

export const DASHAVIDHA_FIELDS = [
  'prakriti', 'vikriti', 'sara', 'samhanana',
  'pramana', 'satmya', 'satva', 'aharaShakti',
  'vyayamaShakti', 'vaya',
] as const;

// --- Gender Options ---
export const GENDER_OPTIONS = [
  { value: 'male', label_en: 'Male', label_hi: 'पुरुष' },
  { value: 'female', label_en: 'Female', label_hi: 'महिला' },
  { value: 'other', label_en: 'Other', label_hi: 'अन्य' },
] as const;
