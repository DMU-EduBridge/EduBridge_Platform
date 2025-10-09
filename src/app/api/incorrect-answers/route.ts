/**
 * 오답노트 API 엔드포인트
 */

import { ApiSuccess, ApiError } from '@/lib/api-response';
import { authOptions } from '@/lib/core/auth';
import { createIncorrectAnswersData } from '@/server/services/incorrect-answers.service';
import { getServerSession } from 'next-auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return ApiError.unauthorized();
    }

    const incorrectAnswersData = await createIncorrectAnswersData(session.user.id);

    if (!incorrectAnswersData) {
      return ApiError.internalError('오답노트 데이터를 불러올 수 없습니다.');
    }

    return ApiSuccess.ok(incorrectAnswersData);
  } catch (error) {
    console.error('오답노트 API 오류:', error);
    return ApiError.internalError();
  }
}
