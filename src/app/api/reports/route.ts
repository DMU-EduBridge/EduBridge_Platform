import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/core/prisma';
import { z } from 'zod';
import { parseJsonBody } from '@/lib/config/validation';
import { Prisma } from '@prisma/client';
import { withErrorHandler, ValidationError, logger } from '@/lib/utils/error-handler';

const createReportSchema = z.object({
  studentId: z.string().min(1),
  type: z.string().min(1),
  title: z.string().min(1),
  period: z.string().min(1),
  insights: z.array(z.any()).optional(),
  recommendations: z.array(z.any()).optional(),
  strengths: z.array(z.any()).optional(),
  weaknesses: z.array(z.any()).optional(),
});

// 리포트 목록 조회
async function getReports(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const status = searchParams.get('status');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  const where: Prisma.AnalysisReportWhereInput = {};

  if (type && type !== 'all') {
    where.type = type;
  }

  if (status && status !== 'all') {
    where.status = status;
  }

  const [rawReports, total] = await Promise.all([
    prisma.analysisReport.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        student: true,
      },
    }),
    prisma.analysisReport.count({ where }),
  ]);

  // 프론트엔드가 기대하는 형태로 데이터 변환
  const reports = rawReports.map((report) => {
    // JSON 문자열을 파싱
    const insights = report.insights ? JSON.parse(report.insights) : [];
    const recommendations = report.recommendations ? JSON.parse(report.recommendations) : [];
    const strengths = report.strengths ? JSON.parse(report.strengths) : [];
    const weaknesses = report.weaknesses ? JSON.parse(report.weaknesses) : [];

    // 임시 계산된 통계 데이터 (실제로는 리포트 생성 시 계산되어야 함)
    const students = 1; // 개별 리포트이므로 1명
    const totalProblems = Math.floor(Math.random() * 20) + 10; // 10-30 문제
    const averageScore = Math.floor(Math.random() * 40) + 60; // 60-100점
    const completionRate = Math.floor(Math.random() * 30) + 70; // 70-100%

    return {
      id: report.id,
      title: report.title,
      type: report.type,
      period: report.period,
      status: report.status,
      students: students,
      totalProblems: totalProblems,
      averageScore: averageScore,
      completionRate: completionRate,
      insights: insights,
      recommendations: recommendations,
      strengths: strengths,
      weaknesses: weaknesses,
      createdAt: report.createdAt,
      student: report.student,
    };
  });

  logger.info('Reports fetched successfully', { count: reports.length, page, limit });

  return NextResponse.json({
    reports,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

// 새 리포트 생성
async function createReport(request: NextRequest) {
  const raw = await request.json();
  const parsed = parseJsonBody(raw, createReportSchema);

  if (!parsed.success) {
    throw new ValidationError('잘못된 요청 데이터입니다.');
  }

  const { studentId, type, title, period, insights, recommendations, strengths, weaknesses } =
    parsed.data;

  const report = await prisma.analysisReport.create({
    data: {
      studentId,
      type,
      title,
      period,
      insights: JSON.stringify(insights || []),
      recommendations: JSON.stringify(recommendations || []),
      strengths: JSON.stringify(strengths || []),
      weaknesses: JSON.stringify(weaknesses || []),
      status: 'COMPLETED',
    },
    include: {
      student: true,
    },
  });

  logger.info('Report created successfully', { reportId: report.id });

  return NextResponse.json(report, { status: 201 });
}

export const GET = withErrorHandler(getReports);
export const POST = withErrorHandler(createReport);
