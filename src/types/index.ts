export interface User {
  id: string;
  email: string;
  name: string;
  role: "PROFESSOR" | "STUDENT" | "ADMIN";
  avatar?: string;
  bio?: string;
  department?: string;
  researchAreas?: string[];
  studentId?: string;
  major?: string;
  year?: number;
  skills?: string[];
  portfolio?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status:
    | "DRAFT"
    | "SUBMITTED"
    | "REVIEWED"
    | "ACCEPTED"
    | "REJECTED"
    | "IN_PROGRESS"
    | "COMPLETED";
  professorId: string;
  professor: User;
  researchArea: string;
  keywords: string[];
  requirements: string[];
  duration?: number;
  maxParticipants: number;
  startDate?: Date;
  endDate?: Date;
  attachments: string[];
  githubRepo?: string;
  driveFolder?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Application {
  id: string;
  projectId: string;
  project: Project;
  studentId: string;
  student: User;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "EXPIRED";
  message?: string;
  resume?: string;
  portfolio: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MatchingResult {
  score: number;
  reasons: string[];
  compatibility: {
    researchArea: number;
    skills: number;
    availability: number;
    preferences: number;
  };
}

export interface AIAnalysis {
  summary: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}
