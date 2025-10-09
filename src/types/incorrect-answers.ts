/**
 * 오답노트 관련 타입 정의
 */

export interface ProblemAttempt {
  attemptNumber: number;
  selectedAnswer: string;
  completedAt: string;
  timeSpent: number;
}

export interface IncorrectAnswerProblem {
  id: string;
  question: string;
  myAnswer: string;
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  attempts: number;
  lastAttempt: string;
  allAttempts: ProblemAttempt[];
}

export interface IncorrectAnswerSubject {
  id: string;
  subject: string;
  grade: string;
  gradeColor: 'red' | 'yellow' | 'green';
  status: string;
  statusColor: 'red' | 'yellow' | 'green';
  incorrectCount: number;
  retryCount: number;
  completedCount: number;
  totalProblems: number;
  lastUpdated: string;
  problems: IncorrectAnswerProblem[];
}

export interface IncorrectAnswersStats {
  totalIncorrect: number;
  totalRetry: number;
  totalCompleted: number;
  averageAttempts: number;
  mostDifficultSubject: string;
}

export interface IncorrectAnswersData {
  incorrectAnswers: IncorrectAnswerSubject[];
  subjects: string[];
  stats: IncorrectAnswersStats;
}

export interface ProgressRecord {
  problemId: string;
  selectedAnswer: string | null;
  isCorrect: boolean;
  completedAt: Date | null;
  attemptNumber: number | null;
  timeSpent: number | null;
  problem: {
    id: string;
    title: string | null;
    content: string | null;
    subject: string | null;
    difficulty: string | null;
    explanation: string | null;
    correctAnswer: string | null;
    materialProblems: Array<{
      learningMaterialId: string;
    }>;
  };
}
