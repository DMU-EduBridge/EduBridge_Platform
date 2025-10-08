import type { Message } from './message';
import type { Todo } from './todo';

export interface LearningProgressItem {
  id: string;
  subject: string;
  grade: string;
  gradeColor: 'green' | 'red';
  currentUnit: string;
  progress: number;
  totalProblems: number;
  completedProblems: number;
  lastStudiedAt: string;
  // optional for backward compat
  lastUpdated?: string;
}

export interface DashboardSummary {
  totalSubjects: number;
  totalTodos: number;
  completedTodos: number;
  unreadMessages: number;
  totalIncorrectProblems: number;
  completedIncorrectProblems: number;
}

export interface DashboardOverview {
  learningProgress: LearningProgressItem[];
  todos: Todo[];
  messages: Message[];
  aiChatExamples: Array<{ id: string; question: string; createdAt: string }>;
  incorrectAnswerNotes: Array<{
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
  }>;
  summary: DashboardSummary;
}
