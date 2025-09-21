import { logger } from '@/lib/monitoring';
import { problemService } from '@/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function getProblemStats() {
  const stats = await problemService.getProblemStats();

  logger.info('Problem stats fetched', {
    totalProblems: stats.totalProblems,
    activeProblems: stats.activeProblems,
  });

  return NextResponse.json(stats, {
    headers: {
      'Cache-Control': 'private, max-age=60',
    },
  });
}

export const GET = getProblemStats;
