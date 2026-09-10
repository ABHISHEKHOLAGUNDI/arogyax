import React from 'react';
import { useIntake } from '../../contexts/IntakeContext';
import { useLanguage } from '../../contexts/LanguageContext';

export function WelcomeScreen() {
  const { nextStep } = useIntake();
  const { t } = useLanguage();

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl mx-auto w-full animate-fade-in">
      <div className="w-24 h-24 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-8 shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4 tracking-tight">
        {t('welcome.title')}
      </h1>
      
      <p className="text-lg md:text-xl text-slate-600 mb-12 leading-relaxed">
        {t('welcome.description')}
      </p>

      <button
        onClick={nextStep}
        className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-bold text-xl py-4 px-12 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
      >
        <span>{t('welcome.startVisit')}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </div>
  );
}
