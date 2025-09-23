// 학생 관련 타입 정의
import { UserStatus } from './user';

export interface Student {
  id: string;
  name: string;
  email: string;
  grade: string;
  subjects: string[];
  progress: number;
  lastActivity: Date;
  totalProblems: number;
  completedProblems: number;
  averageScore: number;
  status: UserStatus;
  joinDate: Date;
}
