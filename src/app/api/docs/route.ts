import { MaterialListResponseSchema } from '@/server/dto/material';
import { ProblemListResponseSchema } from '@/server/dto/problem';
import { ReportDetailResponseSchema, ReportListResponseSchema } from '@/server/dto/report';
import { StudentListResponseSchema } from '@/server/dto/student';
import { UploadResponseSchema } from '@/server/dto/upload';
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
  // 등록: DTO 스키마들을 components로 추가
  registry.register('UploadResponse', UploadResponseSchema);
  registry.register('ReportListResponse', ReportListResponseSchema);
  registry.register('ReportDetailResponse', ReportDetailResponseSchema);
  registry.register('ProblemListResponse', ProblemListResponseSchema);
  registry.register('StudentListResponse', StudentListResponseSchema);
  registry.register('MaterialListResponse', MaterialListResponseSchema);
  registry.register('AttemptsResponse', AttemptsResponseSchema as unknown as z.ZodTypeAny);
  registry.register('AttemptPostResponse', AttemptPostResponseSchema as unknown as z.ZodTypeAny);
  registry.register('SolutionResponse', SolutionResponseSchema as unknown as z.ZodTypeAny);

  // 공통 Pagination(간단 등록)
  const Pagination = z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  });
  registry.register('Pagination', Pagination);

  const generator = new OpenApiGeneratorV3(registry.definitions);
  const baseDoc = generator.generateDocument({
    openapi: '3.0.3',
    info: { title: 'EduBridge API', version: '1.0.0' },
    servers: [{ url: '/api' }],
  });

  const openapi = {
    openapi: '3.0.3',
    info: {
      title: 'EduBridge API',
      version: '1.0.0',
      description: 'EduBridge 서비스 OpenAPI 스펙(요약)',
    },
    servers: [{ url: '/api' }],
    tags: [
      { name: 'Reports' },
      { name: 'Problems' },
      { name: 'Attempts' },
      { name: 'Solutions' },
      { name: 'Students' },
      { name: 'Materials' },
      { name: 'Upload' },
      { name: 'Alerts' },
      { name: 'Metrics' },
      { name: 'Health' },
    ],
    components: { schemas: baseDoc.components?.schemas || {} },
    paths: {
      '/reports': {
        get: {
          tags: ['Reports'],
          summary: '리포트 목록',
          parameters: [
            { name: 'type', in: 'query', schema: { type: 'string' } },
            { name: 'status', in: 'query', schema: { type: 'string' } },
            { name: 'studentId', in: 'query', schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
          ],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      reports: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/ReportItem' },
                      },
                      pagination: { $ref: '#/components/schemas/Pagination' },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Bad Request',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
              },
            },
          },
        },
        post: {
          tags: ['Reports'],
          summary: '리포트 생성',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    studentId: { type: 'string' },
                    type: { type: 'string' },
                    title: { type: 'string' },
                    period: { type: 'string' },
                  },
                  required: ['studentId', 'type', 'title', 'period'],
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Created',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ReportItem' } },
              },
            },
          },
        },
      },
      '/reports/{id}': {
        get: {
          tags: ['Reports'],
          summary: '리포트 상세',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ReportItem' } },
              },
            },
            '404': {
              description: 'Not Found',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } },
              },
            },
          },
        },
      },
      '/reports/stats': {
        get: {
          tags: ['Reports'],
          summary: '리포트 통계',
          responses: { '200': { description: 'OK' } },
        },
      },
      '/reports/{id}/download': {
        get: {
          tags: ['Reports'],
          summary: '리포트 PDF 다운로드',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'PDF' } },
        },
      },
      '/problems': {
        get: {
          tags: ['Problems'],
          summary: '문제 목록',
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      problems: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/ProblemItem' },
                      },
                      pagination: { $ref: '#/components/schemas/Pagination' },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ['Problems'],
          summary: '문제 생성',
          requestBody: { required: true },
          responses: {
            '201': {
              description: 'Created',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ProblemItem' } },
              },
            },
          },
        },
      },
      '/problems/{id}': {
        get: {
          tags: ['Problems'],
          summary: '문제 상세',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ProblemItem' } },
              },
            },
          },
        },
        put: {
          tags: ['Problems'],
          summary: '문제 수정',
          requestBody: { required: true },
          responses: { '200': { description: 'OK' } },
        },
        delete: {
          tags: ['Problems'],
          summary: '문제 삭제',
          responses: { '200': { description: 'OK' } },
        },
      },
      '/problems/{id}/attempts': {
        get: {
          tags: ['Attempts'],
          summary: '문제 시도 목록(본인)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'OK' } },
        },
        post: {
          tags: ['Attempts'],
          summary: '문제 시도 생성',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { selected: { type: 'string' } },
                  required: ['selected'],
                },
              },
            },
          },
          responses: { '201': { description: 'Created' } },
        },
      },
      '/problems/{id}/solution': {
        get: {
          tags: ['Solutions'],
          summary: '문제 해설 조회(권한 필요)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            '200': { description: 'OK' },
            '403': { description: 'Forbidden' },
            '404': { description: 'Not Found' },
          },
        },
      },
      '/students': {
        get: {
          tags: ['Students'],
          summary: '학생 목록',
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      students: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/StudentItem' },
                      },
                      pagination: { $ref: '#/components/schemas/Pagination' },
                    },
                  },
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
      '/learning-materials': {
        get: {
          tags: ['Materials'],
          summary: '학습자료 목록',
          responses: {
            '200': {
              description: 'OK',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      materials: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/MaterialItem' },
                      },
                      pagination: { $ref: '#/components/schemas/Pagination' },
                    },
                  },
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
      '/health': {
        get: {
          tags: ['Health'],
          summary: '헬스 체크',
          responses: { '200': { description: 'OK' }, '503': { description: 'Unhealthy' } },
        },
      },
      '/stats': {
        get: {
          tags: ['Metrics'],
          summary: '대시보드 통계(내부)',
          responses: { '200': { description: 'OK' } },
        },
      },
    },
  };

  return NextResponse.json(openapi, { headers: { 'Cache-Control': 'no-store' } });
}
