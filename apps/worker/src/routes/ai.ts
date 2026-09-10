// ============================================
// ArogyaX — AI API Routes
// ============================================

import { Hono } from 'hono';
import type { Env } from '../types/env.js';
import { 
  getOpenAIClient, 
  generateChatResponse, 
  extractStructuredCase,
  type ChatMessage 
} from '../ai/openai.js';
import { 
  getVisitById, 
  getRecentConversation, 
  addMessage, 
  createOrUpdateCaseRecord,
  getPatientById
} from '../db/database.js';

const ai = new Hono<{ Bindings: Env }>();

/**
 * POST /api/ai/chat
 * Handle patient chat message, generate AI response, and optionally trigger structured extraction in background.
 */
ai.post('/chat', async (c) => {
  const body = await c.req.json();
  const { visit_id, message, language } = body;

  if (!visit_id || !message) {
    return c.json({ success: false, error: 'visit_id and message are required' }, 400);
  }

  // Check if OpenAI key is configured
  if (!c.env.OPENAI_API_KEY || c.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    // Return a mocked response if no key is set, so the UI doesn't break during dev
    const mockReply = language === 'hi' 
      ? 'धन्यवाद। क्या आप इसके बारे में कुछ और बता सकते हैं?'
      : 'Thank you for sharing that. Could you tell me a little more about it?';
      
    await addMessage(c.env.DB, visit_id, 'patient', message, language || 'en');
    const aiMessage = await addMessage(c.env.DB, visit_id, 'ai', mockReply, language || 'en');
    
    return c.json({ success: true, data: { message: aiMessage } });
  }

  try {
    const db = c.env.DB;
    const client = getOpenAIClient(c.env.OPENAI_API_KEY);
    const model = c.env.OPENAI_MODEL || 'gpt-4o-mini';

    // 1. Verify Visit & Get Patient Lang
    const visit = await getVisitById(db, visit_id);
    if (!visit) {
      return c.json({ success: false, error: 'Visit not found' }, 404);
    }
    
    const patient = await getPatientById(db, visit.patient_id as string);
    const prefLanguage = language || patient?.preferred_language || 'en';

    // 2. Save User Message
    await addMessage(db, visit_id, 'patient', message, prefLanguage);

    // 3. Fetch Recent Context
    // We get last 10 messages to save tokens while keeping context
    const recentHistory = await getRecentConversation(db, visit_id, 10);
    
    // Map DB schema to OpenAI schema, excluding the very latest user message since we pass it separately
    const chatHistory: ChatMessage[] = recentHistory
      .reverse() // getRecentConversation sorts DESC, we need chronological
      .slice(0, -1) // remove the message we just added so we can pass it as 'newMessage'
      .map(row => ({
        role: row.speaker === 'ai' ? 'assistant' : row.speaker === 'patient' ? 'user' : 'system',
        content: row.message as string
      }))
      // Filter out 'system' messages if any, unless we want them in context
      .filter(row => row.role !== 'system') as ChatMessage[];

    // 4. Get AI Response
    const aiResponseContent = await generateChatResponse(
      client,
      model,
      prefLanguage,
      chatHistory,
      message
    );

    // 5. Save AI Response
    const aiMessage = await addMessage(db, visit_id, 'ai', aiResponseContent, prefLanguage);

    // 6. Background Task: Extract Structured Data
    // We only trigger extraction every 3 messages, or if the user says they are "done" (which we might handle via a different endpoint)
    // For now, let's trigger it every time in the background. Cloudflare worker waituntil handles it cleanly.
    c.executionCtx.waitUntil((async () => {
      try {
        // Fetch FULL history for accurate extraction
        const fullHistoryRows = await getRecentConversation(db, visit_id, 100);
        const fullHistory: ChatMessage[] = fullHistoryRows.reverse().map(row => ({
          role: row.speaker === 'ai' ? 'assistant' : 'user',
          content: row.message as string
        })) as ChatMessage[];

        const extracted = await extractStructuredCase(client, 'gpt-4o-2024-08-06', fullHistory);
        
        // Remove aiSummary from structured payload to store it in its own column
        const { aiSummary, ...structuredJson } = extracted;

        await createOrUpdateCaseRecord(
          db, 
          visit_id, 
          JSON.stringify(structuredJson), 
          aiSummary
        );
      } catch (e) {
        console.error("Background extraction failed:", e);
      }
    })());

    return c.json({ success: true, data: { message: aiMessage } });

  } catch (error) {
    console.error("AI Error:", error);
    return c.json({ success: false, error: 'Failed to process AI response' }, 500);
  }
});

export default ai;
