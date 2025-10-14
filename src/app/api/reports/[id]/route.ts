import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { logger } from '@/lib/monitoring';
import { ReportStatus, ReportType } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const UpdateReportSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다.').optional(),
  reportType: z.nativeEnum(ReportType).optional(),
  analysisPeriod: z
    .object({
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
    })
    .optional(),
  status: z.nativeEnum(ReportStatus).optional(),
  classId: z.string().optional().nullable(),
  studentIds: z.array(z.string()).optional(),
  subjectIds: z.array(z.string()).optional(),
  content: z.string().optional().nullable(),
  insights: z.any().optional().nullable(),
  recommendations: z.any().optional().nullable(),
  metadata: z.any().optional().nullable(),
});

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const report = await prisma.teacherReport.findUnique({
      where: { id, createdBy: session.user.id },
      select: {
        id: true,
        title: true,
        content: true,
        reportType: true,
        status: true,
        metadata: true,
        tokenUsage: true,
        generationTimeMs: true,
        modelName: true,
        costUsd: true,
        createdAt: true,
        createdBy: true,
        updatedAt: true,
      },
    });

    if (!report) {
      return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
    }

    // 리포트 데이터 변환 (클라이언트에서 필요한 형태로)
    const meta = (report.metadata as any) || {};
    const startDateStr = meta?.analysisPeriod?.startDate
      ? new Date(meta.analysisPeriod.startDate).toLocaleDateString()
      : 'N/A';
    const endDateStr = meta?.analysisPeriod?.endDate
      ? new Date(meta.analysisPeriod.endDate).toLocaleDateString()
      : 'N/A';

    const transformedReport = {
      id: report.id,
      title: report.title,
      type: report.reportType,
      period: `${startDateStr} - ${endDateStr}`,
      content: report.content,
      status: report.status,
      teacherId: report.createdBy,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      tokenUsage: report.tokenUsage,
      generationTimeMs: report.generationTimeMs,
      modelName: report.modelName,
      costUsd: report.costUsd,
    } as const;

    logger.info('리포트 상세 조회 성공', { userId: session.user.id, reportId: id });
    return NextResponse.json({ success: true, data: transformedReport });
  } catch (error: any) {
    logger.error('리포트 상세 조회 실패', undefined, { error: error.message });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const data = UpdateReportSchema.parse(body);

    const updateData: any = {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.reportType !== undefined ? { reportType: data.reportType } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
      ...(data.content !== undefined ? { content: data.content ?? '' } : {}),
      ...(data.analysisPeriod || data.metadata
        ? {
            metadata: {
              ...(data.metadata as any),
              ...(data.analysisPeriod
                ? {
                    analysisPeriod: {
                      startDate: new Date(data.analysisPeriod.startDate),
                      endDate: new Date(data.analysisPeriod.endDate),
                    },
                  }
                : {}),
            },
          }
        : {}),
    };

    const updatedReport = await prisma.teacherReport.update({
      where: { id, createdBy: session.user.id },
      data: updateData,
    });

    logger.info('리포트 업데이트 성공', { userId: session.user.id, reportId: id });
    return NextResponse.json({ success: true, data: updatedReport });
  } catch (error: any) {
    logger.error('리포트 업데이트 실패', undefined, { error: error.message });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    await prisma.teacherReport.delete({
      where: { id, createdBy: session.user.id },
    });

    logger.info('리포트 삭제 성공', { userId: session.user.id, reportId: id });
    return NextResponse.json({ success: true, data: null }, { status: 204 });
  } catch (error: any) {
    logger.error('리포트 삭제 실패', undefined, { error: error.message });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
