-- ============================================
-- ArogyaX — Seed Data
-- Migration: 0002_seed_data
-- DEMO / SAMPLE DATA — Not real patient data
-- ============================================

-- ==========================================
-- Demo Users (password: demo1234)
-- Hash is bcrypt of "demo1234" — for demo only
-- In production, use proper password hashing
-- ==========================================
INSERT OR IGNORE INTO users (id, name, email, password_hash, role) VALUES
  ('usr_doctor_001', 'Dr. Priya Sharma', 'doctor@arogyax.in', '$2a$10$demo.hash.placeholder.doctor', 'doctor'),
  ('usr_doctor_002', 'Dr. Rajesh Verma', 'doctor2@arogyax.in', '$2a$10$demo.hash.placeholder.doctor2', 'doctor'),
  ('usr_admin_001', 'Admin User', 'admin@arogyax.in', '$2a$10$demo.hash.placeholder.admin', 'admin');

-- ==========================================
-- Sample Patient: Ramesh Kumar
-- ==========================================
INSERT OR IGNORE INTO patients (id, name, age, gender, phone, abha_id, preferred_language) VALUES
  ('pat_sample_001', 'Ramesh Kumar', 42, 'male', '9876543210', 'ABHA-1234-5678-9012', 'hi');

-- ==========================================
-- Sample Visit
-- ==========================================
INSERT OR IGNORE INTO visits (id, patient_id, token_number, status, priority) VALUES
  ('vis_sample_001', 'pat_sample_001', 1, 'intake-complete', 'normal');

-- ==========================================
-- Sample Conversation
-- ==========================================
INSERT OR IGNORE INTO conversations (id, visit_id, speaker, message, language) VALUES
  ('conv_001', 'vis_sample_001', 'system', 'Welcome to ArogyaX. How can I help you today?', 'en'),
  ('conv_002', 'vis_sample_001', 'patient', 'Mujhe 3 mahine se pet mein jalan ho rahi hai.', 'hi'),
  ('conv_003', 'vis_sample_001', 'ai', 'Yeh jalan kab se ho rahi hai? Kya yeh khaana khaane ke baad badhti hai?', 'hi'),
  ('conv_004', 'vis_sample_001', 'patient', 'Haan, khaana khaane ke baad aur zyada hoti hai. Kabhi kabhi pet phula hua lagta hai.', 'hi'),
  ('conv_005', 'vis_sample_001', 'ai', 'Kya aapko ulti ya khoon ki ulti hui hai?', 'hi'),
  ('conv_006', 'vis_sample_001', 'patient', 'Nahi, ulti nahi hui.', 'hi');

-- ==========================================
-- Sample Case Record
-- ==========================================
INSERT OR IGNORE INTO case_records (id, visit_id, structured_json, ai_summary, doctor_notes, verification_status) VALUES
  ('case_sample_001', 'vis_sample_001',
  '{
    "chiefComplaint": ["Burning sensation in abdomen (pet mein jalan)"],
    "historyOfPresentIllness": {
      "onset": "Gradual",
      "duration": "3 months",
      "location": "Epigastric region",
      "character": "Burning",
      "severity": "Moderate",
      "aggravatingFactors": ["After meals", "Spicy food"],
      "relievingFactors": [],
      "associatedSymptoms": ["Occasional bloating"]
    },
    "pastMedicalHistory": ["Hypertension (4 years)"],
    "pastSurgicalHistory": [],
    "medications": [
      {
        "name": "Amlodipine",
        "dosage": "5mg",
        "frequency": "Once daily",
        "duration": "4 years",
        "confidence": "MEDIUM"
      }
    ],
    "allergies": [],
    "familyHistory": [],
    "personalHistory": {},
    "diet": {"type": "Mixed", "spicy": "Regular"},
    "sleep": {"quality": "Disturbed occasionally"},
    "appetite": {"status": "Reduced after onset"},
    "bowel": {"frequency": "Regular"},
    "urine": {"frequency": "Normal"},
    "habits": [],
    "occupation": "Shopkeeper",
    "lifestyle": {"exercise": "Minimal", "stress": "Moderate"},
    "ayurveda": {
      "trividhaPariksha": {
        "darshana": "",
        "sparshana": "",
        "prashna": "Patient reports burning in abdomen region"
      },
      "ashtavidhaPariksha": {
        "nadi": "",
        "mutra": "Normal frequency reported",
        "mala": "Regular",
        "jihva": "",
        "shabda": "",
        "sparsha": "",
        "drik": "",
        "akriti": ""
      },
      "dashavidhaPariksha": {
        "prakriti": "",
        "vikriti": "",
        "sara": "",
        "samhanana": "",
        "pramana": "",
        "satmya": "",
        "satva": "",
        "aharaShakti": "Reduced",
        "vyayamaShakti": "",
        "vaya": "Madhyama (42 years)"
      }
    },
    "possibleRedFlags": [],
    "missingInformation": [
      "Detailed family history",
      "Allergy information",
      "Complete Ayurvedic assessment (Nadi, Jihva, Sparsha, Drik, Akriti)",
      "Prakriti assessment"
    ],
    "recommendedNextQuestion": "Do you have any known allergies to food or medications?",
    "confidence": {
      "chiefComplaint": "HIGH",
      "duration": "HIGH",
      "medications": "MEDIUM",
      "severity": "MEDIUM"
    }
  }',
  '42-year-old male presenting with burning epigastric discomfort for approximately 3 months, reportedly worsened after meals, especially spicy food. Occasional bloating noted. No vomiting or hematemesis reported. History of hypertension for 4 years. Currently taking amlodipine according to patient report. Appetite reported as reduced since symptom onset.',
  '',
  'pending');

-- ==========================================
-- Sample Consent
-- ==========================================
INSERT OR IGNORE INTO consents (id, patient_id, visit_id, consent_type, accepted) VALUES
  ('con_001', 'pat_sample_001', 'vis_sample_001', 'data-collection', 1),
  ('con_002', 'pat_sample_001', 'vis_sample_001', 'ai-processing', 1);

-- ==========================================
-- Sample Document Metadata
-- (No actual R2 file — demo placeholder)
-- ==========================================
INSERT OR IGNORE INTO documents (id, visit_id, r2_key, filename, mime_type, size, extracted_json, analysis_status) VALUES
  ('doc_sample_001', 'vis_sample_001', 'demo/sample_prescription.jpg', 'prescription_dr_mehta.jpg', 'image/jpeg', 245760,
  '{
    "documentType": "Prescription",
    "date": "2026-06-15",
    "doctor": "Dr. R.K. Mehta",
    "hospital": "District Hospital, Jaipur",
    "medications": [
      {"name": "Amlodipine", "dosage": "5mg", "frequency": "Once daily", "duration": "Ongoing", "confidence": "HIGH"}
    ],
    "diagnosesMentionedInDocument": ["Essential Hypertension"],
    "tests": [],
    "results": [],
    "allergies": [],
    "notes": ["Follow up after 3 months"],
    "importantFindings": [],
    "confidence": {"documentType": "HIGH", "medications": "HIGH", "doctor": "MEDIUM"}
  }',
  'completed');
