// ============================================
// ArogyaX — useHealthCheck Hook
// ============================================

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import type { HealthCheckResponse } from '../types';

interface HealthCheckState {
  status: 'loading' | 'connected' | 'disconnected';
  data: HealthCheckResponse | null;
  error: string | null;
  lastChecked: Date | null;
}

/**
 * React hook that checks backend connectivity via /api/health.
 * Polls every 30 seconds when connected, every 10 seconds when disconnected.
 */
export function useHealthCheck() {
  const [state, setState] = useState<HealthCheckState>({
    status: 'loading',
    data: null,
    error: null,
    lastChecked: null,
  });

  const check = useCallback(async () => {
    const result = await api.get<HealthCheckResponse>('/api/health');

    if (result.success && result.data) {
      setState({
        status: 'connected',
        data: result.data,
        error: null,
        lastChecked: new Date(),
      });
    } else {
      setState((prev) => ({
        ...prev,
        status: 'disconnected',
        error: result.error || 'Unable to reach server',
        lastChecked: new Date(),
      }));
    }
  }, []);

  useEffect(() => {
    // Initial check
    check();

    // Poll interval — faster when disconnected
    const interval = setInterval(
      check,
      state.status === 'disconnected' ? 10_000 : 30_000
    );

    return () => clearInterval(interval);
  }, [check, state.status]);

  return { ...state, retry: check };
}
