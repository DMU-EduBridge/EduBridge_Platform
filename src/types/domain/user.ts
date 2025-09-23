// 사용자 관련 타입 정의
export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  grade?: string;
  school?: string;
  subject?: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
