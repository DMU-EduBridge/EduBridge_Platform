/**
 * 공통 API 응답 타입 정의
 */

import { ProblemDifficulty, ProblemStatus, ProblemType } from '..';

/**
 * 기본 API 응답 구조
 */
export interface BaseApiResponse {
  success: boolean;
  message?: string;
  timestamp?: string;
}

/**
 * 성공 응답
 */
export interface SuccessResponse<T = any> extends BaseApiResponse {
  success: true;
  data: T;
}

/**
 * 에러 응답
 */
export interface ErrorResponse extends BaseApiResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

/**
 * API 응답 유니온 타입
 */
export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

/**
 * 페이지네이션 메타데이터
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * 페이지네이션된 응답
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * 페이지네이션 쿼리 파라미터
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * 정렬 옵션
 */
export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * 검색 및 필터 옵션
 */
export interface SearchFilterOptions {
  search?: string;
  filters?: Record<string, any>;
  sort?: SortOptions;
}

/**
 * 쿼리 파라미터 (페이지네이션 + 검색/필터)
 */
export interface QueryParams extends PaginationParams, SearchFilterOptions {}

/**
 * 사용자 역할 타입
 */
export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

/**
 * 사용자 상태 타입
 */
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

// 문제 관련 타입들은 도메인 타입을 재사용
// import { ProblemType, ProblemDifficulty, ProblemStatus } from '@/types/domain/problem';

/**
 * 클래스 상태
 */
export type ClassStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

/**
 * 리포트 타입
 */
export type ReportType = 'INDIVIDUAL' | 'CLASS' | 'SUMMARY';

/**
 * 리포트 상태
 */
export type ReportStatus = 'DRAFT' | 'GENERATING' | 'COMPLETED' | 'FAILED';

/**
 * 학습 자료 상태
 */
export type LearningMaterialStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

/**
 * 과제 상태
 */
export type AssignmentStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

/**
 * 채팅 메시지 역할
 */
export type ChatRole = 'USER' | 'ASSISTANT' | 'SYSTEM';

/**
 * 공통 엔티티 인터페이스
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 사용자 기본 정보
 */
export interface BaseUser extends BaseEntity {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

/**
 * 확장된 사용자 정보 (관계 포함)
 */
export interface UserWithRelations extends BaseUser {
  classes?: BaseClass[];
  assignments?: BaseAssignment[];
  reports?: Report[];
}

/**
 * 클래스 기본 정보
 */
export interface BaseClass extends BaseEntity {
  name: string;
  description?: string;
  status: ClassStatus;
  createdBy: string;
}

/**
 * 확장된 클래스 정보
 */
export interface ClassWithRelations extends BaseClass {
  members?: ClassMember[];
  assignments?: BaseAssignment[];
  reports?: Report[];
}

/**
 * 클래스 멤버
 */
export interface ClassMember extends BaseEntity {
  classId: string;
  userId: string;
  role: 'STUDENT' | 'TEACHER';
  joinedAt: Date;
  user?: BaseUser;
  class?: BaseClass;
}

/**
 * 문제 기본 정보
 */
export interface BaseProblem extends BaseEntity {
  title: string;
  description?: string;
  type: ProblemType;
  difficulty: ProblemDifficulty;
  subject: string;
  status: ProblemStatus;
  createdBy: string;
}

/**
 * 확장된 문제 정보
 */
export interface ProblemWithRelations extends BaseProblem {
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  hints?: string[];
  tags?: string[];
  attempts?: Attempt[];
  user?: BaseUser;
}

/**
 * 시도 정보
 */
export interface Attempt extends BaseEntity {
  problemId: string;
  userId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  attemptNumber: number;
  problem?: BaseProblem;
  user?: BaseUser;
}

/**
 * 학습 자료 기본 정보
 */
export interface BaseLearningMaterial extends BaseEntity {
  title: string;
  description?: string;
  subject: string;
  status: LearningMaterialStatus;
  createdBy: string;
}

/**
 * 확장된 학습 자료 정보
 */
export interface LearningMaterialWithRelations extends BaseLearningMaterial {
  files?: any[];
  problems?: BaseProblem[];
  user?: BaseUser;
}

/**
 * 과제 기본 정보
 */
export interface BaseAssignment extends BaseEntity {
  title: string;
  description?: string;
  classId: string;
  status: AssignmentStatus;
  dueDate?: Date;
  createdBy: string;
}

/**
 * 확장된 과제 정보
 */
export interface AssignmentWithRelations extends BaseAssignment {
  problems?: BaseProblem[];
  submissions?: AssignmentSubmission[];
  class?: BaseClass;
  user?: BaseUser;
}

/**
 * 과제 제출
 */
export interface AssignmentSubmission extends BaseEntity {
  assignmentId: string;
  userId: string;
  submittedAt: Date;
  score?: number;
  feedback?: string;
  assignment?: BaseAssignment;
  user?: BaseUser;
}

/**
 * 리포트 기본 정보
 */
export interface BaseReport extends BaseEntity {
  title: string;
  type: ReportType;
  status: ReportStatus;
  studentId?: string;
  classId?: string;
  createdBy: string;
}

/**
 * 확장된 리포트 정보
 */
export interface ReportWithRelations extends BaseReport {
  content?: any;
  analysis?: any;
  student?: BaseUser;
  class?: BaseClass;
  user?: BaseUser;
}

/**
 * 채팅 세션
 */
export interface ChatSession extends BaseEntity {
  title: string;
  userId: string;
  messages?: ChatMessage[];
  user?: BaseUser;
}

/**
 * 채팅 메시지
 */
export interface ChatMessage extends BaseEntity {
  sessionId: string;
  content: string;
  role: ChatRole;
  session?: ChatSession;
}

/**
 * API 에러 코드
 * 이 enum은 API 응답에서 사용됩니다
 */
export enum ApiErrorCode {
  // 인증/인가 관련
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',

  // 검증 관련
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // 리소스 관련
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  DUPLICATE = 'DUPLICATE',

  // 비즈니스 로직 관련
  OPERATION_FAILED = 'OPERATION_FAILED',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',

  // 외부 서비스 관련
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // 시스템 관련
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
  MAINTENANCE = 'MAINTENANCE',
}

/**
 * API 성공 코드
 * 이 enum은 API 응답에서 사용됩니다
 */
export enum ApiSuccessCode {
  SUCCESS = 'SUCCESS',
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
  PROCESSING = 'PROCESSING',
}
