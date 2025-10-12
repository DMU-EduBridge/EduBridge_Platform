/**
 * 학습 관련 타입 정의
 */

import type { Problem } from './domain/problem';

export interface LearningMaterial {
  id: string;
  title: string;
  description?: string;
  subject:
    | 'KOREAN'
    | 'MATH'
    | 'ENGLISH'
    | 'SCIENCE'
    | 'SOCIAL_STUDIES'
    | 'HISTORY'
    | 'GEOGRAPHY'
    | 'PHYSICS'
    | 'CHEMISTRY'
    | 'BIOLOGY'
    | 'COMPUTER_SCIENCE'
    | 'ART'
    | 'MUSIC'
    | 'PHYSICAL_EDUCATION'
    | 'ETHICS'
    | 'OTHER';
}

export interface ProblemAnswer {
  isCorrect: boolean;
  selectedAnswer: string;
  correctAnswer: string;
  problemTitle: string;
  completedAt: string;
}

export interface ProgressData {
  total: number;
  completed: number;
}

export interface ProblemProgress {
  attemptId: string;
  selectedAnswer: string;
  startTime: string;
  lastAccessed: string;
}

export interface AttemptHistory {
  attemptNumber: number;
  attemptedProblems: number;
  correctAnswers: number;
  totalTimeSpent: number;
  isCompleted: boolean;
  correctnessRate: number;
}

export interface LearningStatus {
  totalProblems: number;
  completedProblems: number;
  correctAnswers: number;
  wrongAnswers: number;
  isCompleted: boolean;
  attemptNumber: number;
  attempts: Array<{
    problemId: string;
    selected: string;
    isCorrect: boolean;
    timeSpent?: number;
  }>;
}

export interface NavigationParams {
  startNewAttempt?: string | undefined;
  wrongOnly?: string | undefined;
  ids?: string | undefined;
  from?: string | undefined;
}

export interface ProblemSubmissionData {
  problemId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  attemptNumber: number;
  startTime?: string;
  timeSpent?: number;
  forceNewAttempt?: boolean;
}

export interface ProgressQueryParams {
  studyId: string;
  startNewAttempt?: boolean | number;
}

export interface ProblemNavigationProps {
  studyId: string;
  currentIndex: number;
  totalCount: number;
  nextProblem?: { id: string } | undefined;
}

export interface ProblemDetailClientProps {
  studyId: string;
  problemId: string;
  initialProblem?: Problem;
  currentIndex: number;
  totalCount: number;
  nextProblem?: { id: string } | undefined;
  isStudent?: boolean;
}

export interface ResultsClientProps {
  studyId: string;
  problems: Problem[];
  learningMaterial: LearningMaterial | null;
  userId: string;
}
