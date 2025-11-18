import { ApiError, ApiSuccess } from '@/lib/api-response';
import { authOptions } from '@/lib/core/auth';
import { teacherReportService } from '@/server/services/teacher-reports/teacher-report.service';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

/**
 * 학생의 특정 리포트 조회
 */
export async function GET(_request: NextRequest, { params }: { params: { reportId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiError.unauthorized();
    }

    // 학생만 접근 가능
    if (session.user.role !== 'STUDENT') {
      return ApiError.forbidden('학생만 접근할 수 있습니다');
    }

    const reportId = params.reportId;
    const report = await teacherReportService.getStudentReportById(reportId, session.user.id);

    if (!report) {
      return ApiError.notFound('리포트를 찾을 수 없습니다');
    }

    return ApiSuccess.ok(report);
  } catch (error) {
    console.error('GET /api/my/reports/[reportId] error:', error);
    return ApiError.internalError();
  }
}

/**
 * 학생 리포트 삭제
 */
export async function DELETE(_request: NextRequest, { params }: { params: { reportId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiError.unauthorized();
    }

    if (session.user.role !== 'STUDENT') {
      return ApiError.forbidden('학생만 접근할 수 있습니다');
    }

    await teacherReportService.deleteReport(params.reportId, session.user.id);

    return ApiSuccess.ok({ id: params.reportId });
  } catch (error) {
    console.error('DELETE /api/my/reports/[reportId] error:', error);
    if (error instanceof Error && /권한/.test(error.message)) {
      return ApiError.forbidden(error.message);
    }
    return ApiError.internalError('리포트 삭제에 실패했습니다.');
  }
}
