// ============================================
// ArogyaX — Visit API Routes
// ============================================

import { Hono } from 'hono';
import type { Env } from '../types/env.js';
import { MessageSchema, ConsentSchema } from '@arogyax/shared/schemas';
import {
  createVisit,
  getVisitById,
  updateVisitStatus,
  addMessage,
  getConversation,
  getCaseRecord,
  getDocumentsByVisit,
  getConsents,
  createConsent,
  createAuditLog,
} from '../db/database.js';

const visits = new Hono<{ Bindings: Env }>();

/**
 * POST /api/visits
 * Create a new visit for a patient.
 */
visits.post('/', async (c) => {
  const body = await c.req.json();
  const { patient_id } = body;

  if (!patient_id) {
    return c.json({ success: false, error: 'patient_id is required' }, 400);
  }

  const visit = await createVisit(c.env.DB, patient_id);

  await createAuditLog(c.env.DB, null, 'visit.created', 'visit', visit?.id as string);

  return c.json({ success: true, data: visit }, 201);
});

/**
 * GET /api/visits/:id
 * Get visit details with patient info, conversation, case record, and documents.
 */
visits.get('/:id', async (c) => {
  const id = c.req.param('id');
  const visit = await getVisitById(c.env.DB, id);

  if (!visit) {
    return c.json({ success: false, error: 'Visit not found' }, 404);
  }

  const [conversation, caseRecord, documents, consents] = await Promise.all([
    getConversation(c.env.DB, id),
    getCaseRecord(c.env.DB, id),
    getDocumentsByVisit(c.env.DB, id),
    getConsents(c.env.DB, id),
  ]);

  return c.json({
    success: true,
    data: {
      visit,
      conversation: conversation.results,
      caseRecord,
      documents: documents.results,
      consents: consents.results,
    },
  });
});

/**
 * POST /api/visits/:id/message
 * Add a patient message to the conversation.
 */
visits.post('/:id/message', async (c) => {
  const visitId = c.req.param('id');
  const body = await c.req.json();
  const parsed = MessageSchema.parse(body);

  // Verify visit exists
  const visit = await getVisitById(c.env.DB, visitId);
  if (!visit) {
    return c.json({ success: false, error: 'Visit not found' }, 404);
  }

  // Update status if needed
  if (visit.status === 'registered') {
    await updateVisitStatus(c.env.DB, visitId, 'intake-in-progress');
  }

  // Store patient message
  const message = await addMessage(c.env.DB, visitId, 'patient', parsed.message, parsed.language);

  return c.json({ success: true, data: message }, 201);
});

/**
 * POST /api/visits/:id/consent
 * Record patient consent.
 */
visits.post('/:id/consent', async (c) => {
  const visitId = c.req.param('id');
  const body = await c.req.json();
  const parsed = ConsentSchema.parse(body);

  const visit = await getVisitById(c.env.DB, visitId);
  if (!visit) {
    return c.json({ success: false, error: 'Visit not found' }, 404);
  }

  const consent = await createConsent(
    c.env.DB,
    visit.patient_id as string,
    visitId,
    parsed.consent_type,
    parsed.accepted
  );

  await createAuditLog(c.env.DB, null, 'consent.recorded', 'consent', consent.id);

  return c.json({ success: true, data: consent }, 201);
});

export default visits;
