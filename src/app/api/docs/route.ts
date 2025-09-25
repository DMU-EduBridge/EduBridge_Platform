import {
  MaterialListResponseSchema,
  ProblemListResponseSchema,
  ReportDetailResponseSchema,
  ReportListResponseSchema,
  SearchQueryListResponseSchema,
  SearchResultListResponseSchema,
  StudentListResponseSchema,
  TeacherReportListResponseSchema,
  TeacherReportResponseSchema,
  TextbookListResponseSchema,
  TextbookResponseSchema,
  UploadResponseSchema,
  UserListResponseSchema,
  UserResponseSchema,
} from '@/lib/schemas/api';
import {
  AttemptPostResponseSchema,
  AttemptsResponseSchema,
  SolutionResponseSchema,
} from '@/types/api';
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi';
import { NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // swagger 스펙은 항상 최신
export const runtime = 'edge';

export async function GET() {
  // Enable zod-to-openapi extensions on zod
  extendZodWithOpenApi(z);
  const registry = new OpenAPIRegistry();

  // 등록: 모든 DTO 스키마들을 components로 추가
  registry.register('UploadResponse', UploadResponseSchema);
  registry.register('ReportListResponse', ReportListResponseSchema);
  registry.register('ReportDetailResponse', ReportDetailResponseSchema);
  registry.register('ProblemListResponse', ProblemListResponseSchema);
  registry.register('StudentListResponse', StudentListResponseSchema);
  registry.register('MaterialListResponse', MaterialListResponseSchema);
  registry.register('TeacherReportListResponse', TeacherReportListResponseSchema);
  registry.register('TeacherReportResponseSchema', TeacherReportResponseSchema);
  registry.register('TextbookListResponseSchema', TextbookListResponseSchema);
  registry.register('TextbookResponseSchema', TextbookResponseSchema);
  registry.register('UserListResponseSchema', UserListResponseSchema);
  registry.register('UserResponseSchema', UserResponseSchema);
  registry.register('SearchQueryListResponseSchema', SearchQueryListResponseSchema);
  registry.register('SearchResultListResponseSchema', SearchResultListResponseSchema);
  // AI Stats 관련 스키마들은 삭제된 서비스로 인해 제거됨
  registry.register('AttemptsResponse', AttemptsResponseSchema as unknown as z.ZodTypeAny);
  registry.register('AttemptPostResponse', AttemptPostResponseSchema as unknown as z.ZodTypeAny);
  registry.register('SolutionResponse', SolutionResponseSchema as unknown as z.ZodTypeAny);

  // 공통 스키마들
  const Pagination = z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  });
  registry.register('Pagination', Pagination);

  const ErrorResponse = z.object({
    error: z.string(),
    details: z.array(z.any()).optional(),
  });
  registry.register('ErrorResponse', ErrorResponse);

  const generator = new OpenApiGeneratorV3(registry.definitions);
  const baseDoc = generator.generateDocument({
    openapi: '3.0.3',
    info: { title: 'EduBridge API', version: '1.0.0' },
    servers: [{ url: '/api' }],
  });

  const openapiSpec = {
    openapi: '3.0.3',
    info: {
      title: 'EduBridge API',
      version: '1.0.0',
      description: 'EduBridge 서비스 완전한 OpenAPI 스펙',
    },
    servers: [{ url: '/api' }],
    tags: [
      { name: 'Users', description: '사용자 관리' },
      { name: 'Problems', description: '문제 관리' },
      { name: 'Textbooks', description: '교과서 관리' },
      { name: 'Teacher Reports', description: '교사 리포트' },
      { name: 'Search', description: '검색 기능' },
      { name: 'Dashboard', description: '대시보드' },
      { name: 'Students', description: '학생 관리' },
      { name: 'Materials', description: '학습자료' },
      { name: 'Attempts', description: '문제 시도' },
      { name: 'Solutions', description: '문제 해설' },
      { name: 'AI Services', description: 'AI 서비스' },
      { name: 'AI Stats', description: 'AI 통계' },
      { name: 'Upload', description: '파일 업로드' },
      { name: 'Alerts', description: '알림' },
      { name: 'Metrics', description: '메트릭' },
      { name: 'Health', description: '헬스 체크' },
    ],
    security: [{ bearerAuth: [] }],
    paths: {
      // === 사용자 관리 API ===
      '/users': {
        get: {
          tags: ['Users'],
          summary: '사용자 목록 조회',
          description: '관리자만 사용자 목록을 조회할 수 있습니다.',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
            {
              name: 'role',
              in: 'query',
              schema: { type: 'string', enum: ['STUDENT', 'TEACHER', 'ADMIN'] },
            },
            {
              name: 'status',
              in: 'query',
              schema: { type: 'string', enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'] },
            },
            { name: 'search', in: 'query', schema: { type: 'string' } },
          ],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/UserListResponseSchema' },
                },
              },
            },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '403': { $ref: '#/components/responses/ForbiddenError' },
          },
        },
        post: {
          tags: ['Users'],
          summary: '새 사용자 생성',
          description: '관리자만 사용자를 생성할 수 있습니다.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email' },
                    name: { type: 'string' },
                    role: { type: 'string', enum: ['STUDENT', 'TEACHER', 'ADMIN'] },
                    avatar: { type: 'string', format: 'uri' },
                    bio: { type: 'string' },
                    grade: { type: 'string' },
                    school: { type: 'string' },
                    subject: { type: 'string' },
                  },
                  required: ['email', 'name', 'role'],
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Created',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/UserResponseSchema' } },
              },
            },
            '400': { $ref: '#/components/responses/BadRequestError' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '403': { $ref: '#/components/responses/ForbiddenError' },
            '409': { $ref: '#/components/responses/ConflictError' },
          },
        },
      },
      '/users/{id}': {
        get: {
          tags: ['Users'],
          summary: '특정 사용자 조회',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/UserResponseSchema' } },
              },
            },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '403': { $ref: '#/components/responses/ForbiddenError' },
            '404': { $ref: '#/components/responses/NotFoundError' },
          },
        },
        put: {
          tags: ['Users'],
          summary: '사용자 정보 업데이트',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { required: true },
          responses: {
            '200': { description: 'OK' },
            '400': { $ref: '#/components/responses/BadRequestError' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '403': { $ref: '#/components/responses/ForbiddenError' },
            '404': { $ref: '#/components/responses/NotFoundError' },
          },
        },
        delete: {
          tags: ['Users'],
          summary: '사용자 삭제',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            '200': { description: 'OK' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '403': { $ref: '#/components/responses/ForbiddenError' },
            '404': { $ref: '#/components/responses/NotFoundError' },
          },
        },
        patch: {
          tags: ['Users'],
          summary: '사용자 역할 설정',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { required: true },
          responses: {
            '200': { description: 'OK' },
            '400': { $ref: '#/components/responses/BadRequestError' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '403': { $ref: '#/components/responses/ForbiddenError' },
            '404': { $ref: '#/components/responses/NotFoundError' },
          },
        },
      },

      // === 문제 관리 API ===
      '/problems': {
        get: {
          tags: ['Problems'],
          summary: '문제 목록 조회',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
            { name: 'subject', in: 'query', schema: { type: 'string' } },
            { name: 'gradeLevel', in: 'query', schema: { type: 'string' } },
            {
              name: 'difficulty',
              in: 'query',
              schema: { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'] },
            },
            {
              name: 'type',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['MULTIPLE_CHOICE', 'SHORT_ANSWER', 'ESSAY', 'TRUE_FALSE'],
              },
            },
            { name: 'textbookId', in: 'query', schema: { type: 'string' } },
            { name: 'isAIGenerated', in: 'query', schema: { type: 'boolean' } },
            {
              name: 'reviewStatus',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['PENDING', 'APPROVED', 'REJECTED', 'NEEDS_REVISION'],
              },
            },
            { name: 'search', in: 'query', schema: { type: 'string' } },
          ],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ProblemListResponse' },
                },
              },
            },
            '400': { $ref: '#/components/responses/BadRequestError' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
          },
        },
        post: {
          tags: ['Problems'],
          summary: '새 문제 생성',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    content: { type: 'string' },
                    subject: { type: 'string' },
                    type: {
                      type: 'string',
                      enum: ['MULTIPLE_CHOICE', 'SHORT_ANSWER', 'ESSAY', 'TRUE_FALSE'],
                    },
                    difficulty: { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'] },
                    gradeLevel: { type: 'string' },
                    unit: { type: 'string' },
                    options: { type: 'array', items: { type: 'string' } },
                    correctAnswer: { type: 'string' },
                    explanation: { type: 'string' },
                    hints: { type: 'array', items: { type: 'string' } },
                    tags: { type: 'array', items: { type: 'string' } },
                    points: { type: 'integer', default: 1 },
                    timeLimit: { type: 'integer' },
                    textbookId: { type: 'string' },
                  },
                  required: ['title', 'content', 'subject', 'type', 'difficulty', 'correctAnswer'],
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Created',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ProblemItem' } },
              },
            },
            '400': { $ref: '#/components/responses/BadRequestError' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
          },
        },
      },
      '/problems/{id}': {
        get: {
          tags: ['Problems'],
          summary: '문제 상세 조회',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ProblemItem' } },
              },
            },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '404': { $ref: '#/components/responses/NotFoundError' },
          },
        },
        put: {
          tags: ['Problems'],
          summary: '문제 수정',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { required: true },
          responses: {
            '200': { description: 'OK' },
            '400': { $ref: '#/components/responses/BadRequestError' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '404': { $ref: '#/components/responses/NotFoundError' },
          },
        },
        delete: {
          tags: ['Problems'],
          summary: '문제 삭제',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            '200': { description: 'OK' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '404': { $ref: '#/components/responses/NotFoundError' },
          },
        },
      },
      '/problems/stats': {
        get: {
          tags: ['Problems'],
          summary: '문제 통계',
          responses: { '200': { description: 'OK' } },
        },
      },
      '/problems/{id}/attempts': {
        get: {
          tags: ['Attempts'],
          summary: '문제 시도 목록',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'OK' } },
        },
        post: {
          tags: ['Attempts'],
          summary: '문제 시도 생성',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { required: true },
          responses: { '201': { description: 'Created' } },
        },
      },
      '/problems/{id}/solution': {
        get: {
          tags: ['Solutions'],
          summary: '문제 해설 조회',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            '200': { description: 'OK' },
            '403': { description: 'Forbidden' },
            '404': { description: 'Not Found' },
          },
        },
      },

      // === 교과서 관리 API ===
      '/textbooks': {
        get: {
          tags: ['Textbooks'],
          summary: '교과서 목록 조회',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
            { name: 'subject', in: 'query', schema: { type: 'string' } },
            { name: 'gradeLevel', in: 'query', schema: { type: 'string' } },
            { name: 'publisher', in: 'query', schema: { type: 'string' } },
            {
              name: 'processingStatus',
              in: 'query',
              schema: { type: 'string', enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'] },
            },
            { name: 'search', in: 'query', schema: { type: 'string' } },
          ],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/TextbookListResponseSchema' },
                },
              },
            },
            '400': { $ref: '#/components/responses/BadRequestError' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
          },
        },
        post: {
          tags: ['Textbooks'],
          summary: '새 교과서 생성',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    subject: { type: 'string' },
                    gradeLevel: { type: 'string' },
                    publisher: { type: 'string' },
                    isbn: { type: 'string' },
                    description: { type: 'string' },
                    coverImageUrl: { type: 'string', format: 'uri' },
                    totalPages: { type: 'integer' },
                  },
                  required: ['title', 'subject', 'gradeLevel'],
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/TextbookResponseSchema' },
                },
              },
            },
            '400': { $ref: '#/components/responses/BadRequestError' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
          },
        },
      },
      '/textbooks/{id}': {
        get: {
          tags: ['Textbooks'],
          summary: '교과서 상세 조회',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/TextbookResponseSchema' },
                },
              },
            },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '404': { $ref: '#/components/responses/NotFoundError' },
          },
        },
        put: {
          tags: ['Textbooks'],
          summary: '교과서 수정',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: { required: true },
          responses: {
            '200': { description: 'OK' },
            '400': { $ref: '#/components/responses/BadRequestError' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '404': { $ref: '#/components/responses/NotFoundError' },
          },
        },
        delete: {
          tags: ['Textbooks'],
          summary: '교과서 삭제',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            '200': { description: 'OK' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
            '404': { $ref: '#/components/responses/NotFoundError' },
          },
        },
      },

      // === 교사 리포트 API ===
      '/teacher-reports': {
        get: {
          tags: ['Teacher Reports'],
          summary: '교사 리포트 목록 조회',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
            {
              name: 'status',
              in: 'query',
              schema: { type: 'string', enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] },
            },
            { name: 'search', in: 'query', schema: { type: 'string' } },
          ],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/TeacherReportListResponse' },
                },
              },
            },
            '400': { $ref: '#/components/responses/BadRequestError' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
          },
        },
        post: {
          tags: ['Teacher Reports'],
          summary: '새 교사 리포트 생성',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    classInfo: { type: 'object' },
                    students: { type: 'object' },
                    analysisData: { type: 'object' },
                    metadata: { type: 'object' },
                  },
                  required: ['title'],
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/TeacherReportResponseSchema' },
                },
              },
            },
            '400': { $ref: '#/components/responses/BadRequestError' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
          },
        },
      },

      // === 검색 API ===
      '/search': {
        get: {
          tags: ['Search'],
          summary: '검색 쿼리 목록 조회',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
            { name: 'userId', in: 'query', schema: { type: 'string' } },
            { name: 'subject', in: 'query', schema: { type: 'string' } },
            { name: 'gradeLevel', in: 'query', schema: { type: 'string' } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
          ],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SearchQueryListResponseSchema' },
                },
              },
            },
            '400': { $ref: '#/components/responses/BadRequestError' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
          },
        },
        post: {
          tags: ['Search'],
          summary: '벡터 검색 실행',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    query: { type: 'string' },
                    textbookId: { type: 'string' },
                    limit: { type: 'integer', default: 10 },
                    threshold: { type: 'number', default: 0.7 },
                  },
                  required: ['query'],
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      query: { $ref: '#/components/schemas/SearchQueryItem' },
                      results: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/DocumentChunkItem' },
                      },
                      totalResults: { type: 'integer' },
                    },
                  },
                },
              },
            },
            '400': { $ref: '#/components/responses/BadRequestError' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
          },
        },
      },

      // === 대시보드 API ===
      '/dashboard': {
        get: {
          tags: ['Dashboard'],
          summary: '통합 대시보드 데이터',
          parameters: [
            {
              name: 'timeRange',
              in: 'query',
              schema: { type: 'string', enum: ['1h', '24h', '7d', '30d'], default: '24h' },
            },
            { name: 'includeDetails', in: 'query', schema: { type: 'boolean', default: false } },
          ],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          summary: {
                            type: 'object',
                            properties: {
                              totalProblems: { type: 'integer' },
                              totalTextbooks: { type: 'integer' },
                              totalReports: { type: 'integer' },
                              totalSearches: { type: 'integer' },
                              totalApiCalls: { type: 'integer' },
                              totalCostUsd: { type: 'number' },
                            },
                          },
                          aiStats: { type: 'object' },
                          problemStats: { type: 'object' },
                          textbookStats: { type: 'object' },
                          teacherReportStats: { type: 'object' },
                          searchStats: { type: 'object' },
                          timeRange: { type: 'string' },
                          lastUpdated: { type: 'string', format: 'date-time' },
                        },
                      },
                    },
                  },
                },
              },
            },
            '400': { $ref: '#/components/responses/BadRequestError' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
          },
        },
      },

      // === 학생 관리 API ===
      '/students': {
        get: {
          tags: ['Students'],
          summary: '학생 목록',
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/StudentListResponse' },
                },
              },
            },
          },
        },
        post: {
          tags: ['Students'],
          summary: '학생 생성',
          requestBody: { required: true },
          responses: { '201': { description: 'Created' } },
        },
      },

      // === 학습자료 API ===
      '/learning-materials': {
        get: {
          tags: ['Materials'],
          summary: '학습자료 목록',
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/MaterialListResponse' },
                },
              },
            },
          },
        },
        post: {
          tags: ['Materials'],
          summary: '학습자료 생성',
          requestBody: { required: true },
          responses: {
            '201': {
              description: 'Created',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/MaterialItem' } },
              },
            },
          },
        },
      },

      // === AI 서비스 API ===
      '/ai/problems/sync': {
        post: {
          tags: ['AI Services'],
          summary: 'AI 문제 동기화',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    subject: { type: 'string' },
                    difficulty: { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'] },
                    type: {
                      type: 'string',
                      enum: ['MULTIPLE_CHOICE', 'SHORT_ANSWER', 'ESSAY', 'TRUE_FALSE'],
                    },
                    limit: { type: 'integer', default: 50 },
                    offset: { type: 'integer', default: 0 },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'OK' },
            '400': { $ref: '#/components/responses/BadRequestError' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
          },
        },
      },
      '/ai/educational': {
        post: {
          tags: ['AI Services'],
          summary: '교육 AI 서비스',
          requestBody: { required: true },
          responses: {
            '200': { description: 'OK' },
            '400': { $ref: '#/components/responses/BadRequestError' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
          },
        },
      },
      '/ai/sync': {
        post: {
          tags: ['AI Services'],
          summary: 'AI 서버 동기화',
          requestBody: { required: true },
          responses: {
            '200': { description: 'OK' },
            '400': { $ref: '#/components/responses/BadRequestError' },
            '401': { $ref: '#/components/responses/UnauthorizedError' },
          },
        },
      },
      '/ai/servers': {
        get: {
          tags: ['AI Services'],
          summary: 'AI 서버 상태',
          responses: { '200': { description: 'OK' } },
        },
      },
      '/ai/services/status': {
        get: {
          tags: ['AI Services'],
          summary: 'AI 서비스 상태',
          responses: { '200': { description: 'OK' } },
        },
      },

      // === AI 통계 API ===
      '/ai-stats/usage': {
        get: {
          tags: ['AI Stats'],
          summary: 'AI API 사용량 목록',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
            { name: 'userId', in: 'query', schema: { type: 'string' } },
            { name: 'apiType', in: 'query', schema: { type: 'string' } },
            { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
          ],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/UserListResponseSchema' },
                },
              },
            },
          },
        },
      },
      '/ai-stats/performance': {
        get: {
          tags: ['AI Stats'],
          summary: 'AI 성능 메트릭 목록',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
            { name: 'userId', in: 'query', schema: { type: 'string' } },
            { name: 'operationType', in: 'query', schema: { type: 'string' } },
            { name: 'success', in: 'query', schema: { type: 'boolean' } },
          ],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/UserListResponseSchema' },
                },
              },
            },
          },
        },
      },
      '/ai-stats/statistics': {
        get: {
          tags: ['AI Stats'],
          summary: 'AI 사용 통계 목록',
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
            { name: 'userId', in: 'query', schema: { type: 'string' } },
            { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date' } },
            { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date' } },
          ],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/UserListResponseSchema' },
                },
              },
            },
          },
        },
      },

      // === 파일 업로드 API ===
      '/upload': {
        post: {
          tags: ['Upload'],
          summary: '파일 업로드',
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: { file: { type: 'string', format: 'binary' } },
                  required: ['file'],
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/UploadResponse' } },
              },
            },
          },
        },
      },

      // === 알림 API ===
      '/alerts': {
        get: {
          tags: ['Alerts'],
          summary: '알림 상태/테스트',
          parameters: [
            { name: 'action', in: 'query', schema: { type: 'string', enum: ['status', 'test'] } },
          ],
          responses: { '200': { description: 'OK' } },
        },
        post: {
          tags: ['Alerts'],
          summary: '알림 설정 변경',
          requestBody: { required: true },
          responses: { '200': { description: 'OK' } },
        },
      },

      // === 메트릭 API ===
      '/metrics': {
        get: {
          tags: ['Metrics'],
          summary: '시스템 메트릭',
          parameters: [
            {
              name: 'type',
              in: 'query',
              schema: { type: 'string', enum: ['overview', 'trends', 'logs', 'cache'] },
            },
            { name: 'hours', in: 'query', schema: { type: 'integer' } },
          ],
          responses: { '200': { description: 'OK' } },
        },
      },

      // === 헬스 체크 API ===
      '/health': {
        get: {
          tags: ['Health'],
          summary: '헬스 체크',
          responses: {
            '200': { description: 'OK' },
            '503': { description: 'Unhealthy' },
          },
        },
      },
    },
    components: {
      schemas: baseDoc.components?.schemas || {},
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      responses: {
        BadRequestError: {
          description: 'Bad Request',
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
          },
        },
        UnauthorizedError: {
          description: 'Unauthorized',
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
          },
        },
        ForbiddenError: {
          description: 'Forbidden',
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
          },
        },
        NotFoundError: {
          description: 'Not Found',
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
          },
        },
        ConflictError: {
          description: 'Conflict',
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
          },
        },
      },
    },
  };

  return NextResponse.json(openapiSpec, { headers: { 'Cache-Control': 'no-store' } });
}
