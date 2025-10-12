import { ApiError, ApiSuccess } from '@/lib/api-response';
import { authOptions } from '@/lib/core/auth';
import { classProgressService } from '@/server/services/progress/class-progress.service';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { classId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiError.unauthorized();
    }

    if (!['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return ApiError.forbidden('교사 또는 관리자만 클래스 진도를 조회할 수 있습니다');
    }

    const { classId } = params;
    const progressSummary = await classProgressService.getClassProgressSummary(
      classId,
      session.user.id,
    );

    if (!progressSummary) {
      return ApiError.notFound('클래스를 찾을 수 없거나 접근 권한이 없습니다');
    }

    return ApiSuccess.ok(progressSummary);
  } catch (error) {
    console.error('GET /api/classes/[classId]/progress error:', error);
    return ApiError.internalError();
  }
}
