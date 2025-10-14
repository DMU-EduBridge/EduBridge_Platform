import { ApiError, ApiSuccess } from '@/lib/api-response';
import { authOptions } from '@/lib/core/auth';
import { teacherReportService } from '@/server/services/teacher-reports/teacher-report.service';
import { UpdateTeacherReportRequest } from '@/types/domain/teacher-report';
import { ReportStatus } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { z } from 'zod';

const updateReportSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  status: z.nativeEnum(ReportStatus).optional(),
});

export async function GET(_request: NextRequest, { params }: { params: { reportId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiError.unauthorized();
    }

    if (!['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return ApiError.forbidden('교사 또는 관리자만 리포트를 조회할 수 있습니다');
    }

    const { reportId } = params;
    const report = await teacherReportService.getReportById(reportId, session.user.id);

    if (!report) {
      return ApiError.notFound('리포트를 찾을 수 없습니다');
    }

    return ApiSuccess.ok(report);
  } catch (error) {
    console.error('GET /api/teacher-reports/[reportId] error:', error);
    return ApiError.internalError();
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { reportId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiError.unauthorized();
    }

    if (!['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return ApiError.forbidden('교사 또는 관리자만 리포트를 수정할 수 있습니다');
    }

    const { reportId } = params;
    const body = await request.json();
    const validatedData = updateReportSchema.parse(body) as UpdateTeacherReportRequest;

    const report = await teacherReportService.updateReport(
      reportId,
      validatedData,
      session.user.id,
    );
    return ApiSuccess.ok(report);
  } catch (error) {
    console.error('PATCH /api/teacher-reports/[reportId] error:', error);
    return ApiError.internalError();
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { reportId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiError.unauthorized();
    }

    if (!['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return ApiError.forbidden('교사 또는 관리자만 리포트를 삭제할 수 있습니다');
    }

    const { reportId } = params;
    await teacherReportService.deleteReport(reportId, session.user.id);
    return ApiSuccess.ok({ message: '리포트가 삭제되었습니다' });
  } catch (error) {
    console.error('DELETE /api/teacher-reports/[reportId] error:', error);
    return ApiError.internalError();
  }
}
