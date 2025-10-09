// 문제 관련 타입 정의
export type ProblemDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
export type ProblemType =
  | 'MULTIPLE_CHOICE'
  | 'SHORT_ANSWER'
  | 'ESSAY'
  | 'TRUE_FALSE'
  | 'CODING'
  | 'MATH';
export type ProblemStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';

// 기본 문제 인터페이스 (학습용)
export interface Problem {
  id: string;
  title: string;
  description?: string | null;
  content: string;
  type: ProblemType;
  difficulty: ProblemDifficulty;
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
  options: string[];
  correctAnswer: string;
  explanation?: string | null;
  hints?: any;
  points: number;
  timeLimit?: number | null;
  // 확장 필드들 (관리용)
  gradeLevel?:
    | 'GRADE_1'
    | 'GRADE_2'
    | 'GRADE_3'
    | 'GRADE_4'
    | 'GRADE_5'
    | 'GRADE_6'
    | 'GRADE_7'
    | 'GRADE_8'
    | 'GRADE_9'
    | 'GRADE_10'
    | 'GRADE_11'
    | 'GRADE_12'
    | null;
  unit?: string | null;
  tags?: string[] | null;
  attachments?: string[] | null;
  isAIGenerated?: boolean;
  reviewStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';
  status?: ProblemStatus;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
  createdBy?: string;
}

// 요청/응답 타입
export interface CreateProblemRequest {
  title: string;
  description?: string;
  content: string;
  type: ProblemType;
  difficulty: ProblemDifficulty;
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
  gradeLevel?: string;
  unit?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  hint?: string;
  tags?: string[];
  attachments?: string[];
  isAIGenerated?: boolean;
  reviewStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';
  status?: ProblemStatus;
}

export interface UpdateProblemRequest {
  title?: string;
  description?: string;
  content?: string;
  type?: ProblemType;
  difficulty?: ProblemDifficulty;
  subject?: string;
  gradeLevel?: string;
  unit?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  hint?: string;
  hints?: string[];
  tags?: string[];
  attachments?: string[];
  isAIGenerated?: boolean;
  reviewStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';
  status?: ProblemStatus;
  isActive?: boolean;
}

export interface ProblemQueryParams {
  page?: number;
  limit?: number;
  search?: string | undefined;
  difficulty?: ProblemDifficulty;
  type?: ProblemType;
  status?: ProblemStatus;
  subject?: string | undefined;
  gradeLevel?: string | undefined;
  createdBy?: string | undefined;
}

// LLM 생성 문제를 위한 확장된 타입
export type LLMProblemDifficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type LLMProblemSubject =
  | 'MATH'
  | 'SCIENCE'
  | 'KOREAN'
  | 'ENGLISH'
  | 'SOCIAL_STUDIES'
  | 'HISTORY'
  | 'GEOGRAPHY'
  | 'PHYSICS'
  | 'CHEMISTRY'
  | 'BIOLOGY'
  | 'EARTH_SCIENCE';

// LLM 생성 문제 인터페이스
export interface LLMGeneratedProblem {
  question: string;
  options: string[];
  correct_answer: number; // 0-based index
  explanation: string;
  hint: string;
  difficulty: LLMProblemDifficulty;
  subject: LLMProblemSubject;
  unit: string;
  generated_at: string;
  id: string;
}

// LLM 문제 생성 요청 타입
export interface LLMProblemGenerationRequest {
  subject: LLMProblemSubject;
  unit?: string;
  difficulty: LLMProblemDifficulty;
  count: number;
  question_type?: 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | 'ESSAY';
}

// LLM 문제 생성 응답 타입
export interface LLMProblemGenerationResponse {
  generated_at: string;
  total_questions: number;
  questions: LLMGeneratedProblem[];
}

// 타입 안전한 상수들
export const PROBLEM_DIFFICULTY_CONFIG = {
  EASY: { color: 'bg-green-100 text-green-800', label: '쉬움' },
  MEDIUM: { color: 'bg-yellow-100 text-yellow-800', label: '보통' },
  HARD: { color: 'bg-red-100 text-red-800', label: '어려움' },
  EXPERT: { color: 'bg-purple-100 text-purple-800', label: '전문가' },
} as const;

export const LLM_DIFFICULTY_CONFIG = {
  easy: { color: 'bg-green-100 text-green-800', label: '쉬움' },
  medium: { color: 'bg-yellow-100 text-yellow-800', label: '보통' },
  hard: { color: 'bg-red-100 text-red-800', label: '어려움' },
  expert: { color: 'bg-purple-100 text-purple-800', label: '전문가' },
} as const;

export const PROBLEM_TYPE_CONFIG = {
  MULTIPLE_CHOICE: { label: '객관식' },
  SHORT_ANSWER: { label: '단답형' },
  ESSAY: { label: '서술형' },
  TRUE_FALSE: { label: '참/거짓' },
  CODING: { label: '코딩' },
  MATH: { label: '수학' },
} as const;

export const PROBLEM_STATUS_CONFIG = {
  ACTIVE: { color: 'bg-blue-100 text-blue-800', label: '활성' },
  DRAFT: { color: 'bg-gray-100 text-gray-800', label: '초안' },
  ARCHIVED: { color: 'bg-red-100 text-red-800', label: '보관' },
} as const;

export const SUBJECT_CONFIG = {
  수학: { color: 'bg-blue-100 text-blue-800', label: '수학' },
  과학: { color: 'bg-green-100 text-green-800', label: '과학' },
  국어: { color: 'bg-red-100 text-red-800', label: '국어' },
  영어: { color: 'bg-purple-100 text-purple-800', label: '영어' },
  사회: { color: 'bg-orange-100 text-orange-800', label: '사회' },
  역사: { color: 'bg-yellow-100 text-yellow-800', label: '역사' },
  지리: { color: 'bg-teal-100 text-teal-800', label: '지리' },
  물리: { color: 'bg-indigo-100 text-indigo-800', label: '물리' },
  화학: { color: 'bg-pink-100 text-pink-800', label: '화학' },
  생물: { color: 'bg-emerald-100 text-emerald-800', label: '생물' },
  지구과학: { color: 'bg-cyan-100 text-cyan-800', label: '지구과학' },
} as const;

// 유틸리티 함수들
export function getProblemDifficultyConfig(difficulty?: string) {
  return (
    PROBLEM_DIFFICULTY_CONFIG[difficulty as keyof typeof PROBLEM_DIFFICULTY_CONFIG] || {
      color: 'bg-gray-100 text-gray-800',
      label: difficulty || '',
    }
  );
}

export function getLLMDifficultyConfig(difficulty?: string) {
  return (
    LLM_DIFFICULTY_CONFIG[difficulty as keyof typeof LLM_DIFFICULTY_CONFIG] || {
      color: 'bg-gray-100 text-gray-800',
      label: difficulty || '',
    }
  );
}

export function getProblemTypeConfig(type?: string) {
  return (
    PROBLEM_TYPE_CONFIG[type as keyof typeof PROBLEM_TYPE_CONFIG] || {
      label: type || '',
    }
  );
}

export function getProblemStatusConfig(status?: string) {
  return (
    PROBLEM_STATUS_CONFIG[status as keyof typeof PROBLEM_STATUS_CONFIG] || {
      color: 'bg-gray-100 text-gray-800',
      label: status || '',
    }
  );
}

export function getSubjectConfig(subject?: string) {
  return (
    SUBJECT_CONFIG[subject as keyof typeof SUBJECT_CONFIG] || {
      color: 'bg-gray-100 text-gray-800',
      label: subject || '',
    }
  );
}

// LLM 문제를 내부 문제 형식으로 변환하는 함수
export function convertLLMProblemToInternal(llmProblem: LLMGeneratedProblem): Partial<Problem> {
  return {
    title: llmProblem.question,
    content: llmProblem.question,
    type: 'MULTIPLE_CHOICE',
    difficulty: llmProblem.difficulty.toUpperCase() as ProblemDifficulty,
    subject: llmProblem.subject as
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
      | 'OTHER',
    options: llmProblem.options,
    correctAnswer: llmProblem.options[llmProblem.correct_answer] || '',
    explanation: llmProblem.explanation,
    hints: llmProblem.hint,
    isAIGenerated: true,
    reviewStatus: 'PENDING',
    status: 'DRAFT',
  };
}
