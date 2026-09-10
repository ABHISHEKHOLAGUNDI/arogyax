import React, { useState } from 'react';
import { useIntake } from '../../contexts/IntakeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../services/api';

export function PatientForm() {
  const { state, dispatch, nextStep, prevStep } = useIntake();
  const { t } = useLanguage();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!state.name.trim()) newErrors.name = t('errors.nameRequired');
    if (!state.age || isNaN(Number(state.age)) || Number(state.age) <= 0) {
      newErrors.age = t('errors.ageRequired');
    }
    if (!state.gender) newErrors.gender = t('errors.genderRequired');
    if (!state.phone || state.phone.length !== 10 || isNaN(Number(state.phone))) {
      newErrors.phone = t('errors.phoneRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    
    try {
      // 1. Create Patient
      const patientRes = await api.createPatient({
        name: state.name,
        age: Number(state.age),
        gender: state.gender,
        phone: state.phone,
        abha_id: state.abhaId || undefined,
        preferred_language: state.language
      });

      if (!patientRes.success || !patientRes.data) {
        throw new Error('Failed to create patient');
      }

      const patientId = patientRes.data.id;

      // 2. Create Visit
      const visitRes = await api.createVisit(patientId);
      
      if (!visitRes.success || !visitRes.data) {
        throw new Error('Failed to create visit');
      }

      const visitId = visitRes.data.id;
      const tokenNumber = visitRes.data.token_number;

      // 3. Record Consents
      await Promise.all([
        api.recordConsent(visitId, { consent_type: 'data-collection', accepted: true }),
        api.recordConsent(visitId, { consent_type: 'ai-processing', accepted: true })
      ]);

      // Save to context
      dispatch({ 
        type: 'SET_PATIENT_ID', 
        patientId, 
        visitId, 
        tokenNumber 
      });
      
      // Move to next step
      nextStep();
      
    } catch (err) {
      console.error('Error creating patient:', err);
      dispatch({ type: 'SET_ERROR', error: t('errors.networkError') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    dispatch({ 
      type: 'SET_PATIENT_DETAILS', 
      details: { [e.target.name]: e.target.value } 
    });
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full animate-slide-up">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-3">{t('patient.title')}</h2>
        <p className="text-slate-500 text-lg">{t('patient.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
        <div className="space-y-6 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm mb-8">
          
          {/* Name */}
          <div>
            <label className="block text-slate-700 font-bold mb-2 text-lg">
              {t('patient.name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={state.name}
              onChange={handleChange}
              placeholder={t('patient.namePlaceholder')}
              className={`w-full p-4 rounded-xl border-2 text-lg transition-colors focus:outline-none ${
                errors.name ? 'border-red-300 focus:border-red-500 bg-red-50' : 'border-slate-200 focus:border-teal-500'
              }`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Age */}
            <div>
              <label className="block text-slate-700 font-bold mb-2 text-lg">
                {t('patient.age')} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="age"
                value={state.age}
                onChange={handleChange}
                placeholder={t('patient.agePlaceholder')}
                className={`w-full p-4 rounded-xl border-2 text-lg transition-colors focus:outline-none ${
                  errors.age ? 'border-red-300 focus:border-red-500 bg-red-50' : 'border-slate-200 focus:border-teal-500'
                }`}
              />
              {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-slate-700 font-bold mb-2 text-lg">
                {t('patient.gender')} <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2 h-[60px]">
                {['male', 'female', 'other'].map((g) => (
                  <button
                    type="button"
                    key={g}
                    onClick={() => {
                      dispatch({ type: 'SET_PATIENT_DETAILS', details: { gender: g } });
                      if (errors.gender) setErrors({ ...errors, gender: '' });
                    }}
                    className={`rounded-xl border-2 font-bold transition-all ${
                      state.gender === g 
                        ? 'bg-teal-50 border-teal-500 text-teal-700 shadow-sm' 
                        : 'bg-white border-slate-200 text-slate-500 hover:border-teal-300'
                    }`}
                  >
                    {t(`patient.${g}`)}
                  </button>
                ))}
              </div>
              {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-slate-700 font-bold mb-2 text-lg">
              {t('patient.phone')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                +91
              </span>
              <input
                type="tel"
                name="phone"
                value={state.phone}
                onChange={handleChange}
                maxLength={10}
                placeholder={t('patient.phonePlaceholder')}
                className={`w-full p-4 pl-14 rounded-xl border-2 text-lg transition-colors focus:outline-none ${
                  errors.phone ? 'border-red-300 focus:border-red-500 bg-red-50' : 'border-slate-200 focus:border-teal-500'
                }`}
              />
            </div>
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          {/* ABHA ID */}
          <div>
            <label className="block text-slate-700 font-bold mb-2 text-lg">
              {t('patient.abhaId')}
            </label>
            <input
              type="text"
              name="abhaId"
              value={state.abhaId}
              onChange={handleChange}
              placeholder={t('patient.abhaIdPlaceholder')}
              className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-teal-500 text-lg transition-colors focus:outline-none"
            />
          </div>
          
        </div>

        {/* Global Error */}
        {state.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
            <p className="font-bold">{t('common.error')}</p>
            <p>{state.error}</p>
          </div>
        )}

        <div className="mt-auto flex gap-4 pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={prevStep}
            disabled={isSubmitting}
            className="flex-1 py-4 px-6 rounded-xl border border-slate-200 text-slate-600 font-bold text-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            {t('common.back')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-4 px-6 rounded-xl bg-teal-600 text-white font-bold text-lg hover:bg-teal-700 shadow-md hover:shadow-lg transition-all disabled:opacity-70 flex justify-center items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('common.loading')}
              </>
            ) : (
              t('common.next')
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
