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
    const report = await prisma.report.findUnique({
      where: { id, createdBy: session.user.id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        subjects: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
    }

    // 리포트 데이터 변환 (클라이언트에서 필요한 형태로)
    const transformedReport = {
      id: report.id,
      title: report.title,
      type: report.reportType,
      period: `${report.analysisPeriod.startDate.toLocaleDateString()} - ${report.analysisPeriod.endDate.toLocaleDateString()}`,
      content: report.content,
      insights: report.insights as string[],
      recommendations: report.recommendations as string[],
      strengths: report.strengths as string[],
      weaknesses: report.weaknesses as string[],
      status: report.status,
      studentId: report.studentId,
      teacherId: report.createdBy,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      deletedAt: report.deletedAt,
      students: report.student ? 1 : 0, // 단일 학생 리포트 가정
      totalProblems: 0, // TODO: 실제 데이터로 채우기
      averageScore: 0, // TODO: 실제 데이터로 채우기
      completionRate: 0, // TODO: 실제 데이터로 채우기
    };

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

    const updatedReport = await prisma.report.update({
      where: { id, createdBy: session.user.id },
      data: {
        ...data,
        analysisPeriod: data.analysisPeriod
          ? {
              startDate: new Date(data.analysisPeriod.startDate),
              endDate: new Date(data.analysisPeriod.endDate),
            }
          : undefined,
        class:
          data.classId !== undefined
            ? { connect: data.classId ? { id: data.classId } : undefined }
            : undefined,
        students: data.studentIds
          ? { set: data.studentIds.map((sId) => ({ id: sId })) }
          : undefined,
        subjects: data.subjectIds
          ? { set: data.subjectIds.map((sId) => ({ id: sId })) }
          : undefined,
      },
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
    await prisma.report.delete({
      where: { id, createdBy: session.user.id },
    });

    logger.info('리포트 삭제 성공', { userId: session.user.id, reportId: id });
    return NextResponse.json({ success: true, data: null }, { status: 204 });
  } catch (error: any) {
    logger.error('리포트 삭제 실패', undefined, { error: error.message });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
