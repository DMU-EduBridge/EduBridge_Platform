import { logger, withErrorHandler } from '@/lib/utils/error-handler';
import { okJson } from '@/lib/utils/http';
import { getRequestId } from '@/lib/utils/request-context';
import { reportService } from '@/server/services/report.service';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

async function getStats(request: NextRequest) {
  const stats = await reportService.stats();
  logger.info('Report stats fetched', { requestId: getRequestId(request) });
  return okJson(stats);
}

export const GET = withErrorHandler(getStats);
