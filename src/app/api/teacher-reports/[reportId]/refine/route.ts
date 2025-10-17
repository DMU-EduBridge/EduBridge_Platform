import { authOptions } from '@/lib/core/auth';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function POST(
  req: Request,
  context: { params: { reportId: string } },
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { reportId } = context.params;
  let scope: string | undefined;
  try {
    const body = await req.json().catch(() => ({}));
    scope = body?.scope;
  } catch {}

  // 더미 보강 결과
  const data = {
    reportId,
    scope: scope || 'recommendations',
    updated: {
      recommendations:
        scope === 'weakConcepts'
          ? undefined
          : ['개념 C 집중 훈련 세트 배정', '설명형 풀이 단계 체크리스트 제공'],
      weakConcepts:
        scope === 'recommendations' ? undefined : ['이차방정식', '확률 분포', '통계 그래프'],
    },
  };

  return NextResponse.json({ data }, { status: 200 });
}
