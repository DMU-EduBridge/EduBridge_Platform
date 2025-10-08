import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { logger } from '@/lib/monitoring';
import { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

type Priority = 'high' | 'medium' | 'low';

const TodoUpdateSchema = z.object({
  id: z.string(),
  completed: z.boolean().optional(),
  text: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
});

const TodoCreateSchema = z.object({
  text: z.string().min(1, '할 일 내용을 입력해주세요'),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  category: z.string().optional(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    let todos;
    try {
      todos = await prisma.todo.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      // 테이블 미존재 등 초기 상태에서도 500 대신 빈 배열을 반환하여 UI가 동작하도록 함
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2021') {
        logger.warn('todos 테이블이 아직 생성되지 않았습니다. 빈 배열을 반환합니다.', {
          userId: session.user.id,
        });
        return NextResponse.json({ success: true, data: [] as any[] });
      }
      throw err;
    }

    logger.info('할 일 리스트 조회 성공', { userId: session.user.id, count: todos.length });

    return NextResponse.json({
      success: true,
      data: todos.map((t) => ({
        id: t.id,
        text: t.text,
        completed: t.completed,
        priority: (t.priority as Priority) ?? 'medium',
        category: t.category ?? undefined,
        description: t.description ?? undefined,
        dueDate: t.dueDate ? t.dueDate.toISOString() : undefined,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    // 초기 상태나 일시적 DB 에러에서도 리스트는 비어 있을 수 있으므로 200 + 빈 배열로 응답
    logger.warn('할 일 리스트 조회 실패 - 빈 배열로 대체 응답', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ success: true, data: [] });
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

    const { text, priority, category, description, dueDate } = parsed.data;

    // 사용자 존재 여부 검증 (FK 에러를 사전에 400으로 안내)
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) {
      return NextResponse.json(
        {
          error: '사용자 정보를 찾을 수 없습니다. 다시 로그인 후 시도해 주세요.',
          code: 'FK_USER_NOT_FOUND',
        },
        { status: 400 },
      );
    }

    const created = await prisma.todo.create({
      data: {
        userId: session.user.id,
        text,
        completed: false,
        priority,
        category: category ?? null,
        description: description ?? null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    logger.info('할 일 생성 성공', { userId: session.user.id, todoId: created.id });

    return NextResponse.json({
      success: true,
      data: {
        id: created.id,
        text: created.text,
        completed: created.completed,
        priority: (created.priority as Priority) ?? 'medium',
        category: created.category ?? undefined,
        description: created.description ?? undefined,
        dueDate: created.dueDate ? created.dueDate.toISOString() : undefined,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // FK 제약 등 상세 코드 반환
      logger.error('할 일 생성 실패', undefined, {
        code: error.code,
        meta: error.meta,
      });
      if (error.code === 'P2003') {
        // 외래키 제약 위반: 세션 사용자 ID가 users 테이블에 없음
        return NextResponse.json(
          { error: '사용자 정보가 유효하지 않습니다.', code: 'FK_USER_NOT_FOUND' },
          { status: 400 },
        );
      }
    }
    const message = error instanceof Error ? error.message : String(error);
    logger.error('할 일 생성 실패', undefined, { error: message });
    return NextResponse.json(
      { error: '할 일 생성에 실패했습니다.', details: message },
      { status: 500 },
    );
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

    const { id, ...fields } = parsed.data;

    const updated = await prisma.todo.update({
      where: { id },
      data: {
        ...(fields.completed !== undefined ? { completed: fields.completed } : {}),
        ...(fields.text !== undefined ? { text: fields.text } : {}),
        ...(fields.priority !== undefined ? { priority: fields.priority } : {}),
        ...(fields.category !== undefined ? { category: fields.category } : {}),
        ...(fields.description !== undefined ? { description: fields.description } : {}),
        ...(fields.dueDate !== undefined
          ? { dueDate: fields.dueDate ? new Date(fields.dueDate) : null }
          : {}),
      },
    });

    logger.info('할 일 업데이트 성공', { userId: session.user.id, todoId: id });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        text: updated.text,
        completed: updated.completed,
        priority: (updated.priority as Priority) ?? 'medium',
        category: updated.category ?? undefined,
        description: updated.description ?? undefined,
        dueDate: updated.dueDate ? updated.dueDate.toISOString() : undefined,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      logger.error('할 일 업데이트 실패', undefined, {
        code: error.code,
        meta: error.meta,
      });
      if (error.code === 'P2025') {
        return NextResponse.json({ error: '대상을 찾을 수 없습니다.' }, { status: 404 });
      }
    }
    logger.error('할 일 업데이트 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '할 일 업데이트에 실패했습니다.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id가 필요합니다.' }, { status: 400 });
    }

    await prisma.todo.delete({ where: { id } });

    logger.info('할 일 삭제 성공', { userId: session.user.id, todoId: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('할 일 삭제 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '할 일 삭제에 실패했습니다.' }, { status: 500 });
  }
}
