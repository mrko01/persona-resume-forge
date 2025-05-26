
export interface PersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  grade?: string; // For high school students
  school?: string; // For high school students
  graduationYear?: string; // For high school students
}

export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string[];
  location?: string;
  isVolunteer?: boolean; // For high school activities
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
  gpa?: string;
  honors?: string[];
  isHighSchool?: boolean;
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
  extracurriculars?: string[]; // For high school students
  volunteerWork?: Experience[]; // For high school students
  isHighSchoolStudent?: boolean;
}

export interface AIMessage {
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}
