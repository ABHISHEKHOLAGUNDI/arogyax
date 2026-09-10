// ============================================
// ArogyaX — API Client Service
// ============================================

import type { APIResponse } from '../types';

/**
 * Base API URL.
 * In development with Vite proxy, requests to /api are forwarded to the worker.
 * In production, this points to the deployed worker URL.
 */
const BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Typed fetch wrapper with error handling.
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  // Add auth token if available
  const token = localStorage.getItem('arogyax_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}`,
      };
    }

    return data as APIResponse<T>;
  } catch (error) {
    // Network error / offline
    const message =
      error instanceof Error ? error.message : 'Network error';

    return {
      success: false,
      error: `Connection failed: ${message}`,
    };
  }
}

// --- Convenience Methods ---

export const api = {
  get: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),

  /**
   * Upload file(s) — does NOT set Content-Type (let browser set multipart boundary).
   */
  upload: <T>(endpoint: string, formData: FormData) =>
    request<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type so browser sets multipart boundary
    }),

  // Domain-specific helpers
  createPatient: (data: any) => api.post<{ id: string }>('/api/patients', data),
  createVisit: (patientId: string) => api.post<{ id: string; token_number: number }>('/api/visits', { patient_id: patientId }),
  recordConsent: (visitId: string, data: { consent_type: string; accepted: boolean }) => api.post(`/api/visits/${visitId}/consent`, data),
  sendChatMessage: (visitId: string, message: string, language: string) => 
    api.post<{ message: { id: string; speaker: string; message: string; language: string } }>('/api/ai/chat', { visit_id: visitId, message, language }),
  uploadDocument: (formData: FormData) => api.upload<{ document: { id: string; r2_key: string; filename: string } }>('/api/documents/upload', formData),
};

export default api;
