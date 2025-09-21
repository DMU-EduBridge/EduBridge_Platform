import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import {
  addRequestId,
  addSecurityHeaders,
  createBadRequestResponse,
  createErrorResponse,
  createPaginatedResponse,
  createSuccessResponse,
  createUnauthorizedResponse,
} from '@/lib/utils/api-response';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { z } from 'zod';

// 리포트 저장 요청 스키마
const SaveReportSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  reportType: z.enum(['full', 'summary']),
  classInfo: z.object({
    grade: z.number(),
    class: z.number(),
    subject: z.string(),
    teacher: z.string(),
  }),
  studentCount: z.number(),
  analysis: z.any().optional(),
});

// 리포트 조회 요청 스키마
const GetReportsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  reportType: z.enum(['full', 'summary']).optional(),
});

/**
 * 리포트 저장
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return addSecurityHeaders(addRequestId(createUnauthorizedResponse(), request));
    }

    const body = await request.json();
    const parsed = SaveReportSchema.safeParse(body);

    if (!parsed.success) {
      return addSecurityHeaders(
        addRequestId(createBadRequestResponse('잘못된 요청 데이터입니다.'), request),
      );
    }

    const { title, content, reportType, classInfo, studentCount, analysis } = parsed.data;

    // 리포트 저장
    const report = await prisma.teacherReport.create({
      data: {
        teacherId: session.user.id,
        title,
        content,
        reportType: reportType.toUpperCase(), // FULL, SUMMARY
        classInfo: JSON.stringify(classInfo),
        studentCount,
        analysis: analysis ? JSON.stringify(analysis) : null,
        status: 'COMPLETED',
      },
    });

    const response = createSuccessResponse(
      {
        id: report.id,
        title: report.title,
        createdAt: report.createdAt,
      },
      '리포트가 저장되었습니다.',
    );

    return addSecurityHeaders(addRequestId(response, request));
  } catch (error) {
    console.error('리포트 저장 오류:', error);
    return addSecurityHeaders(
      addRequestId(createErrorResponse('리포트 저장 중 오류가 발생했습니다.'), request),
    );
  }
}

/**
 * 리포트 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return addSecurityHeaders(addRequestId(createUnauthorizedResponse(), request));
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const reportType = searchParams.get('reportType');

    const parsed = GetReportsSchema.safeParse({ page, limit, reportType });

    if (!parsed.success) {
      return addSecurityHeaders(
        addRequestId(createBadRequestResponse('잘못된 요청 데이터입니다.'), request),
      );
    }

    const { page: validPage, limit: validLimit, reportType: validReportType } = parsed.data;

    // 리포트 목록 조회
    const where = {
      teacherId: session.user.id, // 교사 ID로 필터링
      deletedAt: null, // 소프트 삭제되지 않은 것만
      ...(validReportType && {
        reportType: validReportType.toUpperCase(),
      }),
    };

    const [reports, total] = await Promise.all([
      prisma.teacherReport.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (validPage - 1) * validLimit,
        take: validLimit,
        select: {
          id: true,
          title: true,
          reportType: true,
          classInfo: true,
          studentCount: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.teacherReport.count({ where }),
    ]);

    const formattedReports = reports.map((report) => {
      const classInfo = JSON.parse(report.classInfo);
      return {
        id: report.id,
        title: report.title,
        type: report.reportType.toLowerCase(), // FULL -> full, SUMMARY -> summary
        period: `${classInfo.grade}학년 ${classInfo.class}반 ${classInfo.subject}`,
        studentCount: report.studentCount,
        status: report.status,
        createdAt: report.createdAt,
      };
    });

    const response = createPaginatedResponse(
      formattedReports,
      {
        page: validPage,
        limit: validLimit,
        total,
      },
      '리포트 목록을 성공적으로 조회했습니다.',
    );

    return addSecurityHeaders(addRequestId(response, request));
  } catch (error) {
    console.error('리포트 조회 오류:', error);
    return addSecurityHeaders(
      addRequestId(createErrorResponse('리포트 조회 중 오류가 발생했습니다.'), request),
    );
  }
}
