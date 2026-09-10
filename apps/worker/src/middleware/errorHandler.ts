// ============================================
// ArogyaX — Error Handler Middleware
// ============================================

import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';

/**
 * Global error handler.
 * Returns structured JSON errors. Never leaks stack traces in production.
 */
export function errorHandler(err: Error, c: Context): Response {
  console.error(`[ArogyaX Error] ${err.message}`);

  // --- Zod Validation Error ---
  if (err instanceof ZodError) {
    return c.json(
      {
        success: false,
        error: 'Validation error',
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
      400
    );
  }

  // --- Hono HTTP Exception ---
  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        error: err.message,
      },
      err.status
    );
  }

  // --- Generic Error ---
  const isDev = c.env?.APP_ENV === 'development';

  return c.json(
    {
      success: false,
      error: isDev ? err.message : 'Internal server error',
    },
    500
  );
}
