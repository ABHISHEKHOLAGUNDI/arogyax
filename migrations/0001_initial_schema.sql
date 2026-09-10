-- ============================================
-- ArogyaX — D1 Database Schema
-- Migration: 0001_initial_schema
-- ============================================

-- ==========================================
-- USERS (doctors, admins)
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('doctor', 'admin')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ==========================================
-- PATIENTS
-- ==========================================
CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 0 AND age <= 150),
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  phone TEXT NOT NULL,
  abha_id TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_patients_abha ON patients(abha_id);

-- ==========================================
-- VISITS
-- ==========================================
CREATE TABLE IF NOT EXISTS visits (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id),
  token_number INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'registered'
    CHECK (status IN (
      'registered',
      'intake-in-progress',
      'intake-complete',
      'with-doctor',
      'consultation-complete',
      'cancelled'
    )),
  priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('normal', 'review', 'urgent-review')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);

CREATE INDEX idx_visits_patient ON visits(patient_id);
CREATE INDEX idx_visits_status ON visits(status);
CREATE INDEX idx_visits_created ON visits(created_at);

-- ==========================================
-- CONVERSATIONS (chat messages)
-- ==========================================
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  visit_id TEXT NOT NULL REFERENCES visits(id),
  speaker TEXT NOT NULL CHECK (speaker IN ('patient', 'ai', 'system')),
  message TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'en',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_conversations_visit ON conversations(visit_id);

-- ==========================================
-- CASE RECORDS (structured AI extraction)
-- ==========================================
CREATE TABLE IF NOT EXISTS case_records (
  id TEXT PRIMARY KEY,
  visit_id TEXT NOT NULL UNIQUE REFERENCES visits(id),
  structured_json TEXT NOT NULL DEFAULT '{}',
  ai_summary TEXT NOT NULL DEFAULT '',
  doctor_notes TEXT NOT NULL DEFAULT '',
  verification_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'verified', 'rejected', 'needs-review')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_case_records_visit ON case_records(visit_id);
CREATE INDEX idx_case_records_status ON case_records(verification_status);

-- ==========================================
-- DOCUMENTS (uploaded files metadata)
-- ==========================================
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  visit_id TEXT NOT NULL REFERENCES visits(id),
  r2_key TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL DEFAULT 0,
  extracted_json TEXT,
  analysis_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (analysis_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_documents_visit ON documents(visit_id);

-- ==========================================
-- CONSENTS
-- ==========================================
CREATE TABLE IF NOT EXISTS consents (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES patients(id),
  visit_id TEXT NOT NULL REFERENCES visits(id),
  consent_type TEXT NOT NULL
    CHECK (consent_type IN ('data-collection', 'ai-processing', 'document-analysis')),
  accepted INTEGER NOT NULL DEFAULT 0,
  timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_consents_visit ON consents(visit_id);

-- ==========================================
-- AUDIT LOGS
-- ==========================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata TEXT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
