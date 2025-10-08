export interface IncorrectProblem {
  id: string;
  question: string;
  myAnswer: string;
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  attempts: number;
  lastAttempt: string;
}

export interface IncorrectAnswerItem {
  id: string;
  subject: string;
  grade: string;
  gradeColor: 'green' | 'red';
  status: string;
  statusColor: 'red' | 'yellow' | 'green';
  incorrectCount: number;
  retryCount: number;
  completedCount: number;
  totalProblems: number;
  lastUpdated: string;
  problems: IncorrectProblem[];
}

export interface IncorrectAnswersStats {
  totalIncorrect: number;
  totalRetry: number;
  totalCompleted: number;
  averageAttempts: number;
  mostDifficultSubject: string;
}
