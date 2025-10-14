import { ApiError, ApiSuccess } from '@/lib/api-response';
import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { createIncorrectAnswersData } from '@/server/services/incorrect-answers.service';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiError.unauthorized();
    }

    const result = await createIncorrectAnswersData(session.user.id);
    if (!result) {
      return ApiError.internalError('오답노트 데이터를 불러올 수 없습니다.');
    }

    logger.info('오답 노트 조회 성공', {
      userId: session.user.id,
      count: result.incorrectAnswers.length,
    });
    return ApiSuccess.ok(result.incorrectAnswers);
  } catch (error) {
    console.error('GET /api/dashboard/incorrect-answers error:', error);
    return ApiError.internalError();
  }
}

export async function PATCH(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiError.unauthorized();
    }

    // TODO: 신규 서비스에 업데이트 기능 추가 필요
    return ApiError.serviceUnavailable('업데이트 기능은 현재 지원되지 않습니다.');
  } catch (error) {
    console.error('PATCH /api/dashboard/incorrect-answers error:', error);
    return ApiError.internalError();
  }
}
