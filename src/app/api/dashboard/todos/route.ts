import { logger } from '@/lib/monitoring';
import { TodoCreateSchema, TodoUpdateSchema } from '@/lib/validation/schemas';
import { ok, withAuth } from '@/server/http/handler';
import { todosService } from '@/server/services/dashboard/todos.service';
import { NextRequest } from 'next/server';

export async function GET() {
  return withAuth(async ({ userId }) => {
    try {
      const data = await todosService.getTodos(userId);
      logger.info('할 일 리스트 조회 성공', { userId, count: data.length });
      return new Response(JSON.stringify(ok(data)), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      // 초기 상태나 일시적 DB 에러에서도 리스트는 비어 있을 수 있으므로 200 + 빈 배열로 응답
      logger.warn('할 일 리스트 조회 실패 - 빈 배열로 대체 응답', {
        error: error instanceof Error ? error.message : String(error),
      });
      return new Response(JSON.stringify(ok([])), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(async ({ userId }) => {
    const body = await request.json();
    const data = TodoCreateSchema.parse(body);

    try {
      const result = await todosService.createTodo(userId, data);
      logger.info('할 일 생성 성공', { userId, todoId: result.id });
      return new Response(JSON.stringify(ok(result)), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'FK_USER_NOT_FOUND') {
        return new Response(
          JSON.stringify({
            success: false,
            error: '사용자 정보를 찾을 수 없습니다. 다시 로그인 후 시도해 주세요.',
            code: 'FK_USER_NOT_FOUND',
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }
      throw error;
    }
  });
}

export async function PATCH(request: NextRequest) {
  return withAuth(async ({ userId }) => {
    const body = await request.json();
    const data = TodoUpdateSchema.parse(body);

    try {
      const result = await todosService.updateTodo(data);
      logger.info('할 일 업데이트 성공', { userId, todoId: data.id });
      return new Response(JSON.stringify(ok(result)), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'P2025') {
        return new Response(
          JSON.stringify({
            success: false,
            error: '대상을 찾을 수 없습니다.',
            code: 'NOT_FOUND',
          }),
          { status: 404, headers: { 'Content-Type': 'application/json' } },
        );
      }
      throw error;
    }
  });
}

export async function DELETE(request: NextRequest) {
  return withAuth(async ({ userId }) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: 'id가 필요합니다.', code: 'BAD_REQUEST' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const result = await todosService.deleteTodo(userId, id);
    logger.info('할 일 삭제 성공', { userId, todoId: id });
    return new Response(JSON.stringify(ok(result)), {
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
