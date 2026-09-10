// ============================================
// ArogyaX — Doctor API Routes
// ============================================

import { Hono } from 'hono';
import type { Env } from '../types/env.js';
import { CaseUpdateSchema } from '@arogyax/shared/schemas';
import {
  getDoctorQueue,
  getVisitById,
  getCaseRecord,
  getConversation,
  getDocumentsByVisit,
  updateVisitStatus,
  updateDoctorNotes,
  verifyCaseRecord,
  createAuditLog,
  getPatientById,
} from '../db/database.js';

const doctor = new Hono<{ Bindings: Env }>();

/**
 * GET /api/doctor/queue
 * Get list of patients waiting for doctor review.
 */
doctor.get('/queue', async (c) => {
  const queue = await getDoctorQueue(c.env.DB);
  return c.json({ success: true, data: queue.results });
});

/**
 * GET /api/doctor/visits/:id
 * Get complete visit data for doctor review.
 */
doctor.get('/visits/:id', async (c) => {
  const id = c.req.param('id');
  const visit = await getVisitById(c.env.DB, id);

  if (!visit) {
    return c.json({ success: false, error: 'Visit not found' }, 404);
  }

  const [patient, caseRecord, conversation, documents] = await Promise.all([
    getPatientById(c.env.DB, visit.patient_id as string),
    getCaseRecord(c.env.DB, id),
    getConversation(c.env.DB, id),
    getDocumentsByVisit(c.env.DB, id),
  ]);

  // Parse structured JSON for response
  let structuredCase = {};
  if (caseRecord?.structured_json) {
    try {
      structuredCase =
        typeof caseRecord.structured_json === 'string'
          ? JSON.parse(caseRecord.structured_json as string)
          : caseRecord.structured_json;
    } catch {
      structuredCase = {};
    }
  }

  // Parse document extracted JSON
  const parsedDocs = (documents.results || []).map((doc: Record<string, unknown>) => {
    let extracted = null;
    if (doc.extracted_json) {
      try {
        extracted =
          typeof doc.extracted_json === 'string'
            ? JSON.parse(doc.extracted_json as string)
            : doc.extracted_json;
      } catch {
        extracted = null;
      }
    }
    return { ...doc, extracted_json: extracted };
  });

  return c.json({
    success: true,
    data: {
      visit,
      patient,
      caseRecord: caseRecord
        ? { ...caseRecord, structured_json: structuredCase }
        : null,
      conversation: conversation.results,
      documents: parsedDocs,
    },
  });
});

/**
 * PATCH /api/doctor/visits/:id/case
 * Update case record (doctor notes, structured data).
 */
doctor.patch('/visits/:id/case', async (c) => {
  const visitId = c.req.param('id');
  const body = await c.req.json();
  const parsed = CaseUpdateSchema.parse(body);

  if (parsed.doctor_notes !== undefined) {
    await updateDoctorNotes(c.env.DB, visitId, parsed.doctor_notes);
  }

  await createAuditLog(c.env.DB, null, 'case.updated', 'case_record', visitId);

  const updated = await getCaseRecord(c.env.DB, visitId);
  return c.json({ success: true, data: updated });
});

/**
 * POST /api/doctor/visits/:id/verify
 * Doctor verifies the case record.
 */
doctor.post('/visits/:id/verify', async (c) => {
  const visitId = c.req.param('id');

  await verifyCaseRecord(c.env.DB, visitId, 'verified');
  await createAuditLog(c.env.DB, null, 'case.verified', 'case_record', visitId);

  const updated = await getCaseRecord(c.env.DB, visitId);
  return c.json({ success: true, data: updated });
});

/**
 * POST /api/doctor/visits/:id/complete
 * Mark consultation as complete.
 */
doctor.post('/visits/:id/complete', async (c) => {
  const visitId = c.req.param('id');

  await updateVisitStatus(c.env.DB, visitId, 'consultation-complete');
  await createAuditLog(c.env.DB, null, 'visit.completed', 'visit', visitId);

  const visit = await getVisitById(c.env.DB, visitId);
  return c.json({ success: true, data: visit });
});

export default doctor;
