import { ApiError, ApiSuccess } from '@/lib/api-response';
import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { learningService } from '@/server/services/learning/learning.service';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

// 학습 완료 상태 조회
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

    const result = await learningService.getCompleteStatus(
      session.user.id,
      studyId,
      startNewAttempt,
    );
    logger.info('학습 완료 상태 조회 성공', { userId: session.user.id, studyId });
    return ApiSuccess.ok(result);
  } catch (error) {
    logger.error('학습 완료 상태 조회 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return ApiError.internalError();
  }
}

// 학습 완료 상태 초기화 (다시 풀기용)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return ApiError.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const studyId = searchParams.get('studyId');

    if (!studyId) {
      return ApiError.badRequest('studyId가 필요합니다.');
    }

    const result = await learningService.resetCompleteStatus(session.user.id, studyId);
    logger.info('학습 완료 상태 초기화 성공', { userId: session.user.id, studyId });
    return ApiSuccess.ok(result);
  } catch (error) {
    logger.error('학습 완료 상태 초기화 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return ApiError.internalError();
  }
}
