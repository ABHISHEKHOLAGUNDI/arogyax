import React from 'react';
import { useIntake, PATIENT_STEPS } from '../../contexts/IntakeContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface LayoutProps {
  children: React.ReactNode;
}

export function PatientLayout({ children }: LayoutProps) {
  const { state } = useIntake();
  const { t } = useLanguage();

  // Calculate progress
  const totalSteps = PATIENT_STEPS.length - 1; // Exclude success step from progress
  const progress = state.currentStep === 'success' 
    ? 100 
    : Math.round((state.stepIndex / totalSteps) * 100);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 py-4 px-6 md:px-8 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-inner">
            A
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 leading-tight">{t('app.name')}</h1>
            <p className="text-xs text-slate-500 font-medium">{t('app.tagline')}</p>
          </div>
        </div>
        
        {/* Token/Visit ID display if available */}
        {state.tokenNumber && state.currentStep !== 'welcome' && state.currentStep !== 'success' && (
          <div className="bg-slate-100 px-3 py-1.5 rounded-full text-sm font-medium text-slate-700 border border-slate-200">
            Token: <span className="font-bold text-teal-700">#{state.tokenNumber}</span>
          </div>
        )}
      </header>

      {/* Progress Bar (Hidden on welcome and success screens) */}
      {state.currentStep !== 'welcome' && state.currentStep !== 'success' && (
        <div className="w-full bg-slate-200 h-1.5">
          <div 
            className="bg-teal-500 h-1.5 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Decorative background blur */}
        <div className="absolute top-0 left-0 w-full h-64 bg-teal-600/5 blur-3xl -z-10 rounded-b-full"></div>
        
        <div className="flex-1 overflow-y-auto w-full">
          <div className="max-w-3xl mx-auto w-full px-4 py-8 md:py-12 flex flex-col min-h-full">
            {children}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white py-4 px-6 text-center border-t border-slate-200 mt-auto">
        <p className="text-xs text-slate-400 font-medium">{t('welcome.poweredBy')} • {t('welcome.demoMode')}</p>
      </footer>
    </div>
  );
}
