// ============================================
// ArogyaX — Patient API Routes
// ============================================

import { Hono } from 'hono';
import type { Env } from '../types/env.js';
import { PatientSchema } from '@arogyax/shared/schemas';
import {
  createPatient,
  getPatientById,
  createConsent,
} from '../db/database.js';

const patients = new Hono<{ Bindings: Env }>();

/**
 * POST /api/patients
 * Register a new patient.
 */
patients.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = PatientSchema.parse(body);
  const patient = await createPatient(c.env.DB, parsed);

  return c.json({ success: true, data: patient }, 201);
});

/**
 * GET /api/patients/:id
 * Get patient by ID.
 */
patients.get('/:id', async (c) => {
  const id = c.req.param('id');
  const patient = await getPatientById(c.env.DB, id);

  if (!patient) {
    return c.json({ success: false, error: 'Patient not found' }, 404);
  }

  return c.json({ success: true, data: patient });
});

export default patients;
