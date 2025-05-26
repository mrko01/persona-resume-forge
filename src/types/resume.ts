
export interface PersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string[];
  location?: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
  gpa?: string;
  honors?: string[];
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  highlights: string[];
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  style: string;
  targetRole: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  projects: Project[];
  achievements: string[];
}

export interface AIMessage {
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}
