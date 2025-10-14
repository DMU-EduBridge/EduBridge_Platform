import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { problemsService } from '@/server/services/problems/problems.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 문제 통계 조회
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await problemsService.getProblemStats();
    logger.info('문제 통계 조회 성공', { userId: session.user.id });
    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    logger.error('문제 통계 조회 실패', undefined, { error: error.message });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
