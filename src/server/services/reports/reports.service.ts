import { prisma } from '@/lib/core/prisma';

export class ReportsService {
  async getReportDetail(userId: string, reportId: string) {
    // 리포트 기본 정보 조회
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!report) {
      throw new Error('NOT_FOUND');
    }

    // 사용자별 문제 진행 데이터 조회
    const problemProgresses = await prisma.problemProgress.findMany({
      where: { userId },
      include: {
        problem: {
          select: {
            id: true,
            title: true,
            subject: true,
            difficulty: true,
            type: true,
            correctAnswer: true,
            explanation: true,
          },
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    // 최신 시도만 고려
    const latestAttempts = new Map<string, (typeof problemProgresses)[0]>();
    for (const progress of problemProgresses) {
      if (!latestAttempts.has(progress.problemId)) {
        latestAttempts.set(progress.problemId, progress);
      }
    }

    const attempts = Array.from(latestAttempts.values());

    // KPI 계산
    const totalProblems = attempts.length;
    const correctAnswers = attempts.filter((a) => a.isCorrect).length;
    const accuracy = totalProblems > 0 ? Math.round((correctAnswers / totalProblems) * 100) : 0;
    const averageTime =
      attempts.length > 0
        ? Math.round(attempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / attempts.length)
        : 0;

    // 과목별 분석
    const subjectBreakdown = this.calculateSubjectBreakdown(attempts);

    // 개념/스킬 매트릭스
    const conceptMatrix = this.calculateConceptMatrix(attempts);

    // 타임라인 분석
    const timeline = this.calculateTimeline(attempts);

    // 최근 실수
    const recentMistakes = attempts
      .filter((a) => !a.isCorrect)
      .slice(0, 10)
      .map((a) => ({
        id: a.problemId,
        title: a.problem?.title || '문제',
        subject: a.problem?.subject || '기타',
        userAnswer: a.selectedAnswer || '',
        correctAnswer: a.problem?.correctAnswer || '',
        explanation: a.problem?.explanation || '',
        completedAt: a.completedAt?.toISOString() || '',
      }));

    return {
      report: {
        id: report.id,
        title: report.title,
        status: report.status,
        createdAt: report.createdAt.toISOString(),
        updatedAt: report.updatedAt.toISOString(),
      },
      kpi: {
        totalProblems,
        correctAnswers,
        wrongAnswers: totalProblems - correctAnswers,
        accuracy,
        averageTime,
      },
      subjectBreakdown,
      conceptMatrix,
      timeline,
      recentMistakes,
    };
  }

  private calculateSubjectBreakdown(attempts: any[]) {
    const subjectMap = new Map<string, { total: number; correct: number; timeSpent: number }>();

    for (const attempt of attempts) {
      const subject = attempt.problem?.subject || '기타';
      const current = subjectMap.get(subject) || { total: 0, correct: 0, timeSpent: 0 };

      current.total += 1;
      if (attempt.isCorrect) current.correct += 1;
      current.timeSpent += attempt.timeSpent || 0;

      subjectMap.set(subject, current);
    }

    return Array.from(subjectMap.entries()).map(([subject, data]) => ({
      subject,
      total: data.total,
      correct: data.correct,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      averageTime: data.total > 0 ? Math.round(data.timeSpent / data.total) : 0,
    }));
  }

  private calculateConceptMatrix(attempts: any[]) {
    // 난이도별 분석
    const difficultyMap = new Map<string, { total: number; correct: number }>();

    for (const attempt of attempts) {
      const difficulty = attempt.problem?.difficulty || 'UNKNOWN';
      const current = difficultyMap.get(difficulty) || { total: 0, correct: 0 };

      current.total += 1;
      if (attempt.isCorrect) current.correct += 1;

      difficultyMap.set(difficulty, current);
    }

    return Array.from(difficultyMap.entries()).map(([concept, data]) => ({
      concept,
      total: data.total,
      correct: data.correct,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    }));
  }

  private calculateTimeline(attempts: any[]) {
    // 날짜별 진행 상황
    const dateMap = new Map<string, { total: number; correct: number }>();

    for (const attempt of attempts) {
      if (!attempt.completedAt) continue;

      const date = attempt.completedAt.toISOString().split('T')[0];
      const current = dateMap.get(date) || { total: 0, correct: 0 };

      current.total += 1;
      if (attempt.isCorrect) current.correct += 1;

      dateMap.set(date, current);
    }

    return Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        total: data.total,
        correct: data.correct,
        accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}

export const reportsService = new ReportsService();
