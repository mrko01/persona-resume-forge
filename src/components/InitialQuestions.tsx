
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ResumeData } from '@/types/resume';

interface InitialQuestionsProps {
  onComplete: (data: Partial<ResumeData>) => void;
}

const InitialQuestions: React.FC<InitialQuestionsProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    style: '',
    targetRole: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting initial form data:', formData);
    
    const resumeData: Partial<ResumeData> = {
      personalInfo: {
        name: formData.name,
        email: formData.email
      },
      style: formData.style,
      targetRole: formData.targetRole
    };

    onComplete(resumeData);
  };

  const isFormValid = formData.name && formData.email && formData.age && formData.style && formData.targetRole;

  return (
    <CardHeader className="space-y-6">
      <CardTitle className="text-2xl text-center">Let's Get Started</CardTitle>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age Range *</Label>
            <Select value={formData.age} onValueChange={(value) => setFormData(prev => ({ ...prev, age: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select your age range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="18-22">18-22 (Recent Graduate)</SelectItem>
                <SelectItem value="23-27">23-27 (Early Career)</SelectItem>
                <SelectItem value="28-35">28-35 (Mid-Level)</SelectItem>
                <SelectItem value="36-45">36-45 (Senior Level)</SelectItem>
                <SelectItem value="46+">46+ (Executive Level)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="style">Resume Style Preference *</Label>
            <Select value={formData.style} onValueChange={(value) => setFormData(prev => ({ ...prev, style: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a resume style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modern">Modern & Creative</SelectItem>
                <SelectItem value="professional">Professional & Conservative</SelectItem>
                <SelectItem value="minimal">Clean & Minimal</SelectItem>
                <SelectItem value="technical">Technical & Detailed</SelectItem>
                <SelectItem value="executive">Executive & Leadership-Focused</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetRole">Target Role/Industry *</Label>
            <Input
              id="targetRole"
              value={formData.targetRole}
              onChange={(e) => setFormData(prev => ({ ...prev, targetRole: e.target.value }))}
              placeholder="e.g., Software Developer, Marketing Manager, Data Scientist"
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled={!isFormValid}
          >
            Start AI Interview
          </Button>
        </form>
      </CardContent>
    </CardHeader>
  );
};

export default InitialQuestions;
