import React, { useState, useRef } from 'react';
import { useIntake } from '../../contexts/IntakeContext';
import { useLanguage } from '../../contexts/LanguageContext';

export function ChiefComplaint() {
  const { state, dispatch, nextStep, prevStep } = useIntake();
  const { t } = useLanguage();
  const [error, setError] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (state.chiefComplaint.trim().length < 5) {
      setError(t('complaint.minLength'));
      return;
    }
    setError('');
    
    // Send initial message to start the AI conversation
    // We'll actually do this API call in the next step (AI Interview), 
    // but we save it to context here.
    nextStep();
  };

  const toggleListen = () => {
    // Placeholder for SpeechRecognition API
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      setError('');
      // In a real app with Web Speech API:
      // recognition.start();
      setTimeout(() => {
        setIsListening(false);
      }, 3000);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full animate-slide-up">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-3">{t('complaint.title')}</h2>
        <p className="text-slate-500 text-lg">{t('complaint.subtitle')}</p>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm mb-6 flex-1 flex flex-col relative">
          
          <textarea
            ref={textareaRef}
            value={state.chiefComplaint}
            onChange={(e) => {
              dispatch({ type: 'SET_CHIEF_COMPLAINT', complaint: e.target.value });
              if (error) setError('');
            }}
            placeholder={t('complaint.placeholder')}
            className="w-full flex-1 p-6 rounded-xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:border-teal-500 text-xl md:text-2xl transition-colors focus:outline-none resize-none leading-relaxed min-h-[200px]"
          />

          <div className="absolute bottom-10 right-10">
            <button
              type="button"
              onClick={toggleListen}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse shadow-red-500/40' 
                  : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/30 hover:scale-105'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          </div>
          
          {isListening && (
            <div className="absolute bottom-10 right-32 text-red-500 font-bold bg-red-50 px-4 py-2 rounded-full animate-bounce">
              {t('voice.listening')}
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6 flex gap-3 items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-blue-700 text-sm leading-relaxed">
            <span className="font-bold">{t('complaint.voiceHint')}:</span> {t('complaint.examples')}
          </p>
        </div>

        {error && <p className="text-red-500 font-bold mb-4 text-center">{error}</p>}

        <div className="mt-auto flex gap-4 pt-6 border-t border-slate-100">
          <button
            onClick={prevStep}
            className="flex-1 py-4 px-6 rounded-xl border border-slate-200 text-slate-600 font-bold text-lg hover:bg-slate-50 transition-colors"
          >
            {t('common.back')}
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-4 px-6 rounded-xl bg-teal-600 text-white font-bold text-lg hover:bg-teal-700 shadow-md hover:shadow-lg transition-all"
          >
            {t('common.next')}
          </button>
        </div>
      </div>
    </div>
  );
}
