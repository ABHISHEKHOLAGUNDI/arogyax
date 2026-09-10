// ============================================
// ArogyaX — Database Service Layer
// ============================================

/**
 * Generates a random UUID-like ID with a prefix.
 * Example: pat_a1b2c3d4e5f6
 */
export function generateId(prefix: string): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 12; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}_${id}`;
}

// ==========================================
// PATIENTS
// ==========================================

export interface CreatePatientInput {
  name: string;
  age: number;
  gender: string;
  phone: string;
  abha_id?: string;
  preferred_language: string;
}

export async function createPatient(db: D1Database, input: CreatePatientInput) {
  const id = generateId('pat');
  await db
    .prepare(
      `INSERT INTO patients (id, name, age, gender, phone, abha_id, preferred_language)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(id, input.name, input.age, input.gender, input.phone, input.abha_id || null, input.preferred_language)
    .run();
  return getPatientById(db, id);
}

export async function getPatientById(db: D1Database, id: string) {
  return db.prepare('SELECT * FROM patients WHERE id = ?').bind(id).first();
}

export async function getPatientByPhone(db: D1Database, phone: string) {
  return db.prepare('SELECT * FROM patients WHERE phone = ?').bind(phone).first();
}

// ==========================================
// VISITS
// ==========================================

export async function createVisit(db: D1Database, patientId: string) {
  const id = generateId('vis');

  // Get next token number for today
  const today = new Date().toISOString().split('T')[0];
  const result = await db
    .prepare(
      `SELECT COALESCE(MAX(token_number), 0) + 1 as next_token
       FROM visits WHERE created_at >= ?`
    )
    .bind(today)
    .first<{ next_token: number }>();

  const tokenNumber = result?.next_token || 1;

  await db
    .prepare(
      `INSERT INTO visits (id, patient_id, token_number, status, priority)
       VALUES (?, ?, ?, 'registered', 'normal')`
    )
    .bind(id, patientId, tokenNumber)
    .run();

  return getVisitById(db, id);
}

export async function getVisitById(db: D1Database, id: string) {
  return db.prepare('SELECT * FROM visits WHERE id = ?').bind(id).first();
}

export async function updateVisitStatus(db: D1Database, id: string, status: string) {
  const completedAt = status === 'consultation-complete' ? new Date().toISOString() : null;
  await db
    .prepare('UPDATE visits SET status = ?, completed_at = COALESCE(?, completed_at) WHERE id = ?')
    .bind(status, completedAt, id)
    .run();
  return getVisitById(db, id);
}

export async function updateVisitPriority(db: D1Database, id: string, priority: string) {
  await db
    .prepare('UPDATE visits SET priority = ? WHERE id = ?')
    .bind(priority, id)
    .run();
  return getVisitById(db, id);
}

/**
 * Get doctor queue: visits that are intake-complete or urgent,
 * joined with patient info.
 */
export async function getDoctorQueue(db: D1Database) {
  return db
    .prepare(
      `SELECT
        v.id, v.patient_id, v.token_number, v.status, v.priority, v.created_at, v.completed_at,
        p.name as patient_name, p.age as patient_age, p.gender as patient_gender,
        p.preferred_language,
        cr.ai_summary,
        CAST((julianday('now') - julianday(v.created_at)) * 24 * 60 AS INTEGER) as waiting_minutes
       FROM visits v
       JOIN patients p ON v.patient_id = p.id
       LEFT JOIN case_records cr ON v.id = cr.visit_id
       WHERE v.status IN ('intake-complete', 'with-doctor')
       ORDER BY
         CASE v.priority
           WHEN 'urgent-review' THEN 0
           WHEN 'review' THEN 1
           ELSE 2
         END,
         v.created_at ASC`
    )
    .all();
}

// ==========================================
// CONVERSATIONS
// ==========================================

export async function addMessage(
  db: D1Database,
  visitId: string,
  speaker: string,
  message: string,
  language: string = 'en'
) {
  const id = generateId('msg');
  await db
    .prepare(
      `INSERT INTO conversations (id, visit_id, speaker, message, language)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(id, visitId, speaker, message, language)
    .run();
  return { id, visit_id: visitId, speaker, message, language };
}

export async function getConversation(db: D1Database, visitId: string) {
  return db
    .prepare('SELECT * FROM conversations WHERE visit_id = ? ORDER BY created_at ASC')
    .bind(visitId)
    .all();
}

/**
 * Get recent conversation (last N messages) for cost-efficient AI calls.
 */
export async function getRecentConversation(db: D1Database, visitId: string, limit: number = 10) {
  return db
    .prepare(
      `SELECT * FROM conversations WHERE visit_id = ?
       ORDER BY created_at DESC LIMIT ?`
    )
    .bind(visitId, limit)
    .all();
}

// ==========================================
// CASE RECORDS
// ==========================================

export async function createOrUpdateCaseRecord(
  db: D1Database,
  visitId: string,
  structuredJson: string,
  aiSummary: string = ''
) {
  const existing = await db
    .prepare('SELECT id FROM case_records WHERE visit_id = ?')
    .bind(visitId)
    .first();

  if (existing) {
    await db
      .prepare(
        `UPDATE case_records
         SET structured_json = ?, ai_summary = ?, updated_at = datetime('now')
         WHERE visit_id = ?`
      )
      .bind(structuredJson, aiSummary, visitId)
      .run();
    return getCaseRecord(db, visitId);
  }

  const id = generateId('case');
  await db
    .prepare(
      `INSERT INTO case_records (id, visit_id, structured_json, ai_summary)
       VALUES (?, ?, ?, ?)`
    )
    .bind(id, visitId, structuredJson, aiSummary)
    .run();
  return getCaseRecord(db, visitId);
}

export async function getCaseRecord(db: D1Database, visitId: string) {
  return db.prepare('SELECT * FROM case_records WHERE visit_id = ?').bind(visitId).first();
}

export async function updateDoctorNotes(db: D1Database, visitId: string, doctorNotes: string) {
  await db
    .prepare(
      `UPDATE case_records SET doctor_notes = ?, updated_at = datetime('now')
       WHERE visit_id = ?`
    )
    .bind(doctorNotes, visitId)
    .run();
  return getCaseRecord(db, visitId);
}

export async function verifyCaseRecord(db: D1Database, visitId: string, status: string) {
  await db
    .prepare(
      `UPDATE case_records SET verification_status = ?, updated_at = datetime('now')
       WHERE visit_id = ?`
    )
    .bind(status, visitId)
    .run();
  return getCaseRecord(db, visitId);
}

// ==========================================
// DOCUMENTS
// ==========================================

export interface CreateDocumentInput {
  visit_id: string;
  r2_key: string;
  filename: string;
  mime_type: string;
  size: number;
}

export async function createDocument(db: D1Database, input: CreateDocumentInput) {
  const id = generateId('doc');
  await db
    .prepare(
      `INSERT INTO documents (id, visit_id, r2_key, filename, mime_type, size)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(id, input.visit_id, input.r2_key, input.filename, input.mime_type, input.size)
    .run();
  return getDocumentById(db, id);
}

export async function getDocumentById(db: D1Database, id: string) {
  return db.prepare('SELECT * FROM documents WHERE id = ?').bind(id).first();
}

export async function getDocumentsByVisit(db: D1Database, visitId: string) {
  return db
    .prepare('SELECT * FROM documents WHERE visit_id = ? ORDER BY created_at ASC')
    .bind(visitId)
    .all();
}

export async function updateDocumentAnalysis(
  db: D1Database,
  id: string,
  extractedJson: string,
  status: string
) {
  await db
    .prepare('UPDATE documents SET extracted_json = ?, analysis_status = ? WHERE id = ?')
    .bind(extractedJson, status, id)
    .run();
  return getDocumentById(db, id);
}

// ==========================================
// CONSENTS
// ==========================================

export async function createConsent(
  db: D1Database,
  patientId: string,
  visitId: string,
  consentType: string,
  accepted: boolean
) {
  const id = generateId('con');
  await db
    .prepare(
      `INSERT INTO consents (id, patient_id, visit_id, consent_type, accepted)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(id, patientId, visitId, consentType, accepted ? 1 : 0)
    .run();
  return { id, patient_id: patientId, visit_id: visitId, consent_type: consentType, accepted };
}

export async function getConsents(db: D1Database, visitId: string) {
  return db.prepare('SELECT * FROM consents WHERE visit_id = ?').bind(visitId).all();
}

// ==========================================
// AUDIT LOGS
// ==========================================

export async function createAuditLog(
  db: D1Database,
  userId: string | null,
  action: string,
  entityType: string,
  entityId: string | null,
  metadata?: Record<string, unknown>
) {
  const id = generateId('aud');
  await db
    .prepare(
      `INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, metadata)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(id, userId, action, entityType, entityId, metadata ? JSON.stringify(metadata) : null)
    .run();
}

// ==========================================
// ADMIN STATS
// ==========================================

export async function getAdminStats(db: D1Database) {
  const today = new Date().toISOString().split('T')[0];

  const [patientsToday, completed, pending, urgent, docsProcessed, languages] = await Promise.all([
    db.prepare(`SELECT COUNT(*) as count FROM visits WHERE created_at >= ?`).bind(today).first<{ count: number }>(),
    db.prepare(`SELECT COUNT(*) as count FROM visits WHERE status = 'consultation-complete'`).first<{ count: number }>(),
    db.prepare(`SELECT COUNT(*) as count FROM visits WHERE status IN ('registered', 'intake-in-progress', 'intake-complete', 'with-doctor')`).first<{ count: number }>(),
    db.prepare(`SELECT COUNT(*) as count FROM visits WHERE priority = 'urgent-review' AND status NOT IN ('consultation-complete', 'cancelled')`).first<{ count: number }>(),
    db.prepare(`SELECT COUNT(*) as count FROM documents WHERE analysis_status = 'completed'`).first<{ count: number }>(),
    db.prepare(`SELECT preferred_language, COUNT(*) as count FROM patients GROUP BY preferred_language`).all(),
  ]);

  // Calculate average intake time (minutes)
  const avgTime = await db
    .prepare(
      `SELECT AVG(
        CAST((julianday(completed_at) - julianday(created_at)) * 24 * 60 AS REAL)
      ) as avg_minutes
      FROM visits WHERE completed_at IS NOT NULL`
    )
    .first<{ avg_minutes: number | null }>();

  const languagesUsed: Record<string, number> = {};
  if (languages.results) {
    for (const row of languages.results as Array<{ preferred_language: string; count: number }>) {
      languagesUsed[row.preferred_language] = row.count;
    }
  }

  return {
    patientsToday: patientsToday?.count || 0,
    casesCompleted: completed?.count || 0,
    casesPending: pending?.count || 0,
    averageIntakeMinutes: Math.round(avgTime?.avg_minutes || 0),
    documentsProcessed: docsProcessed?.count || 0,
    urgentReviewCount: urgent?.count || 0,
    languagesUsed,
  };
}

// ==========================================
// USERS (Auth)
// ==========================================

export async function getUserByEmail(db: D1Database, email: string) {
  return db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
}

export async function getUserById(db: D1Database, id: string) {
  return db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').bind(id).first();
}
