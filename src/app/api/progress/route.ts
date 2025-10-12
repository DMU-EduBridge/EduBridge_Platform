import { ApiError, ApiSuccess } from '@/lib/api-response';
import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { ProgressPostSchema } from '@/lib/validation/schemas';
import { progressService } from '@/server/services/progress/progress.service';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

// 문제 완료 상태 저장
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiError.unauthorized();
    }

    console.log('POST /api/progress called with userId:', session.user.id);
    const body = await request.json();
    console.log('Request body:', body);
    const data = ProgressPostSchema.parse(body);
    console.log('Parsed data:', data);

    const result = await progressService.saveProgress(session.user.id, data);
    logger.info('문제 진행 저장 성공', {
      userId: session.user.id,
      studyId: data.studyId,
      problemId: data.problemId,
    });
    return ApiSuccess.ok(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'PROBLEM_NOT_IN_STUDY') {
        return ApiError.badRequest('해당 문제는 이 학습 자료에 속하지 않습니다.');
      }
      if (error.message === 'NO_PROBLEMS') {
        return ApiError.badRequest('학습 자료에 등록된 문제가 없습니다.');
      }
    }
    console.error('Error saving progress:', error);
    return ApiError.internalError('진도 저장에 실패했습니다.');
  }
}

// 학습 진행 상태 조회
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiError.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const studyId = searchParams.get('studyId');
    const startNewAttemptParam = searchParams.get('startNewAttempt');
    let startNewAttempt: boolean | number | undefined;

    if (startNewAttemptParam === 'true') {
      startNewAttempt = true;
    } else if (startNewAttemptParam === 'false') {
      startNewAttempt = false;
    } else if (startNewAttemptParam && !isNaN(Number(startNewAttemptParam))) {
      startNewAttempt = Number(startNewAttemptParam);
    }

    if (!studyId) {
      return ApiError.badRequest('studyId가 필요합니다.');
    }

    const result = await progressService.getProgress(session.user.id, studyId, startNewAttempt);
    logger.info('학습 진행 상태 조회 성공', { userId: session.user.id, studyId });
    return ApiSuccess.ok(result);
  } catch (error) {
    console.error('Error getting progress:', error);
    return ApiError.internalError('진도 조회에 실패했습니다.');
  }
}

// 문제 진행 상태 삭제 (재시도용)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiError.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const studyId = searchParams.get('studyId');
    const problemId = searchParams.get('problemId');

    if (!studyId) {
      return ApiError.badRequest('studyId가 필요합니다.');
    }

    const result = await progressService.deleteProgress(
      session.user.id,
      studyId,
      problemId || undefined,
    );
    logger.info('문제 진행 상태 삭제 성공', {
      userId: session.user.id,
      studyId,
      problemId,
      deletedCount: result.deletedCount,
    });
    return ApiSuccess.ok(result);
  } catch (error) {
    console.error('Error deleting progress:', error);
    return ApiError.internalError('진도 삭제에 실패했습니다.');
  }
}
