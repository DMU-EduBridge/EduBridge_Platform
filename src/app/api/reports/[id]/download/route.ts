import { prisma } from '@/lib/core/prisma';
import { NotFoundError, withErrorHandler } from '@/lib/utils/error-handler';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function downloadReport(_request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  const report = await prisma.analysisReport.findUnique({ where: { id } });
  if (!report) throw new NotFoundError('리포트');

  // 간단한 텍스트 기반 PDF 스텁 (실제 PDF 생성기는 추후 연동)
  const content = `Report: ${report.title}\nType: ${report.type}\nPeriod: ${report.period}\nStatus: ${report.status}`;
  const blob = new Blob([content], { type: 'application/pdf' });
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="report-${id}.pdf"`,
      'Cache-Control': 'private, max-age=60',
    },
  });
}

export const GET = withErrorHandler(downloadReport);
