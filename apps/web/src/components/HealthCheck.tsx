// ============================================
// ArogyaX — Health Check Indicator Component
// ============================================

import React from 'react';
import { useHealthCheck } from '../hooks/useHealthCheck';

/**
 * Visual indicator showing backend connectivity status.
 * Displays service-level health when connected.
 */
export function HealthCheck() {
  const { status, data, error, lastChecked, retry } = useHealthCheck();

  return (
    <div className="card p-6 animate-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-surface-700">
          System Status
        </h3>
        <button
          onClick={retry}
          className="btn-ghost text-xs"
          title="Refresh status"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Connection Status */}
      <div className="flex items-center gap-3 mb-4">
        <span
          className={`w-3 h-3 rounded-full ${
            status === 'loading'
              ? 'bg-amber-400 animate-pulse-soft'
              : status === 'connected'
              ? 'bg-green-500'
              : 'bg-red-500'
          }`}
        />
        <span className="font-medium text-surface-800">
          {status === 'loading' && 'Connecting...'}
          {status === 'connected' && 'Connected'}
          {status === 'disconnected' && 'Disconnected'}
        </span>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Service Details */}
      {data?.services && (
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(data.services).map(([service, healthy]) => (
            <div
              key={service}
              className="flex items-center gap-2 text-sm text-surface-600"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  healthy ? 'bg-green-400' : 'bg-surface-300'
                }`}
              />
              <span className="capitalize">{service}</span>
            </div>
          ))}
        </div>
      )}

      {/* Version & Timestamp */}
      {data && (
        <div className="mt-4 pt-3 border-t border-surface-100 text-xs text-surface-400">
          v{data.version} • Checked{' '}
          {lastChecked
            ? lastChecked.toLocaleTimeString()
            : 'never'}
        </div>
      )}
    </div>
  );
}
