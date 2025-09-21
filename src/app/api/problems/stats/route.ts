import { logger } from '@/lib/monitoring';
import { withErrorHandler } from '@/lib/utils/error-handler';
import { getRequestId } from '@/lib/utils/request-context';
import { problemService } from '@/server/services/problem.service';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function getProblemStats(request: NextRequest) {
  const stats = await problemService.getStats();

  logger.info('Problem stats fetched', {
    requestId: getRequestId(request),
    totalProblems: stats.totalProblems,
    activeProblems: stats.activeProblems,
  });

  return NextResponse.json(stats, {
    headers: {
      'Cache-Control': 'private, max-age=60',
      'X-Request-Id': getRequestId(request),
    },
  });
}

export const GET = withErrorHandler(getProblemStats);




