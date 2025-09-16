import { parseJsonBody } from '@/lib/config/validation';
import { ValidationError, logger, withErrorHandler } from '@/lib/utils/error-handler';
import { getPagination, getParam, getSearchParams, okJson } from '@/lib/utils/http';
import { getRequestId } from '@/lib/utils/request-context';
import { ReportListResponseSchema } from '@/server/dto/report';
import { reportService } from '@/server/services/report.service';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
export const dynamic = 'force-dynamic';
export const revalidate = 60; // 목록/생성 포함: 목록은 짧은 캐시

const createReportSchema = z.object({
  studentId: z.string().min(1),
  type: z.string().min(1),
  title: z.string().min(1),
  period: z.string().min(1),
  insights: z.array(z.any()).optional(),
  recommendations: z.array(z.any()).optional(),
  strengths: z.array(z.any()).optional(),
  weaknesses: z.array(z.any()).optional(),
  // LLM 입력을 위한 선택 필드
  llmSummary: z.string().optional(),
});

// 리포트 목록 조회
async function getReports(request: NextRequest) {
  const sp = getSearchParams(request);
  const type = getParam(sp, 'type');
  const status = getParam(sp, 'status');
  const studentId = getParam(sp, 'studentId');
  const { page, limit } = getPagination(sp);
  const { items, total } = await reportService.list({ type, status, studentId, page, limit });
  const reports = items.map((report) => ({
    id: report.id,
    title: report.title,
    type: report.type,
    period: report.period,
    status: report.status,
    students: 1,
    totalProblems: Math.floor(Math.random() * 20) + 10,
    averageScore: Math.floor(Math.random() * 40) + 60,
    completionRate: Math.floor(Math.random() * 30) + 70,
    insights: report.insights ? JSON.parse(report.insights) : [],
    recommendations: report.recommendations ? JSON.parse(report.recommendations) : [],
    strengths: report.strengths ? JSON.parse(report.strengths) : [],
    weaknesses: report.weaknesses ? JSON.parse(report.weaknesses) : [],
    createdAt: report.createdAt,
    student: report.student,
  }));

  const payload = {
    reports,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
  ReportListResponseSchema.parse(payload);
  logger.info('Reports fetched successfully', {
    count: reports.length,
    page,
    limit,
    requestId: getRequestId(request),
  });
  return okJson(payload, 'private, max-age=60', request);
}

// 새 리포트 생성
async function createReport(request: NextRequest) {
  const raw = await request.json();
  const parsed = parseJsonBody(raw, createReportSchema);

  if (!parsed.success) {
    throw new ValidationError('잘못된 요청 데이터입니다.');
  }

  const report = await reportService.create(parsed.data);

  logger.info('Report created successfully', { reportId: report.id });

  return NextResponse.json(report, {
    status: 201,
    headers: { 'X-Request-Id': getRequestId(request) },
  });
}

export const GET = withErrorHandler(getReports);
export const POST = withErrorHandler(createReport);
