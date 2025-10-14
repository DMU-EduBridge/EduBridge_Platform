import { ApiError, ApiSuccess } from '@/lib/api-response';
import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { assignmentService } from '@/server/services/assignments/assignment.service';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

export async function GET(_request: NextRequest, { params }: { params: { classId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiError.unauthorized();
    }

    if (!['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return ApiError.forbidden('교사 또는 관리자만 클래스 배정을 조회할 수 있습니다');
    }

    const assignments = await assignmentService.getClassAssignments(
      params.classId,
      session.user.id,
    );
    logger.info('클래스 배정 목록 조회 성공', {
      userId: session.user.id,
      classId: params.classId,
      count: assignments.length,
    });
    return ApiSuccess.ok(assignments);
  } catch (error) {
    console.error('GET /api/classes/[classId]/assignments error:', error);
    if (error instanceof Error) {
      return ApiError.badRequest(error.message);
    }
    return ApiError.internalError();
  }
}
