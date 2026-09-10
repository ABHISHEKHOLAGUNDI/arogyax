// ============================================
// ArogyaX — Cloudflare Worker Entry Point
// ============================================

import { Hono } from 'hono';
import { logger } from 'hono/logger';
import type { Env } from './types/env.js';
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler } from './middleware/errorHandler.js';
import healthRoute from './routes/health.js';

// --- Create Hono App ---
const app = new Hono<{ Bindings: Env }>();

// --- Global Middleware ---
app.use('*', logger());
app.use('*', corsMiddleware);

// --- Routes ---
app.route('/api/health', healthRoute);

// --- Root ---
app.get('/', (c) => {
  return c.json({
    name: 'ArogyaX API',
    version: '1.0.0',
    description: 'AI-Powered Multilingual Patient Case-Taking Software',
    health: '/api/health',
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
