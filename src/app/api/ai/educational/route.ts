import { authOptions } from '@/lib/core/auth';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Educational AI System 클라이언트
class EducationalAIClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    this.baseUrl = process.env.EDUCATIONAL_AI_URL || 'http://localhost:8000';
    this.apiKey = process.env.EDUCATIONAL_AI_API_KEY;
  }

  async generateQuestions(params: {
    subject: string;
    unit?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    count: number;
    textbookContent?: string;
  }) {
    const url = new URL('/api/generate-questions', this.baseUrl);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60초 타임아웃

    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
        },
        body: JSON.stringify(params),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Educational AI 서버 응답 오류: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async processTextbook(params: { file: string; subject: string; unit: string }) {
    const url = new URL('/api/process-textbook', this.baseUrl);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2분 타임아웃

    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
        },
        body: JSON.stringify(params),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Educational AI 서버 응답 오류: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async checkHealth() {
    const url = new URL('/health', this.baseUrl);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { Authorization: `Bearer ${this.apiKey}` }),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      clearTimeout(timeoutId);
      return false;
    }
  }
}

const educationalAI = new EducationalAIClient();

// 문제 생성 요청 스키마
const GenerateQuestionsSchema = z.object({
  subject: z.string().min(1),
  unit: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  count: z.number().min(1).max(20).default(5),
  textbookContent: z.string().optional(),
});

// 교과서 처리 요청 스키마
const ProcessTextbookSchema = z.object({
  file: z.string().min(1),
  subject: z.string().min(1),
  unit: z.string().min(1),
});

/**
 * 문제 생성 API
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // 선생님 또는 관리자만 사용 가능
    if (!session?.user?.role || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = GenerateQuestionsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const result = await educationalAI.generateQuestions(parsed.data);

    return NextResponse.json({
      success: true,
      message: '문제 생성이 완료되었습니다.',
      questions: result.questions,
      metadata: result.metadata,
    });
  } catch (error) {
    console.error('문제 생성 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '문제 생성 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

/**
 * 교과서 처리 API
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = ProcessTextbookSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const result = await educationalAI.processTextbook(parsed.data);

    return NextResponse.json({
      success: true,
      message: '교과서 처리가 완료되었습니다.',
      processedChunks: result.chunks,
      embeddings: result.embeddings,
      metadata: result.metadata,
    });
  } catch (error) {
    console.error('교과서 처리 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '교과서 처리 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

/**
 * Educational AI 서버 상태 확인
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const isHealthy = await educationalAI.checkHealth();

    return NextResponse.json({
      success: true,
      status: {
        isHealthy,
        service: 'Educational AI System',
        lastChecked: new Date(),
      },
    });
  } catch (error) {
    console.error('Educational AI 상태 확인 오류:', error);
    return NextResponse.json(
      { error: 'Educational AI 상태 확인 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
