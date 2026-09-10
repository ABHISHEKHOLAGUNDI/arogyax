// ============================================
// ArogyaX — Home / Landing Page
// ============================================

import React from 'react';
import { HealthCheck } from '../components/HealthCheck';

export function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-surface-50 to-white">
      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center shadow-glow">
            <span className="text-white text-xl font-bold">A</span>
          </div>
          <span className="text-xl font-bold text-surface-800 tracking-tight">
            Arogya<span className="text-primary-500">X</span>
          </span>
        </div>
        <span className="hidden sm:inline text-xs text-surface-400 bg-surface-100 px-3 py-1 rounded-full">
          SIH 26047 • Ministry of Ayush
        </span>
      </header>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12 animate-in">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-surface-900 tracking-tight mb-4">
            AI-Powered
            <br />
            <span className="text-primary-500">Patient Case-Taking</span>
          </h1>
          <p className="text-lg text-surface-500 max-w-xl mx-auto leading-relaxed">
            Multilingual intelligent intake for AYUSH outpatient departments.
            Collects, structures, and prepares patient information
            before the doctor consultation.
          </p>
        </div>

        {/* Architecture Indicator */}
        <div className="flex flex-wrap justify-center gap-3 mb-12 text-sm animate-in">
          {[
            { icon: '🧑‍⚕️', label: 'Patient' },
            { icon: '→', label: '' },
            { icon: '🤖', label: 'AI Case Intake' },
            { icon: '→', label: '' },
            { icon: '📋', label: 'Structured AYUSH Record' },
            { icon: '→', label: '' },
            { icon: '👨‍⚕️', label: 'Doctor Verification' },
          ].map((item, i) =>
            item.label ? (
              <div
                key={i}
                className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-xl border border-surface-200 shadow-card"
              >
                <span>{item.icon}</span>
                <span className="text-surface-700 font-medium">{item.label}</span>
              </div>
            ) : (
              <span
                key={i}
                className="flex items-center text-surface-300 text-lg"
              >
                {item.icon}
              </span>
            )
          )}
        </div>

        {/* Action Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          <a
            href="/patient"
            className="card-hover p-6 text-center group cursor-pointer"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
              <span className="text-3xl">🧑‍⚕️</span>
            </div>
            <h2 className="text-lg font-semibold text-surface-800 mb-1">
              Patient Intake
            </h2>
            <p className="text-sm text-surface-500">
              Start new visit
            </p>
          </a>

          <a
            href="/doctor"
            className="card-hover p-6 text-center group cursor-pointer"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent-50 flex items-center justify-center group-hover:bg-accent-100 transition-colors">
              <span className="text-3xl">👨‍⚕️</span>
            </div>
            <h2 className="text-lg font-semibold text-surface-800 mb-1">
              Doctor Dashboard
            </h2>
            <p className="text-sm text-surface-500">
              Review cases
            </p>
          </a>

          <a
            href="/admin"
            className="card-hover p-6 text-center group cursor-pointer"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-100 flex items-center justify-center group-hover:bg-surface-200 transition-colors">
              <span className="text-3xl">📊</span>
            </div>
            <h2 className="text-lg font-semibold text-surface-800 mb-1">
              Admin Panel
            </h2>
            <p className="text-sm text-surface-500">
              System overview
            </p>
          </a>
        </div>

        {/* Health Check */}
        <div className="max-w-sm mx-auto">
          <HealthCheck />
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-xs text-surface-400">
          <p>
            ArogyaX • SIH Problem Statement 26047 • Ministry of Ayush / All India Institute of Ayurveda
          </p>
          <p className="mt-1">
            Prototype — Not for clinical production use
          </p>
        </footer>
      </main>
    </div>
  );
}
