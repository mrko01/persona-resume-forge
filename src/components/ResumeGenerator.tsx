
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import InitialQuestions from '@/components/InitialQuestions';
import AIInterviewer from '@/components/AIInterviewer';
import ResumePreview from '@/components/ResumePreview';
import { ResumeData } from '@/types/resume';
import { CheckCircle, Clock, User, Bot, FileText } from 'lucide-react';

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

  const steps = [
    { 
      key: 'initial' as Step, 
      title: 'Setup', 
      description: 'Basic information',
      icon: User 
    },
    { 
      key: 'interview' as Step, 
      title: 'Interview', 
      description: 'AI-powered questions',
      icon: Bot 
    },
    { 
      key: 'preview' as Step, 
      title: 'Preview', 
      description: 'Review & download',
      icon: FileText 
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Enhanced Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-6">
          {steps.map((step, index) => {
            const isActive = currentStep === step.key;
            const isCompleted = (
              (step.key === 'initial' && (currentStep === 'interview' || currentStep === 'preview')) ||
              (step.key === 'interview' && currentStep === 'preview')
            );
            const IconComponent = step.icon;
            
            return (
              <React.Fragment key={step.key}>
                <div className={`flex flex-col items-center transition-all duration-300 ${isActive ? 'scale-110' : ''}`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center border-3 font-semibold text-lg transition-all duration-300 ${
                    isActive 
                      ? 'border-blue-500 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-200' 
                      : isCompleted 
                        ? 'border-green-500 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200' 
                        : 'border-gray-300 bg-white text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : isActive ? (
                      <IconComponent className="w-6 h-6" />
                    ) : (
                      <Clock className="w-6 h-6" />
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <div className={`font-semibold text-sm ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex items-center">
                    <div className={`w-20 h-1 rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gray-200'
                    }`}>
                      <div className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted ? 'w-full bg-gradient-to-r from-green-500 to-emerald-600' : 'w-0'
                      }`} />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden">
        <div className="min-h-[600px]">
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
        </div>
      </Card>
    </div>
  );
};

export default ResumeGenerator;
