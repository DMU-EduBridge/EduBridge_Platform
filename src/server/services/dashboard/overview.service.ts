import { prisma } from '@/lib/core/prisma';

export class DashboardOverviewService {
  async getOverview(userId: string) {
    // 실제 구현에서는 DB 집계를 사용해야 하지만,
    // 현재는 최소한의 구조만 반환합니다. 기존 route.ts의 더미 구조는
    // 프런트가 의존하는 shape을 유지합니다.

    // 학습 진도(간단 샘플) - 최근 학습자료 기준 상위 3개
    const materials = await prisma.learningMaterial.findMany({
      where: { isActive: true },
      take: 3,
      orderBy: { updatedAt: 'desc' },
    });

    const learningProgress = materials.map((m, idx) => ({
      id: m.id,
      subject: m.subject || m.title,
      grade: '',
      gradeColor: (idx % 2 === 0 ? 'green' : 'red') as 'green' | 'red',
      currentUnit: m.title,
      progress: 30 + idx * 20,
      totalProblems: 100,
      completedProblems: 30 + idx * 20,
      lastStudiedAt: new Date().toISOString(),
    }));

    // todos 상위 4개
    const todos = await prisma.todo.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 4,
    });

    const messages: any[] = [];
    const aiChatExamples: any[] = [];
    const incorrectAnswerNotes: any[] = [];

    const summary = {
      totalSubjects: learningProgress.length,
      totalTodos: await prisma.todo.count({ where: { userId } }),
      completedTodos: await prisma.todo.count({ where: { userId, completed: true } }),
      unreadMessages: 0,
      totalIncorrectProblems: 0,
      completedIncorrectProblems: 0,
    };

    return {
      learningProgress,
      todos: todos.map((t) => ({
        id: t.id,
        text: t.text,
        completed: t.completed,
        priority: (t.priority as any) ?? 'medium',
        dueDate: t.dueDate?.toISOString(),
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
      messages,
      aiChatExamples,
      incorrectAnswerNotes,
      summary,
    };
  }
}

export const dashboardOverviewService = new DashboardOverviewService();
