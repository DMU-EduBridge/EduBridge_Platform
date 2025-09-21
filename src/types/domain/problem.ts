// 문제 관련 타입 정의
export type ProblemDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
export type ProblemType = 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | 'ESSAY' | 'CODING' | 'MATH';
export type ProblemStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';

export interface Problem {
  id: string;
  title: string;
  description?: string;
  content: string;
  type: ProblemType;
  difficulty: ProblemDifficulty;
  subject: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  hints?: string[];
  tags?: string[];
  points: number;
  timeLimit?: number;
  isActive: boolean;
  isAIGenerated: boolean;
  aiGenerationId?: string;
  qualityScore?: number;
  reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  // 추가 속성들
  status: ProblemStatus;
  questions?: number;
  attempts?: number;
  successRate?: number;
}
