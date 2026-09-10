// ============================================
// ArogyaX — Worker Environment Bindings
// ============================================

export interface Env {
  // --- Cloudflare D1 ---
  DB: D1Database;

  // --- Cloudflare R2 ---
  R2_BUCKET: R2Bucket;

  // --- Secrets (set via wrangler secret put) ---
  OPENAI_API_KEY: string;
  JWT_SECRET: string;

  // --- Environment Variables ---
  APP_ENV: string;
  OPENAI_MODEL: string;
  OPENAI_TRANSCRIPTION_MODEL: string;
}
