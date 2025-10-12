import { ApiError, ApiSuccess } from '@/lib/api-response';
import { authOptions } from '@/lib/core/auth';
import { teacherReportService } from '@/server/services/teacher-reports/teacher-report.service';
import { CreateTeacherReportRequest, ReportFilters } from '@/types/domain/teacher-report';
import { ReportType } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { z } from 'zod';

const createReportSchema = z.object({
  title: z.string().min(1, '리포트 제목은 필수입니다'),
  reportType: z.nativeEnum(ReportType),
  classId: z.string().optional(),
  studentIds: z.array(z.string()).optional(),
  analysisPeriod: z
    .object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
    })
    .optional(),
  includeCharts: z.boolean().optional().default(true),
  includeRecommendations: z.boolean().optional().default(true),
  customPrompt: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiError.unauthorized();
    }

    if (!['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return ApiError.forbidden('교사 또는 관리자만 리포트를 조회할 수 있습니다');
    }

    const { searchParams } = new URL(request.url);
    const filters: ReportFilters = {};

    if (searchParams.get('classId')) {
      filters.classId = searchParams.get('classId')!;
    }
    if (searchParams.get('reportType')) {
      filters.reportType = searchParams.get('reportType')!;
    }
    if (searchParams.get('status')) {
      filters.status = searchParams.get('status')!;
    }
    if (searchParams.get('startDate')) {
      filters.startDate = new Date(searchParams.get('startDate')!);
    }
    if (searchParams.get('endDate')) {
      filters.endDate = new Date(searchParams.get('endDate')!);
    }

    const reports = await teacherReportService.getTeacherReports(session.user.id, filters);
    return ApiSuccess.ok(reports);
  } catch (error) {
    console.error('GET /api/teacher-reports error:', error);
    return ApiError.internalError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiError.unauthorized();
    }

    if (!['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return ApiError.forbidden('교사 또는 관리자만 리포트를 생성할 수 있습니다');
    }

    const body = await request.json();
    const parsedData = createReportSchema.parse(body);

    // 날짜 문자열을 Date 객체로 변환
    const validatedData: CreateTeacherReportRequest = {
      ...parsedData,
      analysisPeriod: parsedData.analysisPeriod
        ? {
            startDate: new Date(parsedData.analysisPeriod.startDate),
            endDate: new Date(parsedData.analysisPeriod.endDate),
          }
        : undefined,
    };

    const report = await teacherReportService.createReport(validatedData, session.user.id);
    return ApiSuccess.created(report);
  } catch (error) {
    console.error('POST /api/teacher-reports error:', error);
    return ApiError.internalError();
  }
}
