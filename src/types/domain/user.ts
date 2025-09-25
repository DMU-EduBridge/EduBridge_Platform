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
  gradeLevel?: string;
  school?: string;
  subject?: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  lastLoginAt?: Date | null;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
}

// 요청/응답 타입
export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  gradeLevel?: string;
  school?: string;
  subject?: string;
  status?: UserStatus;
}

export interface UpdateUserRequest {
  email?: string;
  name?: string;
  password?: string;
  role?: UserRole;
  avatar?: string;
  bio?: string;
  gradeLevel?: string;
  school?: string;
  subject?: string;
  status?: UserStatus;
  lastLoginAt?: Date;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  subject?: string;
  gradeLevel?: string;
}
