
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import InitialQuestions from '@/components/InitialQuestions';
import AIInterviewer from '@/components/AIInterviewer';
import ResumePreview from '@/components/ResumePreview';
import { ResumeData } from '@/types/resume';
import { CheckCircle, Clock, User, Bot, FileText, Sparkles } from 'lucide-react';

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
        <div className="flex items-center justify-center space-x-8">
          {steps.map((step, index) => {
            const isActive = currentStep === step.key;
            const isCompleted = (
              (step.key === 'initial' && (currentStep === 'interview' || currentStep === 'preview')) ||
              (step.key === 'interview' && currentStep === 'preview')
            );
            const IconComponent = step.icon;
            
            return (
              <React.Fragment key={step.key}>
                <div className={`flex flex-col items-center transition-all duration-500 ${isActive ? 'scale-110' : ''}`}>
                  <div className={`w-18 h-18 rounded-full flex items-center justify-center border-4 font-semibold text-lg transition-all duration-500 shadow-lg ${
                    isActive 
                      ? 'border-blue-500 bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-blue-200/50 shadow-xl' 
                      : isCompleted 
                        ? 'border-green-500 bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-green-200/50 shadow-xl' 
                        : 'border-gray-300 bg-white text-gray-400 shadow-gray-200/30'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-7 h-7" />
                    ) : isActive ? (
                      <IconComponent className="w-7 h-7" />
                    ) : (
                      <Clock className="w-7 h-7" />
                    )}
                  </div>
                  <div className="mt-4 text-center">
                    <div className={`font-bold text-base ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                      {step.title}
                    </div>
                    <div className="text-sm text-gray-500 mt-1 font-medium">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex items-center">
                    <div className={`w-24 h-2 rounded-full transition-all duration-700 ${
                      isCompleted ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-md' : 'bg-gray-200'
                    }`}>
                      <div className={`h-full rounded-full transition-all duration-700 ${
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

      <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden">
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
