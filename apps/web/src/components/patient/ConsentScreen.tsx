import React from 'react';
import { useIntake } from '../../contexts/IntakeContext';
import { useLanguage } from '../../contexts/LanguageContext';

export function ConsentScreen() {
  const { state, dispatch, nextStep, prevStep } = useIntake();
  const { t } = useLanguage();

  const handleToggle = () => {
    dispatch({ type: 'SET_CONSENTS', given: !state.consentsGiven });
  };

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full animate-slide-up">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-3">{t('consent.title')}</h2>
        <p className="text-slate-500 text-lg">{t('consent.subtitle')}</p>
      </div>

      <div className="space-y-4 mb-8">
        {/* Important Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex gap-4 items-start">
          <div className="bg-amber-100 text-amber-600 p-2 rounded-lg mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-amber-800 text-lg mb-1">{t('consent.important')}</h4>
            <p className="text-amber-700 leading-relaxed">{t('consent.importantText')}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h4 className="font-bold text-slate-800 text-lg mb-2">{t('consent.dataCollection')}</h4>
          <p className="text-slate-600 leading-relaxed">{t('consent.dataCollectionText')}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h4 className="font-bold text-slate-800 text-lg mb-2">{t('consent.aiProcessing')}</h4>
          <p className="text-slate-600 leading-relaxed">{t('consent.aiProcessingText')}</p>
        </div>
      </div>

      <div className="bg-white border-2 border-slate-200 rounded-xl p-5 mb-8">
        <label className="flex items-center gap-4 cursor-pointer">
          <div className="relative flex items-center justify-center">
            <input 
              type="checkbox" 
              className="peer sr-only"
              checked={state.consentsGiven}
              onChange={handleToggle}
            />
            <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-colors ${
              state.consentsGiven 
                ? 'bg-teal-600 border-teal-600' 
                : 'bg-white border-slate-300 peer-hover:border-teal-400'
            }`}>
              <svg 
                className={`w-5 h-5 text-white transition-opacity ${state.consentsGiven ? 'opacity-100' : 'opacity-0'}`} 
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <span className="text-xl font-bold text-slate-800 select-none">
            {t('consent.acceptAll')}
          </span>
        </label>
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
          disabled={!state.consentsGiven}
          className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg shadow-md transition-all ${
            state.consentsGiven 
              ? 'bg-teal-600 text-white hover:bg-teal-700 hover:shadow-lg cursor-pointer' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {t('common.next')}
        </button>
      </div>
    </div>
  );
}
