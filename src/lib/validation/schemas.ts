import { z } from 'zod';

// Problem schemas
export const ProblemQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  subject: z.string().optional(),
  gradeLevel: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']).optional(),
  type: z
    .enum(['MULTIPLE_CHOICE', 'SHORT_ANSWER', 'ESSAY', 'TRUE_FALSE', 'CODING', 'MATH'])
    .optional(),
  status: z.enum(['DRAFT', 'PENDING', 'PUBLISHED', 'ARCHIVED']).optional(),
  search: z.string().optional(),
  createdBy: z.string().optional(),
});

export const CreateProblemSchema = z.object({
  title: z.string(),
  description: z.string().nullable().optional(),
  content: z.string(),
  type: z.enum(['MULTIPLE_CHOICE', 'SHORT_ANSWER', 'ESSAY', 'TRUE_FALSE', 'CODING', 'MATH']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']),
  subject: z.string(),
  gradeLevel: z.string().nullable().optional(),
  options: z.any().nullable().optional(),
  correctAnswer: z.string(),
  explanation: z.string().nullable().optional(),
  hints: z.any().nullable().optional(),
  tags: z.any().nullable().optional(),
  points: z.number().min(1).default(1),
  timeLimit: z.number().min(1).nullable().optional(),
});

// Todo schemas
export const TodoUpdateSchema = z.object({
  id: z.string(),
  completed: z.boolean().optional(),
  text: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
});

export const TodoCreateSchema = z.object({
  text: z.string().min(1, '할 일 내용을 입력해주세요'),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  category: z.string().optional(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
});

// Incorrect Answer schemas
// Note: ProblemProgress 모델에는 isRetried, isCompleted 필드가 없으므로
// 현재는 problemId만 사용하여 업데이트 시간을 갱신합니다.
export const IncorrectAnswerUpdateSchema = z.object({
  id: z.string(),
  problemId: z.string(),
  // isRetried: z.boolean().optional(), // Prisma 모델에 없음
  // isCompleted: z.boolean().optional(), // Prisma 모델에 없음
});

// Progress schemas
export const ProgressPostSchema = z.object({
  studyId: z.string(),
  problemId: z.string(),
  selectedAnswer: z.string(),
  isCorrect: z.boolean(),
  attemptNumber: z.coerce.number().min(1),
  startTime: z.string().optional(),
  timeSpent: z.number().min(0).optional(),
  forceNewAttempt: z.boolean().optional(),
});

// Message schemas
export const MessageCreateSchema = z.object({
  recipientId: z.string(),
  message: z.string().min(1, '메시지 내용을 입력해주세요'),
  messageType: z.enum(['question', 'announcement', 'reminder', 'general']).default('general'),
});

export const MessageUpdateSchema = z.object({
  id: z.string(),
  isRead: z.boolean(),
});

// AI Assistant schemas
export const ChatRequestSchema = z.object({
  question: z.string().min(1, '질문을 입력해주세요'),
  messageType: z.enum(['question', 'translation', 'explanation', 'general']).default('question'),
  subject: z.string().optional(),
});

// Problem Update schemas
export const UpdateProblemSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  subject: z.string().min(1),
  type: z.enum(['MULTIPLE_CHOICE', 'SHORT_ANSWER', 'ESSAY', 'TRUE_FALSE']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1),
  hints: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

// Problem Generation schemas
export const ProblemGenerationSchema = z.object({
  subject: z.string().min(1),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']),
  count: z.number().min(1).max(10),
  gradeLevel: z.string().optional(),
  unit: z.string().optional(),
  context: z.string().optional(),
});

// Problem Batch schemas
export const ProblemBatchSchema = z.array(
  z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    content: z.string().min(1),
    type: z.enum(['MULTIPLE_CHOICE', 'SHORT_ANSWER', 'ESSAY', 'TRUE_FALSE', 'CODING', 'MATH']),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']),
    subject: z.string().min(1),
    gradeLevel: z.string().optional(),
    unit: z.string().optional(),
    options: z.array(z.string()).optional(),
    correctAnswer: z.string().min(1),
    explanation: z.string().optional(),
    hints: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    points: z.number().min(1).default(1),
    timeLimit: z.number().min(1).optional(),
    isActive: z.boolean().default(true),
    isAIGenerated: z.boolean().default(false),
    aiGenerationId: z.string().optional(),
    qualityScore: z.number().optional(),
    reviewStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVISION']).default('PENDING'),
    reviewedBy: z.string().optional(),
    reviewedAt: z.string().optional(),
    status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']).default('ACTIVE'),
  }),
);

// Learning Materials schemas
export const LearningMaterialsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  subject: z.string().nullable().optional(),
  difficulty: z.string().nullable().optional(), // Prisma에서는 String 타입
  search: z.string().nullable().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  isActive: z.boolean().optional(),
});

export const CreateLearningMaterialSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  content: z.string().min(1),
  subject: z.string().min(1),
  difficulty: z.string(), // Prisma에서는 String 타입
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  estimatedTime: z.number().min(1).nullable().optional(),
  files: z.string().nullable().optional(),
});

export const UpdateLearningMaterialSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  content: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  difficulty: z.string().optional(), // Prisma에서는 String 타입
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  estimatedTime: z.number().min(1).nullable().optional(),
  files: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});
