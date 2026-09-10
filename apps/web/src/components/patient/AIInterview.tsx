import React, { useState, useEffect, useRef } from 'react';
import { useIntake } from '../../contexts/IntakeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../services/api';

export function AIInterview() {
  const { state, dispatch, nextStep } = useIntake();
  const { t } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.conversationHistory, isLoading]);

  // Initial trigger: send the chief complaint to AI if it hasn't been sent yet
  useEffect(() => {
    const startInterview = async () => {
      // Only trigger if we have a visit_id and haven't sent the first message yet
      if (state.visitId && state.conversationHistory.length === 0 && state.chiefComplaint) {
        setIsLoading(true);
        try {
          // Send the initial chief complaint
          dispatch({ type: 'ADD_MESSAGE', speaker: 'patient', message: state.chiefComplaint });
          
          const res = await api.sendChatMessage(
            state.visitId, 
            state.chiefComplaint, 
            state.language
          );

          if (res.success && res.data) {
            dispatch({ type: 'ADD_MESSAGE', speaker: 'ai', message: res.data.message.message });
          }
        } catch (error) {
          console.error("Failed to start AI interview", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    startInterview();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.visitId]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading || !state.visitId) return;

    const message = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      // Optimistically add user message to UI
      dispatch({ type: 'ADD_MESSAGE', speaker: 'patient', message });

      const res = await api.sendChatMessage(state.visitId, message, state.language);

      if (res.success && res.data) {
        dispatch({ type: 'ADD_MESSAGE', speaker: 'ai', message: res.data.message.message });
      } else {
        throw new Error(res.error || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      // Don't completely break, maybe show a toast or error in chat
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListen = () => {
    // Placeholder for Web Speech API
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        setInputText(prev => prev + " " + "I have a sharp pain in my stomach.");
      }, 2000);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[80vh] max-w-3xl mx-auto w-full animate-slide-up">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">{t('interview.title')}</h2>
        <p className="text-slate-500">{t('interview.subtitle')}</p>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden mb-6">
        
        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50">
          {state.conversationHistory.length === 0 && isLoading && (
             <div className="flex justify-center items-center h-full text-slate-400">
               <div className="animate-pulse flex items-center gap-2">
                 <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                 <div className="w-2 h-2 bg-teal-500 rounded-full animation-delay-200"></div>
                 <div className="w-2 h-2 bg-teal-500 rounded-full animation-delay-400"></div>
                 <span>{t('interview.thinking')}</span>
               </div>
             </div>
          )}

          {state.conversationHistory.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex ${msg.speaker === 'patient' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div 
                className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                  msg.speaker === 'patient' 
                    ? 'bg-teal-600 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                }`}
              >
                <p className="text-lg leading-relaxed whitespace-pre-wrap">{msg.message}</p>
              </div>
            </div>
          ))}

          {isLoading && state.conversationHistory.length > 0 && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 rounded-tl-none shadow-sm flex gap-2 items-center">
                 <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                 <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form onSubmit={handleSend} className="flex gap-2">
            <button
              type="button"
              onClick={toggleListen}
              disabled={isLoading}
              className={`p-3 md:p-4 rounded-xl flex items-center justify-center transition-all ${
                isListening 
                  ? 'bg-red-50 text-red-500 border-red-200' 
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isListening ? 'animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
            
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              placeholder={t('interview.typeHere')}
              className="flex-1 bg-slate-100 border-transparent focus:border-teal-500 focus:bg-white focus:ring-0 rounded-xl px-4 py-3 text-lg disabled:opacity-50 transition-colors"
            />
            
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-sm"
            >
              {t('interview.send')}
            </button>
          </form>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={nextStep}
          className="flex-1 py-4 rounded-xl border border-teal-200 bg-teal-50 text-teal-700 font-bold text-lg hover:bg-teal-100 transition-colors"
        >
          {t('interview.complete')}
        </button>
      </div>
    </div>
  );
}
