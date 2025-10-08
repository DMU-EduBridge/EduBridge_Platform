import { prisma } from '@/lib/core/prisma';
import { TodoCreateSchema, TodoUpdateSchema } from '@/lib/validation/schemas';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

export class TodosService {
  async getTodos(_userId: string) {
    try {
      const todos = await prisma.todo.findMany({
        where: { userId: _userId },
        orderBy: { createdAt: 'desc' },
      });

      return todos.map((t) => ({
        id: t.id,
        text: t.text,
        completed: t.completed,
        priority: (t.priority as 'high' | 'medium' | 'low') ?? 'medium',
        category: t.category ?? undefined,
        description: t.description ?? undefined,
        dueDate: t.dueDate ? t.dueDate.toISOString() : undefined,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      }));
    } catch (err) {
      // 테이블 미존재 등 초기 상태에서도 500 대신 빈 배열을 반환하여 UI가 동작하도록 함
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2021') {
        return [];
      }
      throw err;
    }
  }

  async createTodo(userId: string, data: z.infer<typeof TodoCreateSchema>) {
    const { text, priority, category, description, dueDate } = data;

    // 사용자 존재 여부 검증 (FK 에러를 사전에 400으로 안내)
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('FK_USER_NOT_FOUND');
    }

    const created = await prisma.todo.create({
      data: {
        userId,
        text,
        completed: false,
        priority,
        category: category ?? null,
        description: description ?? null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    return {
      id: created.id,
      text: created.text,
      completed: created.completed,
      priority: (created.priority as 'high' | 'medium' | 'low') ?? 'medium',
      category: created.category ?? undefined,
      description: created.description ?? undefined,
      dueDate: created.dueDate ? created.dueDate.toISOString() : undefined,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }

  async updateTodo(data: z.infer<typeof TodoUpdateSchema>) {
    const { id, ...fields } = data;

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

    return {
      id: updated.id,
      text: updated.text,
      completed: updated.completed,
      priority: (updated.priority as 'high' | 'medium' | 'low') ?? 'medium',
      category: updated.category ?? undefined,
      description: updated.description ?? undefined,
      dueDate: updated.dueDate ? updated.dueDate.toISOString() : undefined,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  async deleteTodo(_userId: string, id: string) {
    await prisma.todo.delete({ where: { id } });
    return { success: true };
  }
}

export const todosService = new TodosService();
