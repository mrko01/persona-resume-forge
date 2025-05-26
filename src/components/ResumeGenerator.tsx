
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
    achievements: [],
    extracurriculars: [],
    volunteerWork: [],
    isHighSchoolStudent: false
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
      achievements: [],
      extracurriculars: [],
      volunteerWork: [],
      isHighSchoolStudent: false
    });
  };

  const getStepTitle = (step: Step) => {
    switch (step) {
      case 'initial': return 'Initial Setup';
      case 'interview': return 'AI Interview';
      case 'preview': return 'Resume Preview';
    }
  };

  const getStepDescription = (step: Step) => {
    switch (step) {
      case 'initial': return 'Tell us about yourself';
      case 'interview': return 'Answer personalized questions';
      case 'preview': return 'Review and download';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Enhanced Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-8">
          {(['initial', 'interview', 'preview'] as Step[]).map((step, index) => {
            const stepNumber = index + 1;
            const isActive = currentStep === step;
            const isCompleted = (
              (step === 'initial' && (currentStep === 'interview' || currentStep === 'preview')) ||
              (step === 'interview' && currentStep === 'preview')
            );
            
            return (
              <React.Fragment key={step}>
                <div className={`flex flex-col items-center ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 font-semibold text-lg transition-all duration-300 ${
                    isActive 
                      ? 'border-blue-600 bg-blue-100 shadow-lg scale-110' 
                      : isCompleted 
                        ? 'border-green-600 bg-green-100' 
                        : 'border-gray-300 bg-gray-50'
                  }`}>
                    {isCompleted ? '✓' : stepNumber}
                  </div>
                  <div className="mt-2 text-center">
                    <div className="font-medium text-sm">{getStepTitle(step)}</div>
                    <div className="text-xs text-gray-500">{getStepDescription(step)}</div>
                  </div>
                </div>
                {index < 2 && (
                  <div className={`w-16 h-1 rounded-full transition-all duration-300 ${
                    isCompleted ? 'bg-green-600' : 'bg-gray-300'
                  }`}></div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
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
