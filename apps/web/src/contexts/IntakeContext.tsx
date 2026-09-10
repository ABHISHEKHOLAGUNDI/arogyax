// ============================================
// ArogyaX — Patient Intake Context
// ============================================

import React, { createContext, useContext, useReducer } from 'react';
import type { SupportedLanguage } from '../types';

// --- Intake Steps ---
export const PATIENT_STEPS = [
  'welcome',
  'language',
  'consent',
  'patient-details',
  'chief-complaint',
  'ai-interview',
  'document-upload',
  'review',
  'submit',
  'success',
] as const;

export type PatientStep = (typeof PATIENT_STEPS)[number];

// --- State ---
export interface PatientIntakeState {
  currentStep: PatientStep;
  stepIndex: number;
  language: SupportedLanguage;
  consentsGiven: boolean;

  // Patient details
  patientId: string | null;
  visitId: string | null;
  tokenNumber: number | null;
  name: string;
  age: string;
  gender: string;
  phone: string;
  abhaId: string;

  // Clinical
  chiefComplaint: string;
  conversationHistory: Array<{ speaker: string; message: string }>;

  // Documents
  uploadedDocuments: Array<{ id: string; filename: string; status: string }>;

  // Status
  isSubmitting: boolean;
  error: string | null;
}

const initialState: PatientIntakeState = {
  currentStep: 'welcome',
  stepIndex: 0,
  language: 'en',
  consentsGiven: false,
  patientId: null,
  visitId: null,
  tokenNumber: null,
  name: '',
  age: '',
  gender: '',
  phone: '',
  abhaId: '',
  chiefComplaint: '',
  conversationHistory: [],
  uploadedDocuments: [],
  isSubmitting: false,
  error: null,
};

// --- Actions ---
type IntakeAction =
  | { type: 'SET_STEP'; step: PatientStep }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_LANGUAGE'; language: SupportedLanguage }
  | { type: 'SET_CONSENTS'; given: boolean }
  | { type: 'SET_PATIENT_DETAILS'; details: Partial<PatientIntakeState> }
  | { type: 'SET_PATIENT_ID'; patientId: string; visitId: string; tokenNumber: number }
  | { type: 'SET_CHIEF_COMPLAINT'; complaint: string }
  | { type: 'ADD_MESSAGE'; speaker: string; message: string }
  | { type: 'ADD_DOCUMENT'; doc: { id: string; filename: string; status: string } }
  | { type: 'SET_SUBMITTING'; isSubmitting: boolean }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'RESET' };

function intakeReducer(state: PatientIntakeState, action: IntakeAction): PatientIntakeState {
  switch (action.type) {
    case 'SET_STEP': {
      const stepIndex = PATIENT_STEPS.indexOf(action.step);
      return { ...state, currentStep: action.step, stepIndex };
    }
    case 'NEXT_STEP': {
      const nextIndex = Math.min(state.stepIndex + 1, PATIENT_STEPS.length - 1);
      return { ...state, currentStep: PATIENT_STEPS[nextIndex], stepIndex: nextIndex };
    }
    case 'PREV_STEP': {
      const prevIndex = Math.max(state.stepIndex - 1, 0);
      return { ...state, currentStep: PATIENT_STEPS[prevIndex], stepIndex: prevIndex };
    }
    case 'SET_LANGUAGE':
      return { ...state, language: action.language };
    case 'SET_CONSENTS':
      return { ...state, consentsGiven: action.given };
    case 'SET_PATIENT_DETAILS':
      return { ...state, ...action.details };
    case 'SET_PATIENT_ID':
      return { ...state, patientId: action.patientId, visitId: action.visitId, tokenNumber: action.tokenNumber };
    case 'SET_CHIEF_COMPLAINT':
      return { ...state, chiefComplaint: action.complaint };
    case 'ADD_MESSAGE':
      return {
        ...state,
        conversationHistory: [
          ...state.conversationHistory,
          { speaker: action.speaker, message: action.message },
        ],
      };
    case 'ADD_DOCUMENT':
      return { ...state, uploadedDocuments: [...state.uploadedDocuments, action.doc] };
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.isSubmitting };
    case 'SET_ERROR':
      return { ...state, error: action.error };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// --- Context ---
interface IntakeContextType {
  state: PatientIntakeState;
  dispatch: React.Dispatch<IntakeAction>;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: PatientStep) => void;
}

const IntakeContext = createContext<IntakeContextType | null>(null);

export function IntakeProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(intakeReducer, initialState);

  const nextStep = () => dispatch({ type: 'NEXT_STEP' });
  const prevStep = () => dispatch({ type: 'PREV_STEP' });
  const goToStep = (step: PatientStep) => dispatch({ type: 'SET_STEP', step });

  return (
    <IntakeContext.Provider value={{ state, dispatch, nextStep, prevStep, goToStep }}>
      {children}
    </IntakeContext.Provider>
  );
}

export function useIntake() {
  const ctx = useContext(IntakeContext);
  if (!ctx) throw new Error('useIntake must be used inside IntakeProvider');
  return ctx;
}
