// ============================================
// ArogyaX — Documents API Routes
// ============================================

import { Hono } from 'hono';
import type { Env } from '../types/env.js';
import { createDocument, getDocumentById, getDocumentsByVisit } from '../db/database.js';

const documents = new Hono<{ Bindings: Env }>();

/**
 * POST /api/documents/upload
 * Upload a document (PDF, Image) for a specific visit to Cloudflare R2 and save metadata to D1.
 */
documents.post('/upload', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const visitId = formData.get('visit_id') as string;

    if (!file || !visitId) {
      return c.json({ success: false, error: 'File and visit_id are required' }, 400);
    }

    // Generate a unique R2 object key
    const fileExt = file.name.split('.').pop() || '';
    const uniqueKey = `visits/${visitId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    // Upload to Cloudflare R2
    const arrayBuffer = await file.arrayBuffer();
    await c.env.R2_BUCKET.put(uniqueKey, arrayBuffer, {
      httpMetadata: { contentType: file.type },
    });

    // Save metadata to D1
    const docRecord = await createDocument(c.env.DB, {
      visit_id: visitId,
      r2_key: uniqueKey,
      filename: file.name,
      mime_type: file.type,
      size: file.size,
    });

    // Optionally: trigger background job to parse document via AI here

    return c.json({ success: true, data: { document: docRecord } }, 201);
  } catch (error) {
    console.error('Document upload error:', error);
    return c.json({ success: false, error: 'Failed to upload document' }, 500);
  }
});

/**
 * GET /api/documents/visit/:visitId
 * Get all documents uploaded for a specific visit.
 */
documents.get('/visit/:visitId', async (c) => {
  const visitId = c.req.param('visitId');
  try {
    const docs = await getDocumentsByVisit(c.env.DB, visitId);
    return c.json({ success: true, data: { documents: docs } });
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    return c.json({ success: false, error: 'Failed to fetch documents' }, 500);
  }
});

/**
 * GET /api/documents/:id/download
 * Download a specific document from Cloudflare R2.
 */
documents.get('/:id/download', async (c) => {
  const id = c.req.param('id');
  try {
    const docRecord = await getDocumentById(c.env.DB, id);
    if (!docRecord) {
      return c.json({ success: false, error: 'Document not found in database' }, 404);
    }

    const object = await c.env.R2_BUCKET.get(docRecord.r2_key as string);
    if (!object) {
      return c.json({ success: false, error: 'Document not found in storage' }, 404);
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Content-Disposition', `inline; filename="${docRecord.filename}"`);

    return new Response(object.body, {
      headers,
    });
  } catch (error) {
    console.error('Document download error:', error);
    return c.json({ success: false, error: 'Failed to download document' }, 500);
  }
});

export default documents;
