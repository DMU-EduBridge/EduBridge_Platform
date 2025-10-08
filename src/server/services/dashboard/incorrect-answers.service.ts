import { prisma } from '@/lib/core/prisma';
import { IncorrectAnswerUpdateSchema } from '@/lib/validation/schemas';
import { z } from 'zod';

export class IncorrectAnswersService {
  async getIncorrectAnswers(userId: string) {
    // 사용자 진행 데이터(오답) 조회 + 문제/과목 메타 결합
    const progresses = await prisma.problemProgress.findMany({
      where: { userId },
      orderBy: [{ attemptNumber: 'desc' }, { completedAt: 'desc' }],
      select: {
        studyId: true,
        problemId: true,
        isCorrect: true,
        selectedAnswer: true,
        attemptNumber: true,
        completedAt: true,
        problem: {
          select: {
            id: true,
            title: true,
            subject: true,
            correctAnswer: true,
            explanation: true,
          },
        },
      },
    });

    // 문제별 최신 시도만 고려
    const latestByProblem = new Map<string, (typeof progresses)[number]>();
    for (const p of progresses) {
      if (!latestByProblem.has(p.problemId)) latestByProblem.set(p.problemId, p);
    }

    // 과목 단위 그룹핑(오답만)
    const group = new Map<string, any>();
    latestByProblem.forEach((p) => {
      const subject = p.problem?.subject || '기타';
      const note: any = group.get(subject) || {
        id: subject,
        subject,
        grade: '',
        gradeColor: 'red',
        status: '복습 필요',
        statusColor: 'red',
        incorrectCount: 0,
        retryCount: 0,
        completedCount: 0,
        totalProblems: 0,
        lastUpdated: new Date().toISOString(),
        problems: [],
      };

      // 전체 문제 수/완료 수 집계는 최신 시도 기준
      note.totalProblems += 1;
      if (p.isCorrect) note.completedCount += 1;
      else note.incorrectCount += 1;

      const retried = progresses.find(
        (x) => x.problemId === p.problemId && x.attemptNumber < p.attemptNumber,
      )
        ? true
        : false;
      if (retried) note.retryCount += 1;

      note.lastUpdated = p.completedAt?.toISOString?.() || note.lastUpdated;
      if (!p.isCorrect) {
        note.problems.push({
          id: p.problemId,
          question: p.problem?.title || '문제',
          correctAnswer: p.problem?.correctAnswer || '',
          userAnswer: p.selectedAnswer || '',
          explanation: p.problem?.explanation || '',
          isRetried: retried,
          isCompleted: false,
        });
      }

      group.set(subject, note);
    });

    return Array.from(group.values());
  }

  async updateIncorrectAnswer(userId: string, data: z.infer<typeof IncorrectAnswerUpdateSchema>) {
    const { problemId } = data;

    // Find the latest incorrect attempt for this problem and user
    const latestIncorrectAttempt = await prisma.problemProgress.findFirst({
      where: {
        userId,
        problemId,
        isCorrect: false,
      },
      orderBy: { completedAt: 'desc' },
    });

    if (!latestIncorrectAttempt) {
      throw new Error('NOT_FOUND');
    }

    // Note: ProblemProgress 모델에는 isRetried, isCompleted 필드가 없으므로
    // 현재는 단순히 업데이트 시간만 갱신합니다.
    // 실제 구현에서는 별도 테이블이나 JSON 필드를 사용해야 할 수 있습니다.
    const updatedProgress = await prisma.problemProgress.update({
      where: { id: latestIncorrectAttempt.id },
      data: {
        updatedAt: new Date(),
      },
    });

    return {
      ...updatedProgress,
      // Note: 실제 구현에서는 별도 테이블이나 JSON 필드를 사용해야 할 수 있습니다.
      isRetried: false,
      isCompleted: false,
    };
  }
}

export const incorrectAnswersService = new IncorrectAnswersService();
