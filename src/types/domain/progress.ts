export interface ProgressFilters {
  classId?: string;
  startDate?: Date;
  endDate?: Date;
  subject?: string;
  difficulty?: string;
}

export interface StudentDetailProgress {
  studentId: string;
  studentName: string;
  classId?: string;
  className?: string;
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
    totalProblems: number;
    completedProblems: number;
  }>;
  recentAttempts: Array<{
    id: string;
    problemId: string;
    problemTitle: string;
    isCorrect: boolean;
    score: number;
    completedAt: Date;
  }>;
  performanceTrend: Array<{
    date: string;
    score: number;
    problemsCompleted: number;
  }>;
}

export interface ClassProgress {
  classId: string;
  className: string;
  totalStudents: number;
  averageProgress: number;
  averageScore: number;
  students: Array<{
    studentId: string;
    studentName: string;
    progress: number;
    averageScore: number;
    lastActivity: Date;
  }>;
  subjectProgress: Array<{
    subject: string;
    averageProgress: number;
    averageScore: number;
    totalProblems: number;
    completedProblems: number;
  }>;
}
