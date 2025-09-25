import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { logger } from '@/lib/monitoring';
import {
  CreateTeacherReportSchema,
  TeacherReportListQuerySchema,
  TeacherReportListResponseSchema,
  TeacherReportResponseSchema,
} from '@/lib/schemas/api';
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
    const parsed = TeacherReportListQuerySchema.safeParse({
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

    // 직접 Prisma를 사용하여 교사 리포트 조회
    const { page = 1, limit = 20, status, search } = parsed.data;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [{ title: { contains: search } }, { description: { contains: search } }];
    }

    const [reports, total] = await Promise.all([
      prisma.teacherReport.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.teacherReport.count({ where }),
    ]);

    const result = {
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

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
    const parsed = CreateTeacherReportSchema.safeParse(body);

    if (!parsed.success) {
      logger.error('잘못된 요청 데이터입니다.', undefined, { details: parsed.error.errors });
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    // 직접 Prisma를 사용하여 교사 리포트 생성
    const report = await prisma.teacherReport.create({
      data: {
        ...parsed.data,
        createdBy: session.user.id,
      },
    });

    // 응답 스키마 검증
    const response = TeacherReportResponseSchema.parse(report);

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    logger.error('교사 리포트 생성 API 오류', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '교사 리포트 생성에 실패했습니다.' }, { status: 500 });
  }
}
