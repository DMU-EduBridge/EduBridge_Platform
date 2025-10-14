import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { ok } from '@/server/http/handler';
import { learningProgressService } from '@/server/services/dashboard/learning-progress.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await learningProgressService.getLearningProgress(session.user.id);
    logger.info('학습 진도 조회 성공', { userId: session.user.id, count: data.length });
    return NextResponse.json(ok(data));
  } catch (error) {
    logger.error('학습 진도 조회 실패', error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
