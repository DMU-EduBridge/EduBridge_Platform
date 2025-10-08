import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { logger } from '@/lib/monitoring';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

interface LearningProgress {
  id: string;
  subject: string;
  grade: string;
  gradeColor: 'green' | 'red';
  currentUnit: string;
  progress: number;
  totalProblems: number;
  completedProblems: number;
  lastStudiedAt: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // 사용자의 진행 기록이 있는 학습(studyId) 목록
    const userStudyIds = await prisma.problemProgress.findMany({
      where: { userId: session.user.id },
      select: { studyId: true },
      distinct: ['studyId'],
    });

    const studyIds = userStudyIds.map((s) => s.studyId).filter(Boolean);

    // 각 학습별 총 문제 수
    const problemsByStudy = await prisma.learningMaterialProblem.findMany({
      where: { learningMaterialId: { in: studyIds } },
      select: { learningMaterialId: true, problemId: true },
    });

    const totalByStudy = new Map<string, number>();
    for (const row of problemsByStudy) {
      totalByStudy.set(row.learningMaterialId, (totalByStudy.get(row.learningMaterialId) || 0) + 1);
    }

    // 최신 시도 번호 기준 완료 문제 수 계산
    const progresses = await prisma.problemProgress.findMany({
      where: { userId: session.user.id, studyId: { in: studyIds } },
      orderBy: [{ attemptNumber: 'desc' }, { completedAt: 'desc' }],
      select: { studyId: true, problemId: true, attemptNumber: true, completedAt: true },
    });

    const latestAttemptByStudy = new Map<string, number>();
    for (const p of progresses) {
      const a = latestAttemptByStudy.get(p.studyId);
      if (typeof a !== 'number' || p.attemptNumber > a)
        latestAttemptByStudy.set(p.studyId, p.attemptNumber);
    }

    const completedByStudy = new Map<string, Set<string>>();
    for (const p of progresses) {
      if (p.attemptNumber !== latestAttemptByStudy.get(p.studyId)) continue;
      if (!completedByStudy.has(p.studyId)) completedByStudy.set(p.studyId, new Set());
      completedByStudy.get(p.studyId)!.add(p.problemId);
    }

    // 학습자료 메타(과목/학년 등)
    const materials = await prisma.learningMaterial.findMany({
      where: { id: { in: studyIds } },
      select: { id: true, title: true, subject: true, difficulty: true, updatedAt: true },
    });

    const data: LearningProgress[] = materials.map((m) => {
      const total = totalByStudy.get(m.id) || 0;
      const completed = completedByStudy.get(m.id)?.size || 0;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        id: m.id,
        subject: m.subject || m.title,
        grade:
          m.difficulty === 'EASY'
            ? '쉬움'
            : m.difficulty === 'MEDIUM'
              ? '보통'
              : m.difficulty === 'HARD'
                ? '어려움'
                : '',
        gradeColor: progress >= 50 ? 'green' : 'red',
        currentUnit: m.title,
        progress,
        totalProblems: total,
        completedProblems: completed,
        lastStudiedAt: (
          materials.find((x) => x.id === m.id)?.updatedAt || new Date()
        ).toISOString(),
      };
    });

    logger.info('학습 진도 조회 성공', { userId: session.user.id, count: data.length });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    logger.error('학습 진도 조회 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '학습 진도 조회에 실패했습니다.' }, { status: 500 });
  }
}
