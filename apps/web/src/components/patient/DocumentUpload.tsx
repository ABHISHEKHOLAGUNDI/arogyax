import React, { useState, useRef } from 'react';
import { useIntake } from '../../contexts/IntakeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../services/api';

export function DocumentUpload() {
  const { state, nextStep, prevStep } = useIntake();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0 || !state.visitId) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const newDocs = [];
      // Upload files sequentially for progress tracking
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('visit_id', state.visitId);

        const res = await api.uploadDocument(formData);
        if (res.success && res.data) {
          newDocs.push(res.data.document);
        } else {
          console.error('Failed to upload', file.name, res.error);
        }
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }

      setUploadedDocs(prev => [...prev, ...newDocs]);
      setFiles([]); // Clear pending files
      
      // Wait a moment before moving to next step if they want
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full animate-slide-up">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-3">{t('documents.title')}</h2>
        <p className="text-slate-500 text-lg">{t('documents.subtitle')}</p>
      </div>

      <div className="flex-1 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col">
        
        {/* Upload Area */}
        <div 
          className="border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 hover:border-teal-400 transition-colors mb-6"
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            multiple 
            accept=".pdf,image/*"
            onChange={handleFileChange}
          />
          <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-1">{t('documents.dragDrop')}</h3>
          <p className="text-slate-500">{t('documents.supportedFiles')}</p>
        </div>

        {/* Pending Files */}
        {files.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
              {t('documents.pendingFiles')}
            </h4>
            <div className="space-y-3">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                  <div className="flex items-center gap-3 truncate">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-medium text-slate-700 truncate">{file.name}</span>
                  </div>
                  <button onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700 p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <button 
              onClick={handleUpload}
              disabled={uploading}
              className="mt-4 w-full bg-teal-600 text-white font-bold py-3 rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              {uploading ? `${t('common.loading')} ${uploadProgress}%` : t('documents.uploadBtn')}
            </button>
          </div>
        )}

        {/* Uploaded Files */}
        {uploadedDocs.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-teal-600 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {t('documents.uploadedSuccessfully')}
            </h4>
            <div className="space-y-3">
              {uploadedDocs.map((doc, index) => (
                <div key={index} className="flex items-center gap-3 bg-teal-50 border border-teal-100 p-4 rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-medium text-teal-800 truncate">{doc.filename}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto flex gap-4 pt-8">
          <button
            onClick={prevStep}
            className="flex-1 py-4 px-6 rounded-xl border border-slate-200 text-slate-600 font-bold text-lg hover:bg-slate-50 transition-colors"
          >
            {t('common.back')}
          </button>
          <button
            onClick={nextStep}
            disabled={uploading}
            className="flex-1 py-4 px-6 rounded-xl bg-teal-600 text-white font-bold text-lg hover:bg-teal-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {uploadedDocs.length > 0 ? t('common.next') : t('documents.skipBtn')}
          </button>
        </div>
      </div>
    </div>
  );
}
