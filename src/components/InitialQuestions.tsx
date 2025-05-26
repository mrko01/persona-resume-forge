
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { GraduationCap, Briefcase, Sparkles } from 'lucide-react';
import { ResumeData } from '@/types/resume';

interface InitialQuestionsProps {
  onComplete: (data: Partial<ResumeData>) => void;
}

const InitialQuestions: React.FC<InitialQuestionsProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    studentType: '', // 'highschool' or 'college_professional'
    grade: '',
    school: '',
    graduationYear: '',
    age: '',
    style: '',
    targetRole: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting initial form data:', formData);
    
    const isHighSchool = formData.studentType === 'highschool';
    
    const resumeData: Partial<ResumeData> = {
      personalInfo: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        ...(isHighSchool && {
          grade: formData.grade,
          school: formData.school,
          graduationYear: formData.graduationYear
        })
      },
      style: formData.style,
      targetRole: formData.targetRole,
      isHighSchoolStudent: isHighSchool
    };

    onComplete(resumeData);
  };

  const isFormValid = formData.name && formData.email && formData.studentType && formData.style && formData.targetRole &&
    (formData.studentType === 'college_professional' ? formData.age : (formData.grade && formData.school && formData.graduationYear));

  const getTargetRolePlaceholder = () => {
    if (formData.studentType === 'highschool') {
      return "e.g., Part-time Retail, Internship, College Application";
    }
    return "e.g., Software Developer, Marketing Manager, Data Scientist";
  };

  return (
    <div className="min-h-[600px]">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Let's Create Your Perfect Resume
        </CardTitle>
        <p className="text-gray-600 text-lg">Tell us about yourself to get started</p>
      </CardHeader>
      
      <CardContent className="space-y-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information Section */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Doe"
                  className="bg-white border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@example.com"
                  className="bg-white border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                  className="bg-white border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="City, State"
                  className="bg-white border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
            </div>
          </div>

          {/* Student Type Selection */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <GraduationCap className="w-5 h-5 mr-2 text-green-600" />
              Academic Level
            </h3>
            <RadioGroup
              value={formData.studentType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, studentType: value }))}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 bg-white p-4 rounded-lg border border-gray-200 hover:border-green-300 transition-colors">
                <RadioGroupItem value="highschool" id="highschool" />
                <Label htmlFor="highschool" className="cursor-pointer flex-1">
                  <div className="font-medium text-gray-800">High School Student</div>
                  <div className="text-sm text-gray-600">Grades 9-12</div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 bg-white p-4 rounded-lg border border-gray-200 hover:border-green-300 transition-colors">
                <RadioGroupItem value="college_professional" id="college_professional" />
                <Label htmlFor="college_professional" className="cursor-pointer flex-1">
                  <div className="font-medium text-gray-800">College/Professional</div>
                  <div className="text-sm text-gray-600">College student or working professional</div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Conditional Fields Based on Student Type */}
          {formData.studentType === 'highschool' && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">High School Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="grade" className="text-sm font-medium text-gray-700">Current Grade *</Label>
                  <Select value={formData.grade} onValueChange={(value) => setFormData(prev => ({ ...prev, grade: value }))}>
                    <SelectTrigger className="bg-white border-gray-200 focus:border-purple-400">
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="9">9th Grade (Freshman)</SelectItem>
                      <SelectItem value="10">10th Grade (Sophomore)</SelectItem>
                      <SelectItem value="11">11th Grade (Junior)</SelectItem>
                      <SelectItem value="12">12th Grade (Senior)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="school" className="text-sm font-medium text-gray-700">School Name *</Label>
                  <Input
                    id="school"
                    value={formData.school}
                    onChange={(e) => setFormData(prev => ({ ...prev, school: e.target.value }))}
                    placeholder="Your High School"
                    className="bg-white border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                    required={formData.studentType === 'highschool'}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="graduationYear" className="text-sm font-medium text-gray-700">Graduation Year *</Label>
                  <Select value={formData.graduationYear} onValueChange={(value) => setFormData(prev => ({ ...prev, graduationYear: value }))}>
                    <SelectTrigger className="bg-white border-gray-200 focus:border-purple-400">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                      <SelectItem value="2027">2027</SelectItem>
                      <SelectItem value="2028">2028</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {formData.studentType === 'college_professional' && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 border border-orange-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Experience Level</h3>
              <div className="space-y-2">
                <Label htmlFor="age" className="text-sm font-medium text-gray-700">Experience Level *</Label>
                <Select value={formData.age} onValueChange={(value) => setFormData(prev => ({ ...prev, age: value }))}>
                  <SelectTrigger className="bg-white border-gray-200 focus:border-orange-400">
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="18-22">18-22 (Recent Graduate)</SelectItem>
                    <SelectItem value="23-27">23-27 (Early Career)</SelectItem>
                    <SelectItem value="28-35">28-35 (Mid-Level)</SelectItem>
                    <SelectItem value="36-45">36-45 (Senior Level)</SelectItem>
                    <SelectItem value="46+">46+ (Executive Level)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Resume Preferences */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-6 border border-indigo-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-indigo-600" />
              Resume Preferences
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="style" className="text-sm font-medium text-gray-700">Resume Style *</Label>
                <Select value={formData.style} onValueChange={(value) => setFormData(prev => ({ ...prev, style: value }))}>
                  <SelectTrigger className="bg-white border-gray-200 focus:border-indigo-400">
                    <SelectValue placeholder="Choose a style" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="modern">Modern & Creative</SelectItem>
                    <SelectItem value="professional">Professional & Conservative</SelectItem>
                    <SelectItem value="minimal">Clean & Minimal</SelectItem>
                    <SelectItem value="technical">Technical & Detailed</SelectItem>
                    <SelectItem value="student">Student-Friendly</SelectItem>
                    {formData.studentType === 'college_professional' && (
                      <SelectItem value="executive">Executive & Leadership-Focused</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetRole" className="text-sm font-medium text-gray-700">Target Role/Goal *</Label>
                <Input
                  id="targetRole"
                  value={formData.targetRole}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetRole: e.target.value }))}
                  placeholder={getTargetRolePlaceholder()}
                  className="bg-white border-gray-200 focus:border-indigo-400 focus:ring-indigo-400"
                  required
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={!isFormValid}
          >
            Start AI Interview 🚀
          </Button>
        </form>
      </CardContent>
    </div>
  );
};

export default InitialQuestions;
