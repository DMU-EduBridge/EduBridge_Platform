import { ApiError, ApiSuccess } from '@/lib/api-response';
import { authOptions } from '@/lib/core/auth';
import { teacherReportService } from '@/server/services/teacher-reports/teacher-report.service';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiError.unauthorized();
    }

    if (!['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return ApiError.forbidden('교사 또는 관리자만 리포트 통계를 조회할 수 있습니다');
    }

    const stats = await teacherReportService.getReportStats(session.user.id);
    return ApiSuccess.ok(stats);
  } catch (error) {
    console.error('GET /api/teacher-reports/stats error:', error);
    return ApiError.internalError();
  }
}
