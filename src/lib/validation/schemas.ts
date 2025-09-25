import { z } from 'zod';

/**
 * 공통 검증 스키마들
 */

// 페이지네이션 스키마
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

// ID 스키마
export const IdSchema = z.string().uuid('유효하지 않은 ID 형식입니다.');

// 이메일 스키마
export const EmailSchema = z.string().email('유효하지 않은 이메일 형식입니다.');

// 비밀번호 스키마
export const PasswordSchema = z
  .string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
  .max(128, '비밀번호는 최대 128자까지 가능합니다.')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    '비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.',
  );

// 이름 스키마
export const NameSchema = z
  .string()
  .min(1, '이름은 필수입니다.')
  .max(50, '이름은 최대 50자까지 가능합니다.')
  .regex(/^[가-힣a-zA-Z\s]+$/, '이름은 한글, 영문, 공백만 사용 가능합니다.');

// 사용자 역할 스키마
export const UserRoleSchema = z.enum(['STUDENT', 'TEACHER', 'ADMIN'], {
  errorMap: () => ({ message: '유효하지 않은 사용자 역할입니다.' }),
});

// 사용자 상태 스키마
export const UserStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'], {
  errorMap: () => ({ message: '유효하지 않은 사용자 상태입니다.' }),
});

// 문제 난이도 스키마
export const ProblemDifficultySchema = z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT'], {
  errorMap: () => ({ message: '유효하지 않은 문제 난이도입니다.' }),
});

// 문제 유형 스키마
export const ProblemTypeSchema = z.enum(
  ['MULTIPLE_CHOICE', 'SHORT_ANSWER', 'ESSAY', 'TRUE_FALSE', 'CODING', 'MATH'],
  {
    errorMap: () => ({ message: '유효하지 않은 문제 유형입니다.' }),
  },
);

// 문제 상태 스키마
export const ProblemStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED'], {
  errorMap: () => ({ message: '유효하지 않은 문제 상태입니다.' }),
});

// 문제 리뷰 상태 스키마
export const ProblemReviewStatusSchema = z.enum(
  ['PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVISION'],
  {
    errorMap: () => ({ message: '유효하지 않은 문제 리뷰 상태입니다.' }),
  },
);

// 클래스 멤버 역할 스키마
export const ClassMemberRoleSchema = z.enum(['STUDENT', 'TEACHER', 'ASSISTANT'], {
  errorMap: () => ({ message: '유효하지 않은 클래스 멤버 역할입니다.' }),
});

// 학습 자료 유형 스키마
export const MaterialTypeSchema = z.enum(['TEXT', 'VIDEO', 'AUDIO', 'IMAGE', 'PDF'], {
  errorMap: () => ({ message: '유효하지 않은 학습 자료 유형입니다.' }),
});

// 리포트 유형 스키마
export const ReportTypeSchema = z.enum(['PROGRESS', 'PERFORMANCE', 'BEHAVIOR', 'ATTENDANCE'], {
  errorMap: () => ({ message: '유효하지 않은 리포트 유형입니다.' }),
});

// 리포트 상태 스키마
export const ReportStatusSchema = z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'], {
  errorMap: () => ({ message: '유효하지 않은 리포트 상태입니다.' }),
});

/**
 * 사용자 관련 검증 스키마
 */
export const CreateUserSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  name: NameSchema,
  role: UserRoleSchema,
  avatar: z.string().url().optional().nullable(),
  bio: z.string().max(500, '자기소개는 최대 500자까지 가능합니다.').optional().nullable(),
  gradeLevel: z.string().max(20).optional().nullable(),
  school: z.string().max(100).optional().nullable(),
  subject: z.string().max(50).optional().nullable(),
  status: UserStatusSchema.optional().default('ACTIVE'),
});

export const UpdateUserSchema = z.object({
  email: EmailSchema.optional(),
  name: NameSchema.optional(),
  password: PasswordSchema.optional(),
  role: UserRoleSchema.optional(),
  avatar: z.string().url().optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  gradeLevel: z.string().max(20).optional().nullable(),
  school: z.string().max(100).optional().nullable(),
  subject: z.string().max(50).optional().nullable(),
  status: UserStatusSchema.optional(),
});

export const UserQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().max(100).optional(),
  role: UserRoleSchema.optional(),
  status: UserStatusSchema.optional(),
  subject: z.string().max(50).optional(),
  gradeLevel: z.string().max(20).optional(),
});

/**
 * 문제 관련 검증 스키마
 */
export const CreateProblemSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다.').max(200, '제목은 최대 200자까지 가능합니다.'),
  description: z.string().max(1000).optional().nullable(),
  content: z
    .string()
    .min(1, '내용은 필수입니다.')
    .max(10000, '내용은 최대 10000자까지 가능합니다.'),
  type: ProblemTypeSchema,
  difficulty: ProblemDifficultySchema,
  subject: z.string().min(1, '과목은 필수입니다.').max(50),
  gradeLevel: z.string().min(1, '학년은 필수입니다.').max(20),
  unit: z.string().max(100).optional().nullable(),
  options: z.array(z.string().min(1).max(500)).optional(),
  correctAnswer: z.string().min(1, '정답은 필수입니다.').max(1000),
  explanation: z.string().max(5000).optional().nullable(),
  hints: z.array(z.string().min(1).max(500)).optional(),
  tags: z.array(z.string().min(1).max(30)).optional(),
  isActive: z.boolean().optional().default(true),
  isAIGenerated: z.boolean().optional().default(false),
  reviewStatus: ProblemReviewStatusSchema.optional().default('PENDING'),
});

export const UpdateProblemSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  content: z.string().min(1).max(10000).optional(),
  type: ProblemTypeSchema.optional(),
  difficulty: ProblemDifficultySchema.optional(),
  subject: z.string().min(1).max(50).optional(),
  gradeLevel: z.string().min(1).max(20).optional(),
  unit: z.string().max(100).optional().nullable(),
  options: z.array(z.string().min(1).max(500)).optional(),
  correctAnswer: z.string().min(1).max(1000).optional(),
  explanation: z.string().max(5000).optional().nullable(),
  hints: z.array(z.string().min(1).max(500)).optional(),
  tags: z.array(z.string().min(1).max(30)).optional(),
  isActive: z.boolean().optional(),
  isAIGenerated: z.boolean().optional(),
  reviewStatus: ProblemReviewStatusSchema.optional(),
});

export const ProblemQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  subject: z.string().max(50).optional(),
  gradeLevel: z.string().max(20).optional(),
  difficulty: ProblemDifficultySchema.optional(),
  type: ProblemTypeSchema.optional(),
  status: ProblemStatusSchema.optional(),
  search: z.string().max(100).optional(),
  createdBy: IdSchema.optional(),
});

/**
 * 클래스 관련 검증 스키마
 */
export const CreateClassSchema = z.object({
  name: z
    .string()
    .min(1, '클래스명은 필수입니다.')
    .max(100, '클래스명은 최대 100자까지 가능합니다.'),
  description: z.string().max(500).optional().nullable(),
  subject: z.string().min(1, '과목은 필수입니다.').max(50),
  gradeLevel: z.string().min(1, '학년은 필수입니다.').max(20),
  schoolYear: z.string().min(1, '학년도는 필수입니다.').max(10),
  semester: z.string().min(1, '학기는 필수입니다.').max(10),
  isActive: z.boolean().optional().default(true),
});

export const UpdateClassSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  subject: z.string().min(1).max(50).optional(),
  gradeLevel: z.string().min(1).max(20).optional(),
  schoolYear: z.string().min(1).max(10).optional(),
  semester: z.string().min(1).max(10).optional(),
  isActive: z.boolean().optional(),
});

export const CreateClassMemberSchema = z.object({
  classId: IdSchema,
  userId: IdSchema,
  role: ClassMemberRoleSchema.optional().default('STUDENT'),
});

export const UpdateClassMemberSchema = z.object({
  role: ClassMemberRoleSchema.optional(),
  isActive: z.boolean().optional(),
});

export const CreateProblemAssignmentSchema = z.object({
  classId: IdSchema,
  problemId: IdSchema,
  dueDate: z.date().optional().nullable(),
  instructions: z.string().max(1000).optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

export const UpdateProblemAssignmentSchema = z.object({
  dueDate: z.date().optional().nullable(),
  instructions: z.string().max(1000).optional().nullable(),
  isActive: z.boolean().optional(),
});

/**
 * 학습 자료 관련 검증 스키마
 */
export const CreateMaterialSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다.').max(200),
  content: z.string().min(1, '내용은 필수입니다.').max(50000),
  type: MaterialTypeSchema,
  difficulty: z.string().min(1).max(20),
  subject: z.string().min(1).max(50),
  gradeLevel: z.string().min(1).max(20),
  tags: z.array(z.string().min(1).max(30)).optional(),
  attachments: z.array(z.string().url()).optional(),
  status: z.string().min(1).max(20).optional().default('ACTIVE'),
});

export const UpdateMaterialSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(50000).optional(),
  type: MaterialTypeSchema.optional(),
  difficulty: z.string().min(1).max(20).optional(),
  subject: z.string().min(1).max(50).optional(),
  gradeLevel: z.string().min(1).max(20).optional(),
  tags: z.array(z.string().min(1).max(30)).optional(),
  attachments: z.array(z.string().url()).optional(),
  status: z.string().min(1).max(20).optional(),
});

/**
 * 리포트 관련 검증 스키마
 */
export const CreateReportSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다.').max(200),
  content: z.string().min(1, '내용은 필수입니다.').max(10000),
  type: ReportTypeSchema,
  targetUserId: IdSchema.optional(),
  data: z.any().optional(),
});

export const UpdateReportSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).max(10000).optional(),
  status: ReportStatusSchema.optional(),
});

/**
 * 시도 관련 검증 스키마
 */
export const CreateAttemptSchema = z.object({
  selectedAnswer: z.string().min(1, '선택한 답은 필수입니다.').max(1000),
  timeSpent: z.number().int().min(0).max(3600).optional().default(0),
  hintsUsed: z.number().int().min(0).max(10).optional().default(0),
});

/**
 * 검증 헬퍼 함수들
 */
export function validateId(id: string): string {
  return IdSchema.parse(id);
}

export function validateEmail(email: string): string {
  return EmailSchema.parse(email);
}

export function validatePassword(password: string): string {
  return PasswordSchema.parse(password);
}

export function validateName(name: string): string {
  return NameSchema.parse(name);
}

/**
 * 스키마 검증 래퍼 함수
 */
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`검증 실패: ${error.errors.map((e) => e.message).join(', ')}`);
    }
    throw error;
  }
}

/**
 * 안전한 스키마 검증 함수
 */
export function safeValidateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): {
  success: boolean;
  data?: T;
  error?: string;
} {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => e.message).join(', '),
      };
    }
    return {
      success: false,
      error: '알 수 없는 검증 오류가 발생했습니다.',
    };
  }
}
