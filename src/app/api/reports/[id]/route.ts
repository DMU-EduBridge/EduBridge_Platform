import { logger } from '@/lib/monitoring';
import { ReportDetailResponseSchema } from '@/lib/schemas/api';
import { NotFoundError, withErrorHandler } from '@/lib/utils/error-handler';
import { okJson } from '@/lib/utils/http';
import { getRequestId } from '@/lib/utils/request-context';
import { reportService } from '@/server/services/report.service';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // 상세: 짧은 캐시 + SWR

async function getReport(_request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;

  const payload = await reportService.detail(id);
  if (!payload) throw new NotFoundError('리포트');
  ReportDetailResponseSchema.parse(payload);
  logger.info('Report detail fetched', { reportId: id, requestId: getRequestId(_request) });
  return okJson(payload, 'private, max-age=60', _request);
}

export const GET = withErrorHandler(getReport);
