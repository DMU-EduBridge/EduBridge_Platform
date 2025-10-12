import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { logger } from '@/lib/monitoring';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 리포트 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 교사만 접근 가능
    if (session.user.role !== 'TEACHER') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type') || undefined;
    const status = searchParams.get('status') || undefined;
    const studentId = searchParams.get('studentId') || undefined;

    const skip = (page - 1) * limit;

    const where: any = {
      createdBy: session.user.id,
    };

    if (type && type !== 'all') {
      where.type = type;
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    // 학생별 리포트 필터링은 현재 스키마에서 지원하지 않으므로 제외
    // 추후 확장 시 TeacherReport 모델에 studentId 필드 추가 필요

    const [reports, total] = await Promise.all([
      prisma.teacherReport.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          reportType: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          class: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.teacherReport.count({ where }),
    ]);

    // 리포트 데이터 변환
    const transformedReports = reports.map((report) => ({
      id: report.id,
      title: report.title,
      type: report.reportType,
      status: report.status,
      period: report.class?.name || '전체',
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      student: null, // 현재 스키마에서 학생 정보는 직접 연결되지 않음
    }));

    logger.info('리포트 목록 조회 성공', {
      userId: session.user.id,
      count: reports.length,
      total,
    });

    return NextResponse.json({
      success: true,
      data: {
        reports: transformedReports,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    logger.error('리포트 목록 조회 실패', undefined, { error: error.message });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * 새 리포트 생성
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 교사만 접근 가능
    if (session.user.role !== 'TEACHER') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, type, period, studentIds, subjectIds } = body;

    // TeacherReport 생성
    const report = await prisma.teacherReport.create({
      data: {
        title: title || `리포트 ${new Date().toLocaleDateString()}`,
        content: '',
        reportType: type || 'PROGRESS_REPORT',
        status: 'DRAFT',
        createdBy: session.user.id,
        classId: null, // 추후 확장 시 클래스 연결
        metadata: {
          period,
          studentIds: studentIds || [],
          subjectIds: subjectIds || [],
        },
      },
    });

    logger.info('리포트 생성 성공', {
      userId: session.user.id,
      reportId: report.id,
    });

    return NextResponse.json({ success: true, data: report }, { status: 201 });
  } catch (error: any) {
    logger.error('리포트 생성 실패', undefined, { error: error.message });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
