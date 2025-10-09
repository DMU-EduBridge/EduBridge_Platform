import { ApiError, ApiSuccess } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/errors/error-handler';
import { logger } from '@/lib/monitoring';
import { withAuth } from '@/server/http/handler';
import { learningService } from '@/server/services/learning/learning.service';
import { NextRequest } from 'next/server';

// 학습 완료 상태 조회
export const GET = withErrorHandler(async (request: NextRequest) => {
  return withAuth(async ({ userId }) => {
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

    const result = await learningService.getCompleteStatus(userId, studyId, startNewAttempt);
    logger.info('학습 완료 상태 조회 성공', { userId, studyId });
    return ApiSuccess.ok(result);
  });
});

// 학습 완료 상태 초기화 (다시 풀기용)
export const DELETE = withErrorHandler(async (request: NextRequest) => {
  return withAuth(async ({ userId }) => {
    const { searchParams } = new URL(request.url);
    const studyId = searchParams.get('studyId');

    if (!studyId) {
      return ApiError.badRequest('studyId가 필요합니다.');
    }

    const result = await learningService.resetCompleteStatus(userId, studyId);
    logger.info('학습 완료 상태 초기화 성공', { userId, studyId });
    return ApiSuccess.ok(result);
  });
});
