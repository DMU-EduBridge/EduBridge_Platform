export interface ProgressFilters {
  classId?: string;
  startDate?: Date;
  endDate?: Date;
  subject?: string;
  difficulty?: string;
}

// 서비스 내부에서 사용하는 기본 학생 진도 타입
export interface StudentProgress {
  studentId: string;
  studentName: string;
  studentEmail: string;
  totalProblems: number;
  completedProblems: number;
  correctAnswers: number;
  totalAttempts: number;
  averageTimeSpent: number;
  lastActivity: Date;
  progressPercentage: number;
  accuracyRate: number;
  classId: string;
}

export interface ClassProgressSummary {
  classId: string;
  className: string;
  totalStudents: number;
  activeStudents: number;
  averageProgress: number;
  averageAccuracy: number;
  totalProblems: number;
  completedProblems: number;
  students: StudentProgress[];
}

export interface SubjectProgress {
  subject: string;
  totalProblems: number;
  completedProblems: number;
  correctAnswers: number;
  accuracyRate: number;
  averageTimeSpent: number;
}

export interface DifficultyProgress {
  difficulty: string;
  totalProblems: number;
  completedProblems: number;
  correctAnswers: number;
  accuracyRate: number;
  averageTimeSpent: number;
}

export interface TimeAnalysis {
  totalStudyTime: number;
  averageSessionTime: number;
  longestSession: number;
  shortestSession: number;
  studyDays: number;
  averageProblemsPerSession: number;
}

export interface RecentActivity {
  date: Date;
  problemsAttempted: number;
  problemsCompleted: number;
  correctAnswers: number;
  timeSpent: number;
}

export interface WeakArea {
  subject: string;
  difficulty: string;
  problemType: string;
  errorRate: number; // 0~1
  totalAttempts: number;
  lastAttempted: Date;
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

export interface StudentDetailedProgress extends Partial<StudentDetailProgress> {
  subjectBreakdown: SubjectProgress[];
  difficultyBreakdown: DifficultyProgress[];
  timeAnalysis: TimeAnalysis;
  recentActivity: RecentActivity[];
  weakAreas: WeakArea[];
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
