import { logger } from '@/lib/monitoring';
import { IncorrectAnswerUpdateSchema } from '@/lib/validation/schemas';
import { ok, withAuth } from '@/server/http/handler';
import { incorrectAnswersService } from '@/server/services/dashboard/incorrect-answers.service';
import { NextRequest } from 'next/server';

export async function GET() {
  return withAuth(async ({ userId }) => {
    const data = await incorrectAnswersService.getIncorrectAnswers(userId);
    logger.info('오답 노트 조회 성공', { userId, count: data.length });
    return new Response(JSON.stringify(ok(data)), {
      headers: { 'Content-Type': 'application/json' },
    });
  });
}

export async function PATCH(request: NextRequest) {
  return withAuth(async ({ userId }) => {
    const body = await request.json();
    const data = IncorrectAnswerUpdateSchema.parse(body);

    try {
      const result = await incorrectAnswersService.updateIncorrectAnswer(userId, data);
      logger.info('오답 노트 업데이트 성공', {
        userId,
        noteId: data.id,
        problemId: data.problemId,
      });
      return new Response(JSON.stringify(ok(result)), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_FOUND') {
        return new Response(
          JSON.stringify({
            success: false,
            error: '해당 문제에 대한 오답 기록을 찾을 수 없습니다.',
            code: 'NOT_FOUND',
          }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }
      throw error;
    }
  });
}
