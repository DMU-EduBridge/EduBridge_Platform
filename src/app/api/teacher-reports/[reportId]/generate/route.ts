import { ApiError, ApiSuccess } from '@/lib/api-response';
import { authOptions } from '@/lib/core/auth';
import { teacherReportService } from '@/server/services/teacher-reports/teacher-report.service';
import { ReportGenerationOptions } from '@/types/domain/teacher-report';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { z } from 'zod';

const generateReportSchema = z.object({
  includeCharts: z.boolean().optional().default(true),
  includeRecommendations: z.boolean().optional().default(true),
  analysisDepth: z.enum(['BASIC', 'DETAILED', 'COMPREHENSIVE']).optional().default('DETAILED'),
  focusAreas: z.array(z.string()).optional().default([]),
  customPrompt: z.string().optional(),
});

export async function POST(request: NextRequest, { params }: { params: { reportId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiError.unauthorized();
    }

    if (!['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return ApiError.forbidden('교사 또는 관리자만 리포트를 생성할 수 있습니다');
    }

    const { reportId } = params;
    const body = await request.json();
    const validatedData = generateReportSchema.parse(body) as ReportGenerationOptions;

    const report = await teacherReportService.generateReport(
      reportId,
      validatedData,
      session.user.id,
    );
    return ApiSuccess.ok(report);
  } catch (error) {
    console.error('POST /api/teacher-reports/[reportId]/generate error:', error);
    return ApiError.internalError();
  }
}
