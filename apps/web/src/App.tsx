// ============================================
// ArogyaX — Root App Component
// ============================================

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import PatientIntake from './pages/PatientIntake';

/**
 * Root application component with routing.
 * Routes will be expanded in later phases.
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* Phase 3+: Patient intake flow */}
      <Route path="/patient/*" element={<PatientIntake />} />

      {/* Phase 9+: Doctor dashboard */}
      {/* <Route path="/doctor/*" element={<DoctorDashboard />} /> */}

      {/* Phase 14+: Admin dashboard */}
      {/* <Route path="/admin/*" element={<AdminDashboard />} /> */}

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-surface-50">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-surface-300 mb-4">404</h1>
              <p className="text-surface-500 mb-6">Page not found</p>
              <a href="/" className="btn-primary">
                Go Home
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
