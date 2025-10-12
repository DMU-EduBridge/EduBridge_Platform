import { GradeLevel, UserStatus } from '@prisma/client';

export interface Student {
  id: string;
  name: string;
  email: string;
  gradeLevel: GradeLevel;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  bio?: string | null;
  avatar?: string | null;
  // 학습 관련 필드들
  lastActivity?: Date;
  progress?: number;
  totalProblems?: number;
  completedProblems?: number;
  averageScore?: number;
  subjects?: string[];
}

export interface StudentStats {
  totalStudents: number;
  activeStudents: number;
  weeklyChange: number;
  averageProgress: number;
  averageScore: number;
  activeStudentsRate?: number;
}

export interface StudentProgress {
  studentId: string;
  studentName: string;
  totalProblems: number;
  completedProblems: number;
  correctAnswers: number;
  averageScore: number;
  progressPercentage: number;
  lastActivity: Date;
  subjects: Array<{
    subject: string;
    progress: number;
    averageScore: number;
  }>;
}
