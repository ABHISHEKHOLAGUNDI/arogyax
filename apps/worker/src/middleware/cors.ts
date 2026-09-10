// ============================================
// ArogyaX — CORS Middleware
// ============================================

import { Context, Next } from 'hono';
import type { Env } from '../types/env.js';

/**
 * Allowed origins for CORS.
 * In production, restrict to actual deployment domain.
 */
const ALLOWED_ORIGINS = [
  'http://localhost:5173',   // Vite dev server
  'http://localhost:4173',   // Vite preview
  'http://127.0.0.1:5173',
];

export async function corsMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const origin = c.req.header('Origin') || '';

  const isAllowed =
    c.env.APP_ENV === 'development' ||
    ALLOWED_ORIGINS.includes(origin) ||
    origin.endsWith('.pages.dev');

  if (isAllowed) {
    c.header('Access-Control-Allow-Origin', origin);
  }

  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  c.header('Access-Control-Allow-Credentials', 'true');
  c.header('Access-Control-Max-Age', '86400');

  // Handle preflight
  if (c.req.method === 'OPTIONS') {
    return c.body(null, 204);
  }

  await next();
}
