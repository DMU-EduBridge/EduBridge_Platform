import { ApiSuccess, ApiError } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/errors/error-handler';
import { logger } from '@/lib/monitoring';
import { withAuth } from '@/server/http/handler';
import { createIncorrectAnswersData } from '@/server/services/incorrect-answers.service';

export const GET = withErrorHandler(async () => {
  return withAuth(async ({ userId }) => {
    const result = await createIncorrectAnswersData(userId);
    if (!result) {
      return ApiError.internalError('오답노트 데이터를 불러올 수 없습니다.');
    }

    logger.info('오답 노트 조회 성공', { userId, count: result.incorrectAnswers.length });
    return ApiSuccess.ok(result.incorrectAnswers);
  });
});

export const PATCH = withErrorHandler(async () => {
  return withAuth(async () => {
    // TODO: 신규 서비스에 업데이트 기능 추가 필요
    return ApiError.serviceUnavailable('업데이트 기능은 현재 지원되지 않습니다.');
  });
});
