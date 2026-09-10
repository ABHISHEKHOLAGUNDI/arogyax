import React from 'react';
import { useIntake } from '../../contexts/IntakeContext';
import { useLanguage } from '../../contexts/LanguageContext';

export function AIInterviewPlaceholder() {
  const { nextStep, prevStep } = useIntake();
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">AI Interview (Phase 4)</h2>
      <div className="flex gap-4">
        <button onClick={prevStep} className="px-4 py-2 border rounded">Back</button>
        <button onClick={nextStep} className="px-4 py-2 bg-teal-600 text-white rounded">Next</button>
      </div>
    </div>
  );
}

export function DocumentUploadPlaceholder() {
  const { nextStep, prevStep } = useIntake();
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">Document Upload (Phase 5)</h2>
      <div className="flex gap-4">
        <button onClick={prevStep} className="px-4 py-2 border rounded">Back</button>
        <button onClick={nextStep} className="px-4 py-2 bg-teal-600 text-white rounded">Next</button>
      </div>
    </div>
  );
}

export function ReviewPlaceholder() {
  const { nextStep, prevStep } = useIntake();
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">Review & Submit (Phase 6)</h2>
      <div className="flex gap-4">
        <button onClick={prevStep} className="px-4 py-2 border rounded">Back</button>
        <button onClick={nextStep} className="px-4 py-2 bg-teal-600 text-white rounded">Next</button>
      </div>
    </div>
  );
}

export function SuccessPlaceholder() {
  const { dispatch } = useIntake();
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-green-600 mb-4">Done!</h2>
      <button 
        onClick={() => dispatch({ type: 'RESET' })} 
        className="px-4 py-2 bg-teal-600 text-white rounded"
      >
        Start Over
      </button>
    </div>
  );
}
