// 학습 자료 관련 타입 정의
import { ProblemDifficulty } from './problem';

export type MaterialStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';

export interface LearningMaterial {
  id: string;
  title: string;
  description?: string;
  content: string;
  subject: string;
  difficulty: ProblemDifficulty;
  estimatedTime?: number;
  files?: string[];
  status: MaterialStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
