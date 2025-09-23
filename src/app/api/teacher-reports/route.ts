import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { teacherReportService } from '@/server';
import {
  CreateTeacherReportDto,
  TeacherReportListQueryDto,
  TeacherReportListResponseSchema,
  TeacherReportResponseDto,
} from '@/server/dto/teacher-report';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 교사 리포트 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const parsed = TeacherReportListQueryDto.safeParse({
      page: Number(searchParams.get('page')) || undefined,
      limit: Number(searchParams.get('limit')) || undefined,
      status: (searchParams.get('status') as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED') || undefined,
      search: searchParams.get('search') || undefined,
    });

    if (!parsed.success) {
      logger.error('잘못된 요청 데이터입니다.', undefined, { details: parsed.error.errors });
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const result = await teacherReportService.getTeacherReports(parsed.data);

    // 응답 스키마 검증
    const response = TeacherReportListResponseSchema.parse({
      reports: result.reports,
      pagination: result.pagination,
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error('교사 리포트 목록 조회 API 오류', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '교사 리포트 목록 조회에 실패했습니다.' }, { status: 500 });
  }
}

/**
 * 새 교사 리포트 생성
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = CreateTeacherReportDto.safeParse(body);

    if (!parsed.success) {
      logger.error('잘못된 요청 데이터입니다.', undefined, { details: parsed.error.errors });
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const report = await teacherReportService.createTeacherReport(parsed.data, session.user.id);

    // 응답 스키마 검증
    const response = TeacherReportResponseDto.parse(report);

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    logger.error('교사 리포트 생성 API 오류', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '교사 리포트 생성에 실패했습니다.' }, { status: 500 });
  }
}
