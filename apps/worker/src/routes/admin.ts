// ============================================
// ArogyaX — Admin API Routes
// ============================================

import { Hono } from 'hono';
import type { Env } from '../types/env.js';
import { getAdminStats } from '../db/database.js';

const admin = new Hono<{ Bindings: Env }>();

/**
 * GET /api/admin/stats
 * Get system-wide statistics for admin dashboard.
 */
admin.get('/stats', async (c) => {
  const stats = await getAdminStats(c.env.DB);
  return c.json({ success: true, data: stats });
});

export default admin;
