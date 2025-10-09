import { logger } from '@/lib/monitoring';
import { ok, withAuth } from '@/server/http/handler';
import { createIncorrectAnswersData } from '@/server/services/incorrect-answers.service';
import { NextRequest } from 'next/server';

export async function GET() {
  return withAuth(async ({ userId }) => {
    const result = await createIncorrectAnswersData(userId);
    if (!result) {
      return new Response(
        JSON.stringify({
          success: false,
          error: '오답노트 데이터를 불러올 수 없습니다.',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    logger.info('오답 노트 조회 성공', { userId, count: result.incorrectAnswers.length });
    return new Response(JSON.stringify(ok(result.incorrectAnswers)), {
      headers: { 'Content-Type': 'application/json' },
    });
  });
}

export async function PATCH(request: NextRequest) {
  return withAuth(async ({ userId }) => {
    // TODO: 신규 서비스에 업데이트 기능 추가 필요
    return new Response(
      JSON.stringify({
        success: false,
        error: '업데이트 기능은 현재 지원되지 않습니다.',
        code: 'NOT_IMPLEMENTED',
      }),
      {
        status: 501,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  });
}
