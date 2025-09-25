import { z } from 'zod';

// ===== ENUM 타입들 =====
export const USER_ROLES = ['STUDENT', 'TEACHER', 'ADMIN'] as const;
export const USER_STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'] as const;
export const PROBLEM_DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD', 'EXPERT'] as const;
export const PROBLEM_TYPES = [
  'MULTIPLE_CHOICE',
  'SHORT_ANSWER',
  'ESSAY',
  'TRUE_FALSE',
  'CODING',
  'MATH',
] as const;
export const REVIEW_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVISION'] as const;
export const PROGRESS_STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED'] as const;
export const CLASS_MEMBER_ROLES = ['STUDENT', 'TEACHER', 'ASSISTANT'] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type UserStatus = (typeof USER_STATUSES)[number];
export type ProblemDifficulty = (typeof PROBLEM_DIFFICULTIES)[number];
export type ProblemType = (typeof PROBLEM_TYPES)[number];
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];
export type ProgressStatus = (typeof PROGRESS_STATUSES)[number];
export type ClassMemberRole = (typeof CLASS_MEMBER_ROLES)[number];

// ===== Zod 스키마들 =====
export const UserRoleSchema = z.enum(USER_ROLES);
export const UserStatusSchema = z.enum(USER_STATUSES);
export const ProblemDifficultySchema = z.enum(PROBLEM_DIFFICULTIES);
export const ProblemTypeSchema = z.enum(PROBLEM_TYPES);
export const ReviewStatusSchema = z.enum(REVIEW_STATUSES);
export const ProgressStatusSchema = z.enum(PROGRESS_STATUSES);
export const ClassMemberRoleSchema = z.enum(CLASS_MEMBER_ROLES);

// ===== 기본 타입들 =====
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SoftDeleteEntity extends BaseEntity {
  deletedAt?: Date | null;
}

// ===== User 관련 타입들 =====
export interface User extends SoftDeleteEntity {
  email: string;
  password?: string | null;
  name: string;
  role: UserRole;
  avatar?: string | null;
  bio?: string | null;
  gradeLevel?: string | null;
  status: UserStatus;
  school?: string | null;
  subject?: string | null;
  lastLoginAt?: Date | null;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
}

export interface CreateUserRequest {
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  gradeLevel?: string;
  school?: string;
  subject?: string;
}

export interface UpdateUserRequest {
  name?: string;
  avatar?: string;
  bio?: string;
  gradeLevel?: string;
  school?: string;
  subject?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}

// ===== Class 관련 타입들 =====
export interface Class extends SoftDeleteEntity {
  name: string;
  description?: string | null;
  subject: string;
  gradeLevel: string;
  schoolYear: string;
  semester: string;
  isActive: boolean;
  createdBy: string;
}

export interface CreateClassRequest {
  name: string;
  description?: string;
  subject: string;
  gradeLevel: string;
  schoolYear: string;
  semester: string;
  isActive?: boolean;
}

export interface UpdateClassRequest {
  name?: string;
  description?: string;
  subject?: string;
  gradeLevel?: string;
  schoolYear?: string;
  semester?: string;
  isActive?: boolean;
}

export interface ClassWithDetails extends Class {
  creator: User;
  members: ClassMember[];
  assignments: ProblemAssignment[];
  memberCount: number;
  assignmentCount: number;
}

// ===== ClassMember 관련 타입들 =====
export interface ClassMember {
  id: string;
  classId: string;
  userId: string;
  role: ClassMemberRole;
  joinedAt: Date;
  leftAt?: Date | null;
  isActive: boolean;
}

export interface CreateClassMemberRequest {
  classId: string;
  userId: string;
  role?: ClassMemberRole;
}

export interface UpdateClassMemberRequest {
  role?: ClassMemberRole;
  isActive?: boolean;
}

export interface ClassMemberWithDetails extends ClassMember {
  user: User;
  class: Class;
}

// ===== ProblemAssignment 관련 타입들 =====
export interface ProblemAssignment {
  id: string;
  classId: string;
  problemId: string;
  assignedBy: string;
  assignedAt: Date;
  dueDate?: Date | null;
  isActive: boolean;
  instructions?: string | null;
}

export interface CreateProblemAssignmentRequest {
  classId: string;
  problemId: string;
  dueDate?: Date;
  instructions?: string;
  isActive?: boolean;
}

export interface UpdateProblemAssignmentRequest {
  dueDate?: Date;
  instructions?: string;
  isActive?: boolean;
}

export interface ProblemAssignmentWithDetails extends ProblemAssignment {
  class: Class;
  problem: Problem;
  assigner: User;
}

// ===== Attempt 관련 타입들 (업데이트) =====
export interface Attempt extends BaseEntity {
  userId: string;
  problemId: string;
  classId?: string | null;
  selected: string;
  isCorrect: boolean;
  startedAt: Date;
  completedAt?: Date | null;
  timeSpent?: number | null;
  hintsUsed: number;
  attemptsCount: number;
}

export interface CreateAttemptRequest {
  problemId: string;
  classId?: string;
  selected: string;
  isCorrect: boolean;
  startedAt?: Date;
  completedAt?: Date;
  timeSpent?: number;
  hintsUsed?: number;
  attemptsCount?: number;
}

export interface UpdateAttemptRequest {
  selected?: string;
  isCorrect?: boolean;
  completedAt?: Date;
  timeSpent?: number;
  hintsUsed?: number;
  attemptsCount?: number;
}

export interface AttemptWithDetails extends Attempt {
  user: User;
  problem: Problem;
  class?: Class | null;
}

// ===== Problem 관련 타입들 (기존 유지) =====
export interface Problem extends SoftDeleteEntity {
  title: string;
  description?: string | null;
  content: string;
  type: ProblemType;
  difficulty: ProblemDifficulty;
  subject: string;
  gradeLevel?: string | null;
  unit?: string | null;
  options?: any;
  correctAnswer: string;
  explanation?: string | null;
  hints?: any;
  tags?: any;
  points: number;
  timeLimit?: number | null;
  isActive: boolean;
  isAIGenerated: boolean;
  aiGenerationId?: string | null;
  qualityScore?: number | null;
  reviewStatus: ReviewStatus;
  reviewedBy?: string | null;
  reviewedAt?: Date | null;
  generationPrompt?: string | null;
  contextChunkIds?: string | null;
  generationTimeMs?: number | null;
  modelName?: string | null;
  tokensUsed?: number | null;
  costUsd?: number | null;
  textbookId?: string | null;
  createdBy?: string | null;
}

// ===== 설정 및 유틸리티 타입들 =====
export interface ClassMemberRoleConfig {
  label: string;
  color: string;
  description: string;
}

export interface ClassStatusConfig {
  label: string;
  color: string;
  description: string;
}

// ===== 타입 가드 함수들 =====
export const isValidUserRole = (role: string): role is UserRole => {
  return USER_ROLES.includes(role as UserRole);
};

export const isValidUserStatus = (status: string): status is UserStatus => {
  return USER_STATUSES.includes(status as UserStatus);
};

export const isValidProblemDifficulty = (difficulty: string): difficulty is ProblemDifficulty => {
  return PROBLEM_DIFFICULTIES.includes(difficulty as ProblemDifficulty);
};

export const isValidProblemType = (type: string): type is ProblemType => {
  return PROBLEM_TYPES.includes(type as ProblemType);
};

export const isValidReviewStatus = (status: string): status is ReviewStatus => {
  return REVIEW_STATUSES.includes(status as ReviewStatus);
};

export const isValidProgressStatus = (status: string): status is ProgressStatus => {
  return PROGRESS_STATUSES.includes(status as ProgressStatus);
};

export const isValidClassMemberRole = (role: string): role is ClassMemberRole => {
  return CLASS_MEMBER_ROLES.includes(role as ClassMemberRole);
};

// ===== 설정 객체들 =====
export const CLASS_MEMBER_ROLE_CONFIG: Record<ClassMemberRole, ClassMemberRoleConfig> = {
  STUDENT: {
    label: '학생',
    color: 'bg-blue-100 text-blue-800',
    description: '클래스에 참여하는 학생',
  },
  TEACHER: {
    label: '선생님',
    color: 'bg-green-100 text-green-800',
    description: '클래스를 담당하는 선생님',
  },
  ASSISTANT: {
    label: '조교',
    color: 'bg-purple-100 text-purple-800',
    description: '선생님을 보조하는 조교',
  },
};

export const CLASS_STATUS_CONFIG: Record<string, ClassStatusConfig> = {
  ACTIVE: {
    label: '활성',
    color: 'bg-green-100 text-green-800',
    description: '활성화된 클래스',
  },
  INACTIVE: {
    label: '비활성',
    color: 'bg-gray-100 text-gray-800',
    description: '비활성화된 클래스',
  },
};

// ===== 유틸리티 함수들 =====
export const getClassMemberRoleConfig = (role: ClassMemberRole): ClassMemberRoleConfig => {
  return CLASS_MEMBER_ROLE_CONFIG[role];
};

export const getClassStatusConfig = (isActive: boolean): ClassStatusConfig => {
  return CLASS_STATUS_CONFIG[isActive ? 'ACTIVE' : 'INACTIVE']!;
};

export const sortByClassMemberRole = (a: ClassMemberRole, b: ClassMemberRole): number => {
  const order = { TEACHER: 0, ASSISTANT: 1, STUDENT: 2 };
  return order[a] - order[b];
};

// ===== API 응답 타입들 =====
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===== 쿼리 파라미터 타입들 =====
export interface ClassQueryParams {
  page?: number | undefined;
  limit?: number | undefined;
  subject?: string | undefined;
  gradeLevel?: string | undefined;
  schoolYear?: string | undefined;
  semester?: string | undefined;
  isActive?: boolean | undefined;
  createdBy?: string | undefined;
}

export interface ClassMemberQueryParams {
  page?: number | undefined;
  limit?: number | undefined;
  classId?: string | undefined;
  userId?: string | undefined;
  role?: ClassMemberRole | undefined;
  isActive?: boolean | undefined;
}

export interface ProblemAssignmentQueryParams {
  page?: number | undefined;
  limit?: number | undefined;
  classId?: string | undefined;
  problemId?: string | undefined;
  assignedBy?: string | undefined;
  isActive?: boolean | undefined;
  dueDate?: Date | undefined;
}

export interface AttemptQueryParams {
  page?: number | undefined;
  limit?: number | undefined;
  userId?: string | undefined;
  problemId?: string | undefined;
  classId?: string | undefined;
  isCorrect?: boolean | undefined;
  startedAt?: Date | undefined;
  completedAt?: Date | undefined;
}
