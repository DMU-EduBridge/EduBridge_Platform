// Teacher Report domain types
import { ReportStatus, ReportType } from '@prisma/client';

export interface TeacherReport {
  id: string;
  title: string;
  content: string;
  reportType: ReportType;
  classId?: string | null;
  classInfo?: any;
  students?: any;
  analysisData?: any;
  metadata?: any;
  tokenUsage?: number | null;
  generationTimeMs?: number | null;
  modelName?: string | null;
  costUsd?: number | null;
  status: ReportStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  class?: {
    id: string;
    name: string;
    subject: string;
    gradeLevel: string;
  } | null;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateTeacherReportRequest {
  title: string;
  reportType: ReportType;
  classId?: string | undefined;
  studentIds?: string[] | undefined;
  analysisPeriod?:
    | {
        startDate: Date;
        endDate: Date;
      }
    | undefined;
  includeCharts?: boolean | undefined;
  includeRecommendations?: boolean | undefined;
  customPrompt?: string | undefined;
}

export interface UpdateTeacherReportRequest {
  title?: string;
  content?: string;
  status?: ReportStatus;
}

export interface ReportGenerationOptions {
  includeCharts: boolean;
  includeRecommendations: boolean;
  analysisDepth: 'BASIC' | 'DETAILED' | 'COMPREHENSIVE';
  focusAreas: string[];
  customPrompt?: string;
}

export interface ReportAnalysis {
  id: string;
  reportId: string;
  analysisType: string;
  data: any;
  insights: string[];
  recommendations: string[];
  createdAt: Date;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  reportType: string;
  template: string;
  variables: string[];
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
}

export interface ReportStats {
  totalReports: number;
  completedReports: number;
  draftReports: number;
  failedReports: number;
  averageGenerationTime: number;
  totalTokenUsage: number;
  totalCost: number;
  reportsByType: {
    type: string;
    count: number;
  }[];
  reportsByClass: {
    classId: string;
    className: string;
    count: number;
  }[];
}

export interface ReportFilters {
  classId?: string;
  reportType?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  createdBy?: string;
}
