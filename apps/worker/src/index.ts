// ============================================
// ArogyaX — Cloudflare Worker Entry Point
// ============================================

import { Hono } from 'hono';
import { logger } from 'hono/logger';
import type { Env } from './types/env.js';
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler } from './middleware/errorHandler.js';

// --- Route Imports ---
import healthRoute from './routes/health.js';
import authRoute from './routes/auth.js';
import patientsRoute from './routes/patients.js';
import visitsRoute from './routes/visits.js';
import doctorRoute from './routes/doctor.js';
import adminRoute from './routes/admin.js';

// --- Create Hono App ---
const app = new Hono<{ Bindings: Env }>();

// --- Global Middleware ---
app.use('*', logger());
app.use('*', corsMiddleware);

// --- API Routes ---
app.route('/api/health', healthRoute);
app.route('/api/auth', authRoute);
app.route('/api/patients', patientsRoute);
app.route('/api/visits', visitsRoute);
app.route('/api/doctor', doctorRoute);
app.route('/api/admin', adminRoute);

// --- Root ---
app.get('/', (c) => {
  return c.json({
    name: 'ArogyaX API',
    version: '1.0.0',
    description: 'AI-Powered Multilingual Patient Case-Taking Software',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/login',
      patients: '/api/patients',
      visits: '/api/visits',
      doctor: '/api/doctor/queue',
      admin: '/api/admin/stats',
    },
  });
});

// --- 404 ---
app.notFound((c) => {
  return c.json({ success: false, error: 'Route not found' }, 404);
});

// --- Error Handler ---
app.onError(errorHandler);

// --- Export ---
export default app;
