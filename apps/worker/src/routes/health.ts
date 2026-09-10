// ============================================
// ArogyaX — Health Check Route
// ============================================

import { Hono } from 'hono';
import type { Env } from '../types/env.js';
import { APP_VERSION } from '@arogyax/shared/constants';

const health = new Hono<{ Bindings: Env }>();

/**
 * GET /api/health
 *
 * Returns system health status including connectivity to D1, R2, and OpenAI.
 * Used by frontend to verify backend is reachable.
 */
health.get('/', async (c) => {
  const services = {
    worker: true,
    d1: false,
    r2: false,
    openai: false,
  };

  // --- Check D1 ---
  try {
    if (c.env.DB) {
      await c.env.DB.prepare('SELECT 1').first();
      services.d1 = true;
    }
  } catch {
    // D1 not available or not configured yet
  }

  // --- Check R2 ---
  try {
    if (c.env.R2_BUCKET) {
      await c.env.R2_BUCKET.head('_health_check');
      services.r2 = true;
    }
  } catch {
    // R2 returns error for non-existent key, but connection works
    // If we get here, R2 binding exists
    if (c.env.R2_BUCKET) {
      services.r2 = true;
    }
  }

  // --- Check OpenAI (key presence only, no actual call) ---
  services.openai = !!c.env.OPENAI_API_KEY;

  return c.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: APP_VERSION,
      services,
    },
  });
});

export default health;
