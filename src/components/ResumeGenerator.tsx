
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import InitialQuestions from '@/components/InitialQuestions';
import AIInterviewer from '@/components/AIInterviewer';
import ResumePreview from '@/components/ResumePreview';
import { ResumeData } from '@/types/resume';

export type Step = 'initial' | 'interview' | 'preview';

const ResumeGenerator = () => {
  const [currentStep, setCurrentStep] = useState<Step>('initial');
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {},
    style: '',
    targetRole: '',
    experience: [],
    education: [],
    skills: [],
    projects: [],
    achievements: []
  });

  const handleInitialComplete = (data: Partial<ResumeData>) => {
    console.log('Initial data collected:', data);
    setResumeData(prev => ({ ...prev, ...data }));
    setCurrentStep('interview');
  };

  const handleInterviewComplete = (data: ResumeData) => {
    console.log('Interview completed, final data:', data);
    setResumeData(data);
    setCurrentStep('preview');
  };

  const handleStartOver = () => {
    setCurrentStep('initial');
    setResumeData({
      personalInfo: {},
      style: '',
      targetRole: '',
      experience: [],
      education: [],
      skills: [],
      projects: [],
      achievements: []
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center ${currentStep === 'initial' ? 'text-blue-600' : currentStep === 'interview' || currentStep === 'preview' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'initial' ? 'border-blue-600 bg-blue-100' : currentStep === 'interview' || currentStep === 'preview' ? 'border-green-600 bg-green-100' : 'border-gray-300'}`}>
              1
            </div>
            <span className="ml-2 font-medium">Initial Setup</span>
          </div>
          <div className={`w-12 h-0.5 ${currentStep === 'interview' || currentStep === 'preview' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center ${currentStep === 'interview' ? 'text-blue-600' : currentStep === 'preview' ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'interview' ? 'border-blue-600 bg-blue-100' : currentStep === 'preview' ? 'border-green-600 bg-green-100' : 'border-gray-300'}`}>
              2
            </div>
            <span className="ml-2 font-medium">AI Interview</span>
          </div>
          <div className={`w-12 h-0.5 ${currentStep === 'preview' ? 'bg-green-600' : 'bg-gray-300'}`}></div>
          <div className={`flex items-center ${currentStep === 'preview' ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'preview' ? 'border-blue-600 bg-blue-100' : 'border-gray-300'}`}>
              3
            </div>
            <span className="ml-2 font-medium">Resume Preview</span>
          </div>
        </div>
      </div>

      <Card className="shadow-xl border-0">
        {currentStep === 'initial' && (
          <InitialQuestions onComplete={handleInitialComplete} />
        )}
        {currentStep === 'interview' && (
          <AIInterviewer 
            initialData={resumeData} 
            onComplete={handleInterviewComplete}
          />
        )}
        {currentStep === 'preview' && (
          <ResumePreview 
            resumeData={resumeData} 
            onStartOver={handleStartOver}
          />
        )}
      </Card>
    </div>
  );
};

export default ResumeGenerator;
