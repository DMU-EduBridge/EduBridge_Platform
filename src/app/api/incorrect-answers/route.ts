/**
 * 오답노트 API 엔드포인트
 */

import { ApiError, ApiSuccess } from '@/lib/api-response';
import { authOptions } from '@/lib/core/auth';
import { withErrorHandler } from '@/lib/errors/error-handler';
import { createIncorrectAnswersData } from '@/server/services/incorrect-answers.service';
import { getServerSession } from 'next-auth';

export const GET = withErrorHandler(async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return ApiError.unauthorized();
  }

  const incorrectAnswersData = await createIncorrectAnswersData(session.user.id);

  if (!incorrectAnswersData) {
    return ApiError.internalError('오답노트 데이터를 불러올 수 없습니다.');
  }

  return ApiSuccess.ok(incorrectAnswersData);
});
