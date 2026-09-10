import React from 'react';
import { useIntake } from '../../contexts/IntakeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import type { SupportedLanguage } from '../../types';

export function LanguageSelect() {
  const { nextStep, prevStep } = useIntake();
  const { language, setLanguage, t } = useLanguage();

  const handleSelect = (lang: SupportedLanguage) => {
    setLanguage(lang);
  };

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full animate-slide-up">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-3">{t('language.title')}</h2>
        <p className="text-slate-500 text-lg">{t('language.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {/* English Option */}
        <button
          onClick={() => handleSelect('en')}
          className={`relative p-8 rounded-2xl border-2 text-left transition-all ${
            language === 'en' 
              ? 'border-teal-500 bg-teal-50 ring-4 ring-teal-500/20 shadow-md' 
              : 'border-slate-200 bg-white hover:border-teal-300 hover:shadow-sm'
          }`}
        >
          {language === 'en' && (
            <div className="absolute top-4 right-4 text-teal-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          <h3 className="text-2xl font-bold text-slate-800 mb-2">English</h3>
          <p className="text-slate-500">I prefer to communicate in English</p>
        </button>

        {/* Hindi Option */}
        <button
          onClick={() => handleSelect('hi')}
          className={`relative p-8 rounded-2xl border-2 text-left transition-all ${
            language === 'hi' 
              ? 'border-teal-500 bg-teal-50 ring-4 ring-teal-500/20 shadow-md' 
              : 'border-slate-200 bg-white hover:border-teal-300 hover:shadow-sm'
          }`}
        >
          {language === 'hi' && (
            <div className="absolute top-4 right-4 text-teal-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          <h3 className="text-2xl font-bold text-slate-800 mb-2">हिन्दी (Hindi)</h3>
          <p className="text-slate-500">मैं हिंदी में संवाद करना पसंद करता हूँ</p>
        </button>
      </div>

      <div className="mt-auto flex gap-4 pt-6 border-t border-slate-100">
        <button
          onClick={prevStep}
          className="flex-1 py-4 px-6 rounded-xl border border-slate-200 text-slate-600 font-bold text-lg hover:bg-slate-50 transition-colors"
        >
          {t('common.back')}
        </button>
        <button
          onClick={nextStep}
          className="flex-1 py-4 px-6 rounded-xl bg-teal-600 text-white font-bold text-lg hover:bg-teal-700 shadow-md hover:shadow-lg transition-all"
        >
          {t('common.next')}
        </button>
      </div>
    </div>
  );
}
