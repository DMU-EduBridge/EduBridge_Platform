import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

const TodoUpdateSchema = z.object({
  id: z.string(),
  completed: z.boolean(),
});

const TodoCreateSchema = z.object({
  text: z.string().min(1, '할 일 내용을 입력해주세요'),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  dueDate: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // 실제 데이터베이스에서 가져올 데이터 (현재는 시뮬레이션)
    const todos: TodoItem[] = [
      {
        id: '1',
        text: '모의고사 오답 확인하기',
        completed: true,
        priority: 'high',
        dueDate: '2024-01-21',
        createdAt: '2024-01-20T09:00:00Z',
        updatedAt: '2024-01-20T15:30:00Z',
      },
      {
        id: '2',
        text: '모의고사 점수 알려드리기',
        completed: true,
        priority: 'high',
        dueDate: '2024-01-21',
        createdAt: '2024-01-20T09:00:00Z',
        updatedAt: '2024-01-20T16:00:00Z',
      },
      {
        id: '3',
        text: '한국의 역사 오답노트 문제 풀기',
        completed: false,
        priority: 'medium',
        dueDate: '2024-01-22',
        createdAt: '2024-01-20T10:00:00Z',
        updatedAt: '2024-01-20T10:00:00Z',
      },
      {
        id: '4',
        text: '고등 영어 예습하기',
        completed: false,
        priority: 'low',
        dueDate: '2024-01-23',
        createdAt: '2024-01-20T11:00:00Z',
        updatedAt: '2024-01-20T11:00:00Z',
      },
    ];

    logger.info('할 일 리스트 조회 성공', { userId: session.user.id, count: todos.length });

    return NextResponse.json({
      success: true,
      data: todos,
    });
  } catch (error) {
    logger.error('할 일 리스트 조회 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '할 일 리스트 조회에 실패했습니다.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = TodoCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const { text, priority, dueDate } = parsed.data;

    // 실제 데이터베이스에 저장할 데이터
    const newTodo: TodoItem = {
      id: Date.now().toString(),
      text,
      completed: false,
      priority,
      dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    logger.info('할 일 생성 성공', { userId: session.user.id, todoId: newTodo.id });

    return NextResponse.json({
      success: true,
      data: newTodo,
    });
  } catch (error) {
    logger.error('할 일 생성 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '할 일 생성에 실패했습니다.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = TodoUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const { id, completed } = parsed.data;

    // 실제 데이터베이스에서 업데이트할 데이터
    const updatedTodo: TodoItem = {
      id,
      text: '업데이트된 할 일',
      completed,
      priority: 'medium',
      createdAt: '2024-01-20T09:00:00Z',
      updatedAt: new Date().toISOString(),
    };

    logger.info('할 일 업데이트 성공', { userId: session.user.id, todoId: id, completed });

    return NextResponse.json({
      success: true,
      data: updatedTodo,
    });
  } catch (error) {
    logger.error('할 일 업데이트 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '할 일 업데이트에 실패했습니다.' }, { status: 500 });
  }
}
