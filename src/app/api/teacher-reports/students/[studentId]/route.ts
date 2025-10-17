import { authOptions } from '@/lib/core/auth';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET(
  _req: Request,
  context: { params: { studentId: string } },
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { studentId } = context.params;

  // Phase 1: 더미 데이터 구성
  const data = {
    studentId,
    summaryInsights: [
      '취약 개념은 이차방정식과 확률 분포입니다.',
      '학습 시간이 지난주 대비 20% 감소했습니다.',
      '중간 난이도 문항에서 정답률이 낮습니다.',
    ],
    metrics: {
      byWeek: [
        { week: 'W-3', score: 72 },
        { week: 'W-2', score: 69 },
        { week: 'W-1', score: 63 },
        { week: 'W', score: 61 },
      ],
      byDifficulty: [
        { level: 'EASY', accuracy: 84 },
        { level: 'MEDIUM', accuracy: 62 },
        { level: 'HARD', accuracy: 38 },
      ],
      byType: [
        { type: 'MULTIPLE_CHOICE', accuracy: 66 },
        { type: 'SHORT_ANSWER', accuracy: 54 },
      ],
    },
    weakConcepts: ['이차방정식', '확률 분포'],
    topItems: [
      { id: 'q1', title: '이차방정식 기초' },
      { id: 'q2', title: '확률 분포 평균/분산' },
    ],
    recommendations: [
      '보충 문제 세트 A를 배정하세요.',
      '학습 영상 B를 시청하도록 안내하세요.',
      '주 2회 짧은 퀴즈로 중간 난이도 적응 훈련 추천.',
    ],
    citations: [
      { id: 'doc1', title: '교사용 가이드: 이차방정식' },
      { id: 'doc2', title: '수학 학습 전략 핸드북' },
    ],
  };

  return NextResponse.json({ data }, { status: 200 });
}
