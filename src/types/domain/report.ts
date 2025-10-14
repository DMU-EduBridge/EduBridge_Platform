import { ReportStatus, ReportType } from '@prisma/client';
export { ReportType };

export interface Report {
  id: string;
  title: string;
  type: ReportType;
  period: string;
  content: string;
  insights: string[];
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
  status: ReportStatus;
  studentId?: string;
  teacherId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  students: number;
  totalProblems: number;
  averageScore: number;
  completionRate: number;
}

export interface TeacherReport {
  id: string;
  title: string;
  reportType: ReportType;
  analysisPeriod: {
    startDate: Date;
    endDate: Date;
  };
  status: ReportStatus;
  content?: string | null;
  insights?: string[] | null;
  recommendations?: string[] | null;
  strengths?: string[] | null;
  weaknesses?: string[] | null;
  metadata?: any;
  generationTimeMs?: number | null;
  createdBy: string;
  classId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportStats {
  totalReports: number;
  completedReports: number;
  weeklyChange: number;
  averageAnalysisTime: number;
  totalSuggestions: number;
}
