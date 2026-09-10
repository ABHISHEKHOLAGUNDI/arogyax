import React from 'react';
import { IntakeProvider, useIntake } from '../contexts/IntakeContext';
import { LanguageProvider } from '../contexts/LanguageContext';

// Components
import { PatientLayout } from '../components/patient/Layout';
import { WelcomeScreen } from '../components/patient/WelcomeScreen';
import { LanguageSelect } from '../components/patient/LanguageSelect';
import { ConsentScreen } from '../components/patient/ConsentScreen';
import { PatientForm } from '../components/patient/PatientForm';
import { ChiefComplaint } from '../components/patient/ChiefComplaint';
import { AIInterview } from '../components/patient/AIInterview';
import { 
  DocumentUploadPlaceholder, 
  ReviewPlaceholder, 
  SuccessPlaceholder 
} from '../components/patient/Placeholders';

function IntakeOrchestrator() {
  const { state } = useIntake();

  const renderStep = () => {
    switch (state.currentStep) {
      case 'welcome':
        return <WelcomeScreen />;
      case 'language':
        return <LanguageSelect />;
      case 'consent':
        return <ConsentScreen />;
      case 'patient-details':
        return <PatientForm />;
      case 'chief-complaint':
        return <ChiefComplaint />;
      case 'ai-interview':
        return <AIInterview />;
      case 'document-upload':
        return <DocumentUploadPlaceholder />;
      case 'review':
      case 'submit':
        return <ReviewPlaceholder />;
      case 'success':
        return <SuccessPlaceholder />;
      default:
        return <WelcomeScreen />;
    }
  };

  return <PatientLayout>{renderStep()}</PatientLayout>;
}

export default function PatientIntake() {
  return (
    <LanguageProvider>
      <IntakeProvider>
        <IntakeOrchestrator />
      </IntakeProvider>
    </LanguageProvider>
  );
}
