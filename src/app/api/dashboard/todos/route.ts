import { ApiSuccess } from '@/lib/api-response';
import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { TodoCreateSchema, TodoUpdateSchema } from '@/lib/validation/schemas';
import { todosService } from '@/server/services/dashboard/todos.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await todosService.getTodos(session.user.id);
    logger.info('할 일 리스트 조회 성공', { userId: session.user.id, count: data.length });
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // 초기 상태나 일시적 DB 에러에서도 리스트는 비어 있을 수 있으므로 200 + 빈 배열로 응답
    logger.warn('할 일 리스트 조회 실패 - 빈 배열로 대체 응답', {
      error: error instanceof Error ? error.message : String(error),
    });
    return new Response(JSON.stringify({ success: true, data: [] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = TodoCreateSchema.parse(body);

    const result = await todosService.createTodo(session.user.id, data);
    logger.info('할 일 생성 성공', { userId: session.user.id, todoId: result.id });
    return NextResponse.json(ApiSuccess.ok(result), { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'FK_USER_NOT_FOUND') {
      return NextResponse.json(
        {
          success: false,
          error: '사용자 정보를 찾을 수 없습니다. 다시 로그인 후 시도해 주세요.',
          code: 'FK_USER_NOT_FOUND',
        },
        { status: 400 },
      );
    }

    logger.error('할 일 생성 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data = TodoUpdateSchema.parse(body);

    const result = await todosService.updateTodo(data);
    logger.info('할 일 업데이트 성공', { userId: session.user.id, todoId: data.id });
    return NextResponse.json(ApiSuccess.ok(result));
  } catch (error) {
    if (error instanceof Error && error.message === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: '대상을 찾을 수 없습니다.',
          code: 'NOT_FOUND',
        },
        { status: 404 },
      );
    }

    logger.error('할 일 업데이트 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'id가 필요합니다.',
          code: 'BAD_REQUEST',
        },
        { status: 400 },
      );
    }

    const result = await todosService.deleteTodo(session.user.id, id);
    logger.info('할 일 삭제 성공', { userId: session.user.id, todoId: id });
    return NextResponse.json(ApiSuccess.ok(result));
  } catch (error) {
    logger.error('할 일 삭제 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
