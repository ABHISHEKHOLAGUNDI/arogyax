// ============================================
// ArogyaX — Auth API Routes
// ============================================

import { Hono } from 'hono';
import type { Env } from '../types/env.js';
import { LoginSchema } from '@arogyax/shared/schemas';
import { getUserByEmail } from '../db/database.js';

const auth = new Hono<{ Bindings: Env }>();

/**
 * POST /api/auth/login
 * Simple login for demo — returns user info.
 * In production, implement proper JWT + bcrypt.
 */
auth.post('/login', async (c) => {
  const body = await c.req.json();
  const parsed = LoginSchema.parse(body);

  const user = await getUserByEmail(c.env.DB, parsed.email);

  if (!user) {
    return c.json({ success: false, error: 'Invalid credentials' }, 401);
  }

  // DEMO: Accept "demo1234" for all demo users
  // In production, use proper bcrypt comparison
  if (parsed.password !== 'demo1234') {
    return c.json({ success: false, error: 'Invalid credentials' }, 401);
  }

  // Return user info (no password hash)
  const { password_hash: _, ...safeUser } = user as Record<string, unknown>;

  return c.json({
    success: true,
    data: {
      user: safeUser,
      token: `demo_token_${safeUser.id}`, // Demo token — use JWT in production
    },
  });
});

export default auth;
