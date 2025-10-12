import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { logger } from '@/lib/monitoring';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const report = await prisma.report.findUnique({
      where: { id, createdBy: session.user.id },
      select: {
        title: true,
        content: true,
        reportType: true,
        analysisPeriod: true,
        createdAt: true,
        student: {
          select: {
            name: true,
          },
        },
        class: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
    }

    // 실제 파일 생성 및 다운로드 로직 (예시)
    const reportContent = `
리포트 제목: ${report.title}
리포트 유형: ${report.reportType}
분석 기간: ${report.analysisPeriod.startDate.toLocaleDateString()} - ${report.analysisPeriod.endDate.toLocaleDateString()}
생성일: ${report.createdAt.toLocaleDateString()}
학생: ${report.student?.name || 'N/A'}
클래스: ${report.class?.name || 'N/A'}

${report.content || '내용 없음'}
    `;

    const filename = `report-${report.title.replace(/\s/g, '_')}.txt`;

    logger.info('리포트 다운로드 성공', { userId: session.user.id, reportId: id });
    return new NextResponse(reportContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    logger.error('리포트 다운로드 실패', undefined, { error: error.message });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
