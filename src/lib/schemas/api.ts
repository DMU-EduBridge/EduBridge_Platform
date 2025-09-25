import { z } from 'zod';

// 공통 응답 스키마
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  timestamp: z.string(),
});

// 페이지네이션 스키마
export const PaginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

// 사용자 관련 스키마
export const UserResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.enum(['STUDENT', 'TEACHER', 'ADMIN']),
  avatar: z.string().nullable(),
  bio: z.string().nullable(),
  gradeLevel: z.string().nullable(),
  school: z.string().nullable(),
  subject: z.string().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UserListResponseSchema = z.object({
  users: z.array(UserResponseSchema),
  pagination: PaginationSchema,
});

export const UpdateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  avatar: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  gradeLevel: z.string().nullable().optional(),
  school: z.string().nullable().optional(),
  subject: z.string().nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED']).optional(),
});

export const UserRoleSetupSchema = z.object({
  role: z.enum(['STUDENT', 'TEACHER', 'ADMIN']),
});

// 문제 관련 스키마
export const ProblemResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  type: z.enum(['MULTIPLE_CHOICE', 'SHORT_ANSWER', 'ESSAY', 'CODING']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']),
  subject: z.string(),
  gradeLevel: z.string(),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string(),
  explanation: z.string().optional(),
  hints: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ProblemListResponseSchema = z.object({
  problems: z.array(ProblemResponseSchema),
  pagination: PaginationSchema,
});

export const ProblemDetailResponseSchema = ProblemResponseSchema.extend({
  creator: UserResponseSchema.optional(),
  attempts: z
    .array(
      z.object({
        id: z.string(),
        userId: z.string(),
        isCorrect: z.boolean(),
        timeSpent: z.number().nullable(),
        hintsUsed: z.number(),
        attemptsCount: z.number(),
        createdAt: z.date(),
      }),
    )
    .optional(),
});

// 학습 자료 관련 스키마
export const MaterialResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  type: z.enum(['TEXT', 'VIDEO', 'AUDIO', 'IMAGE', 'PDF']),
  difficulty: z.string(),
  subject: z.string(),
  gradeLevel: z.string(),
  tags: z.array(z.string()).optional(),
  attachments: z.array(z.string()).optional(),
  status: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const MaterialListResponseSchema = z.object({
  materials: z.array(MaterialResponseSchema),
  pagination: PaginationSchema,
});

// 리포트 관련 스키마
export const ReportResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  type: z.enum(['PROGRESS', 'PERFORMANCE', 'BEHAVIOR', 'ATTENDANCE']),
  status: z.enum(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ReportListResponseSchema = z.object({
  reports: z.array(ReportResponseSchema),
  pagination: PaginationSchema,
});

export const ReportDetailResponseSchema = ReportResponseSchema.extend({
  creator: UserResponseSchema.optional(),
  targetUser: UserResponseSchema.optional(),
});

// 학생 관련 스키마
export const StudentResponseSchema = UserResponseSchema.extend({
  grade: z.string().optional(),
  class: z.string().optional(),
});

export const StudentListResponseSchema = z.object({
  students: z.array(StudentResponseSchema),
  pagination: PaginationSchema,
});

// 교사 리포트 관련 스키마
export const TeacherReportResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  type: z.enum(['CLASS_PERFORMANCE', 'STUDENT_PROGRESS', 'CURRICULUM_FEEDBACK']),
  status: z.enum(['DRAFT', 'SUBMITTED', 'REVIEWED']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const TeacherReportListResponseSchema = z.object({
  reports: z.array(TeacherReportResponseSchema),
  pagination: PaginationSchema,
});

export const TeacherReportDetailResponseSchema = TeacherReportResponseSchema.extend({
  creator: UserResponseSchema.optional(),
  class: z
    .object({
      id: z.string(),
      name: z.string(),
      subject: z.string(),
    })
    .optional(),
});

// 교재 관련 스키마
export const TextbookResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  author: z.string(),
  publisher: z.string(),
  isbn: z.string().optional(),
  subject: z.string(),
  gradeLevel: z.string(),
  year: z.number(),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const TextbookListResponseSchema = z.object({
  textbooks: z.array(TextbookResponseSchema),
  pagination: PaginationSchema,
});

export const UpdateTextbookSchema = z.object({
  title: z.string().optional(),
  author: z.string().optional(),
  publisher: z.string().optional(),
  isbn: z.string().optional(),
  subject: z.string().optional(),
  gradeLevel: z.string().optional(),
  year: z.number().optional(),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
});

// 검색 관련 스키마
export const SearchQuerySchema = z.object({
  query: z.string(),
  type: z.enum(['PROBLEM', 'MATERIAL', 'USER', 'ALL']).optional(),
  filters: z
    .object({
      subject: z.string().optional(),
      gradeLevel: z.string().optional(),
      difficulty: z.string().optional(),
    })
    .optional(),
});

export const SearchResultSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  type: z.string(),
  score: z.number(),
});

export const SearchQueryListResponseSchema = z.object({
  queries: z.array(SearchQuerySchema),
  pagination: PaginationSchema,
});

export const SearchResultListResponseSchema = z.object({
  results: z.array(SearchResultSchema),
  pagination: PaginationSchema,
});

// 업로드 관련 스키마
export const UploadResponseSchema = z.object({
  success: z.boolean(),
  fileUrl: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
});

// 헬스 체크 관련 스키마
export const HealthResponseSchema = z.object({
  status: z.enum(['healthy', 'unhealthy']),
  timestamp: z.string(),
  services: z.object({
    database: z.enum(['up', 'down']),
    redis: z.enum(['up', 'down']).optional(),
    vector: z.enum(['up', 'down']).optional(),
  }),
  version: z.string(),
});

// 메트릭 관련 스키마
export const MetricResponseSchema = z.object({
  name: z.string(),
  value: z.number(),
  unit: z.string(),
  timestamp: z.string(),
});

export const MetricListResponseSchema = z.object({
  metrics: z.array(MetricResponseSchema),
  pagination: PaginationSchema,
});

// 알림 관련 스키마
export const AlertResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  message: z.string(),
  type: z.enum(['INFO', 'WARNING', 'ERROR', 'SUCCESS']),
  status: z.enum(['UNREAD', 'READ', 'ARCHIVED']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AlertListResponseSchema = z.object({
  alerts: z.array(AlertResponseSchema),
  pagination: PaginationSchema,
});

// 알림 관련 스키마
export const AlertPostBodySchema = z.object({
  action: z.enum(['register_alert', 'add_channel']),
  alertId: z.string().optional(),
  config: z.any().optional(),
  channelConfig: z.any().optional(),
});

export const AlertStatusResponseSchema = z.object({
  status: z.string(),
  alerts: z.array(z.any()),
  channels: z.array(z.any()),
});

export const AlertTestResponseSchema = z.object({
  success: z.boolean(),
  results: z.array(z.any()),
});

// AI 통계 관련 스키마
export const AIApiUsageListResponseSchema = z.object({
  usage: z.array(z.any()),
  pagination: PaginationSchema,
});

export const AIPerformanceMetricListResponseSchema = z.object({
  metrics: z.array(z.any()),
  pagination: PaginationSchema,
});

// 메트릭스 관련 스키마
export const MetricsOverviewSchema = z.object({
  totalRequests: z.number(),
  averageResponseTime: z.number(),
  errorRate: z.number(),
  activeUsers: z.number(),
});

export const MetricsTrendsSchema = z.object({
  requests: z.array(
    z.object({
      timestamp: z.string(),
      count: z.number(),
    }),
  ),
  responseTime: z.array(
    z.object({
      timestamp: z.string(),
      average: z.number(),
    }),
  ),
  errors: z.array(
    z.object({
      timestamp: z.string(),
      count: z.number(),
    }),
  ),
});

export const MetricsLogsSchema = z.object({
  logs: z.array(
    z.object({
      id: z.string(),
      timestamp: z.string(),
      level: z.string(),
      message: z.string(),
      metadata: z.any().optional(),
    }),
  ),
  pagination: PaginationSchema,
});

export const MetricsCacheSchema = z.object({
  hitRate: z.number(),
  missRate: z.number(),
  totalSize: z.number(),
  evictions: z.number(),
});

// 교사 리포트 관련 추가 스키마
export const CreateTeacherReportSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  type: z.enum(['CLASS_PERFORMANCE', 'STUDENT_PROGRESS', 'CURRICULUM_FEEDBACK']),
  classId: z.string().optional(),
});

export const TeacherReportListQuerySchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  type: z.enum(['CLASS_PERFORMANCE', 'STUDENT_PROGRESS', 'CURRICULUM_FEEDBACK']).optional(),
  status: z.enum(['DRAFT', 'SUBMITTED', 'REVIEWED']).optional(),
  createdBy: z.string().optional(),
  search: z.string().optional(),
});

// 교과서 관련 추가 스키마
export const CreateTextbookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  publisher: z.string().min(1),
  isbn: z.string().optional(),
  subject: z.string().min(1),
  gradeLevel: z.string().min(1),
  year: z.number(),
  description: z.string().optional(),
  coverImage: z.string().optional(),
});

export const TextbookListQuerySchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  subject: z.string().optional(),
  gradeLevel: z.string().optional(),
  year: z.number().optional(),
  search: z.string().optional(),
});
