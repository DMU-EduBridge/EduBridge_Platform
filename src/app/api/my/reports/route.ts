import { ApiError, ApiSuccess } from '@/lib/api-response';
import { authOptions } from '@/lib/core/auth';
import { teacherReportService } from '@/server/services/teacher-reports/teacher-report.service';
import { ReportFilters } from '@/types/domain/teacher-report';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

/**
 * 학생의 리포트 목록 조회 (본인이 생성한 리포트만)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiError.unauthorized();
    }

    // 학생만 접근 가능
    if (session.user.role !== 'STUDENT') {
      return ApiError.forbidden('학생만 접근할 수 있습니다');
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

    // 학생의 경우 본인이 생성한 리포트만 조회
    const reports = await teacherReportService.getStudentReports(session.user.id, filters);
    return ApiSuccess.ok(reports);
  } catch (error) {
    console.error('GET /api/my/reports error:', error);
    return ApiError.internalError();
  }
}
