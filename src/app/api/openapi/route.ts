import { NextResponse } from 'next/server';

export async function GET() {
  const spec = {
    openapi: '3.0.3',
    info: {
      title: 'EduBridge API',
      version: '1.0.0',
      description:
        'EduBridge 서비스용 OpenAPI 명세. 응답 포맷은 기본적으로 { success, data | error, code } 형태를 따릅니다.',
    },
    servers: [{ url: '/' }],
    tags: [
      { name: 'Problems', description: '문제/학습자료 매핑' },
      { name: 'Todos', description: '할 일 관리' },
    ],
    paths: {
      '/api/problems/material': {
        get: {
          tags: ['Problems'],
          summary: '문제-학습자료 매핑 조회(배치/단건 통합)',
          parameters: [
            {
              name: 'ids',
              in: 'query',
              required: true,
              schema: { type: 'string' },
              description: '쉼표로 구분된 problemId 목록 (예: p1,p2,p3)',
            },
          ],
          responses: {
            '200': {
              description: '성공',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            studyId: { type: 'string', nullable: true },
                          },
                          required: ['id', 'studyId'],
                        },
                      },
                    },
                    required: ['success', 'data'],
                  },
                },
              },
            },
            '400': { description: '잘못된 요청(ids 없음)', content: { 'application/json': {} } },
            '401': { description: '인증 필요', content: { 'application/json': {} } },
            '500': { description: '서버 오류', content: { 'application/json': {} } },
          },
        },
      },
      '/api/problems/material/batch': {
        get: {
          tags: ['Problems'],
          summary: '[Deprecated] 문제-학습자료 매핑 배치 조회',
          parameters: [
            {
              name: 'ids',
              in: 'query',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: { '200': { description: '성공' }, '410': { description: 'Deprecated' } },
        },
      },
      '/api/dashboard/todos': {
        get: {
          tags: ['Todos'],
          summary: '할 일 목록 조회',
          responses: {
            '200': {
              description: '성공',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            id: { type: 'string' },
                            text: { type: 'string' },
                            completed: { type: 'boolean' },
                            priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                            category: { type: 'string', nullable: true },
                            description: { type: 'string', nullable: true },
                            dueDate: { type: 'string', nullable: true, format: 'date-time' },
                            createdAt: { type: 'string', format: 'date-time' },
                            updatedAt: { type: 'string', format: 'date-time' },
                          },
                          required: ['id', 'text', 'completed', 'priority', 'createdAt', 'updatedAt'],
                        },
                      },
                    },
                  },
                },
              },
            },
            '401': { description: '인증 필요' },
          },
        },
        post: {
          tags: ['Todos'],
          summary: '할 일 생성',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    text: { type: 'string' },
                    priority: { type: 'string', enum: ['high', 'medium', 'low'] },
                    category: { type: 'string', nullable: true },
                    description: { type: 'string', nullable: true },
                    dueDate: { type: 'string', nullable: true },
                  },
                  required: ['text'],
                },
              },
            },
          },
          responses: { '200': { description: '성공' }, '400': { description: '검증 실패' }, '401': { description: '인증 필요' } },
        },
        patch: {
          tags: ['Todos'],
          summary: '할 일 수정',
          responses: { '200': { description: '성공' }, '401': { description: '인증 필요' } },
        },
        delete: {
          tags: ['Todos'],
          summary: '할 일 삭제',
          parameters: [{ name: 'id', in: 'query', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: '성공' }, '401': { description: '인증 필요' } },
        },
      },
    },
  } as const;

  return NextResponse.json(spec);
}


