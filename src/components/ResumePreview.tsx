
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Download, RotateCcw, Mail, Phone, MapPin, Linkedin, Github, Globe } from 'lucide-react';
import { ResumeData } from '@/types/resume';

interface ResumePreviewProps {
  resumeData: ResumeData;
  onStartOver: () => void;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ resumeData, onStartOver }) => {
  const downloadResume = () => {
    // Create a printable version
    window.print();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">Your Professional Resume</CardTitle>
          <div className="flex space-x-2">
            <Button onClick={downloadResume} className="bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={onStartOver} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Start Over
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="bg-white border rounded-lg p-8 shadow-sm print:shadow-none print:border-none max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {resumeData.personalInfo.name || 'Your Name'}
            </h1>
            <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-600">
              {resumeData.personalInfo.email && (
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  {resumeData.personalInfo.email}
                </div>
              )}
              {resumeData.personalInfo.phone && (
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  {resumeData.personalInfo.phone}
                </div>
              )}
              {resumeData.personalInfo.location && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {resumeData.personalInfo.location}
                </div>
              )}
              {resumeData.personalInfo.linkedin && (
                <div className="flex items-center">
                  <Linkedin className="w-4 h-4 mr-1" />
                  LinkedIn
                </div>
              )}
              {resumeData.personalInfo.github && (
                <div className="flex items-center">
                  <Github className="w-4 h-4 mr-1" />
                  GitHub
                </div>
              )}
              {resumeData.personalInfo.website && (
                <div className="flex items-center">
                  <Globe className="w-4 h-4 mr-1" />
                  Portfolio
                </div>
              )}
            </div>
          </div>

          {/* Professional Summary */}
          {resumeData.targetRole && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Professional Summary
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Dedicated professional seeking opportunities in {resumeData.targetRole} with a focus on delivering exceptional results and continuous growth.
              </p>
            </div>
          )}

          {/* Experience */}
          {resumeData.experience.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Professional Experience
              </h2>
              <div className="space-y-4">
                {resumeData.experience.map((exp, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                        <p className="text-gray-700">{exp.company}</p>
                        {exp.location && <p className="text-sm text-gray-600">{exp.location}</p>}
                      </div>
                      <div className="text-sm text-gray-600 text-right">
                        {formatDate(exp.startDate)} - {exp.endDate.toLowerCase() === 'present' ? 'Present' : formatDate(exp.endDate)}
                      </div>
                    </div>
                    {exp.description.length > 0 && (
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-4">
                        {exp.description.map((desc, idx) => (
                          <li key={idx}>{desc}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {resumeData.education.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Education
              </h2>
              <div className="space-y-3">
                {resumeData.education.map((edu, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{edu.degree} in {edu.field}</h3>
                      <p className="text-gray-700">{edu.institution}</p>
                      {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                      {edu.honors && edu.honors.length > 0 && (
                        <p className="text-sm text-gray-600">Honors: {edu.honors.join(', ')}</p>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDate(edu.graduationDate)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {resumeData.skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Technical Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map((skill, index) => (
                  <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {resumeData.projects.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Projects
              </h2>
              <div className="space-y-4">
                {resumeData.projects.map((project, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      {project.link && (
                        <a href={project.link} className="text-blue-600 text-sm hover:underline">
                          View Project
                        </a>
                      )}
                    </div>
                    <p className="text-gray-700 text-sm mb-2">{project.description}</p>
                    {project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {project.technologies.map((tech, idx) => (
                          <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                    {project.highlights.length > 0 && (
                      <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 ml-4">
                        {project.highlights.map((highlight, idx) => (
                          <li key={idx}>{highlight}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Achievements */}
          {resumeData.achievements.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Key Achievements
              </h2>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {resumeData.achievements.map((achievement, index) => (
                  <li key={index}>{achievement}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </div>
  );
};

export default ResumePreview;
