import { authOptions } from '@/lib/core/auth';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Teacher Report System 클라이언트
class TeacherReportClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    this.baseUrl = process.env.TEACHER_REPORT_URL || 'http://localhost:8001';
    this.apiKey = process.env.TEACHER_REPORT_API_KEY;
  }

  async generateReport(params: {
    students: any[];
    class_info: any;
    report_type: 'full' | 'summary';
  }) {
    const url = new URL('/api/v1/reports/generate', this.baseUrl);

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
        throw new Error(`Teacher Report 서버 응답 오류: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async generateSampleData(params: {
    sample_type: 'normal' | 'struggling' | 'high_achieving';
    num_students: number;
    subjects: string[];
  }) {
    const url = new URL('/api/v1/reports/sample-data', this.baseUrl);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

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
        throw new Error(`Teacher Report 서버 응답 오류: ${response.status} ${response.statusText}`);
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

const teacherReport = new TeacherReportClient();

// 리포트 생성 요청 스키마
const GenerateReportSchema = z.object({
  students: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      math: z.number().min(0).max(100),
      korean: z.number().min(0).max(100),
      english: z.number().min(0).max(100),
      assignment_rate: z.number().min(0).max(100),
    }),
  ),
  class_info: z.object({
    grade: z.number(),
    class: z.number(),
    subject: z.string(),
    teacher: z.string(),
  }),
  report_type: z.enum(['full', 'summary']).default('full'),
});

// 샘플 데이터 생성 요청 스키마
const SampleDataSchema = z.object({
  sample_type: z.enum(['normal', 'struggling', 'high_achieving']).default('normal'),
  num_students: z.number().min(5).max(50).default(30),
  subjects: z.array(z.string()).default(['math', 'korean', 'english']),
});

/**
 * 리포트 생성 API
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // 선생님 또는 관리자만 사용 가능
    if (!session?.user?.role || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = GenerateReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const result = await teacherReport.generateReport(parsed.data);

    return NextResponse.json({
      success: true,
      message: '리포트 생성이 완료되었습니다.',
      report: result.report,
      analysis: result.analysis,
      metadata: result.metadata,
    });
  } catch (error) {
    console.error('리포트 생성 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '리포트 생성 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

/**
 * 샘플 데이터 생성 API
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = SampleDataSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const result = await teacherReport.generateSampleData(parsed.data);

    return NextResponse.json({
      success: true,
      message: '샘플 데이터 생성이 완료되었습니다.',
      students: result.students,
      class_info: result.class_info,
      metadata: result.metadata,
    });
  } catch (error) {
    console.error('샘플 데이터 생성 오류:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '샘플 데이터 생성 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}

/**
 * Teacher Report 서버 상태 확인
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const isHealthy = await teacherReport.checkHealth();

    return NextResponse.json({
      success: true,
      status: {
        isHealthy,
        service: 'Teacher Report System',
        lastChecked: new Date(),
      },
    });
  } catch (error) {
    console.error('Teacher Report 상태 확인 오류:', error);
    return NextResponse.json(
      { error: 'Teacher Report 상태 확인 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
