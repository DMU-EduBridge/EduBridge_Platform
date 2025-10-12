import { ApiError, ApiSuccess } from '@/lib/api-response';
import { authOptions } from '@/lib/core/auth';
import { classProgressService } from '@/server/services/progress/class-progress.service';
import { ProgressFilters } from '@/types/domain/progress';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { studentId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiError.unauthorized();
    }

    if (!['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return ApiError.forbidden('교사 또는 관리자만 학생 진도를 조회할 수 있습니다');
    }

    const { studentId } = params;
    const { searchParams } = new URL(request.url);

    // 필터 파라미터 파싱
    const filters: ProgressFilters = {};
    if (searchParams.get('classId')) {
      filters.classId = searchParams.get('classId')!;
    }
    if (searchParams.get('subject')) {
      filters.subject = searchParams.get('subject')!;
    }
    if (searchParams.get('difficulty')) {
      filters.difficulty = searchParams.get('difficulty')!;
    }
    if (searchParams.get('startDate')) {
      filters.startDate = new Date(searchParams.get('startDate')!);
    }
    if (searchParams.get('endDate')) {
      filters.endDate = new Date(searchParams.get('endDate')!);
    }
    if (searchParams.get('minProgress')) {
      filters.minProgress = parseInt(searchParams.get('minProgress')!);
    }
    if (searchParams.get('maxProgress')) {
      filters.maxProgress = parseInt(searchParams.get('maxProgress')!);
    }

    const detailedProgress = await classProgressService.getStudentDetailedProgress(
      studentId,
      session.user.id,
      filters,
    );

    if (!detailedProgress) {
      return ApiError.notFound('학생을 찾을 수 없거나 접근 권한이 없습니다');
    }

    return ApiSuccess.ok(detailedProgress);
  } catch (error) {
    console.error('GET /api/students/[studentId]/progress error:', error);
    return ApiError.internalError();
  }
}
