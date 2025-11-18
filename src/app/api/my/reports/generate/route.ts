import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { ReportStatus, ReportType } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const DEFAULT_FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

const REPORT_API_URL =
  process.env.NEXT_PUBLIC_FASTAPI_REPORT_URL ||
  `${DEFAULT_FASTAPI_URL.replace(/\/$/, '')}/generate-report`;

const GenerateReportBodySchema = z.object({
  studyId: z.string().min(1, 'studyId is required'),
});

async function requestAiReport(userId: string) {
  const response = await fetch(REPORT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': userId,
    },
    body: JSON.stringify({
      user_id: userId,
    }),
    cache: 'no-store',
  });

  const raw = await response.text();
  if (!response.ok) {
    let detail = raw;
    try {
      const parsed = JSON.parse(raw);
      detail = parsed?.detail || parsed?.error || JSON.stringify(parsed);
    } catch {
      // ignore
    }
    throw new Error(detail || 'AI 리포트 생성 요청에 실패했습니다.');
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('AI 리포트 응답을 해석할 수 없습니다.');
  }
}

export async function POST(request: NextRequest) {
  let currentUserId: string | null = null;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'STUDENT') {
      return NextResponse.json(
        { success: false, error: '학생만 리포트를 생성할 수 있습니다.' },
        { status: 403 },
      );
    }

    currentUserId = session.user.id;

    const body = await request.json();
    const { studyId } = GenerateReportBodySchema.parse(body);

    const learningMaterial = await prisma.learningMaterial.findUnique({
      where: { id: studyId },
      select: {
        id: true,
        title: true,
        description: true,
        subject: true,
        difficulty: true,
      },
    });

    if (!learningMaterial) {
      return NextResponse.json(
        { success: false, error: '학습 자료를 찾을 수 없습니다.' },
        { status: 404 },
      );
    }

    // 동일 학습 자료에 대한 기존 리포트가 있으면 그대로 반환 (중복 생성 방지)
    const existingReport = await prisma.teacherReport.findFirst({
      where: {
        createdBy: session.user.id,
        metadata: {
          path: ['studyId'],
          equals: studyId,
        },
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            subject: true,
            gradeLevel: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (existingReport) {
      return NextResponse.json({
        success: true,
        data: { report: existingReport, alreadyExists: true },
      });
    }

    const aiReport = await requestAiReport(session.user.id);

    const report = await prisma.teacherReport.create({
      data: {
        title: `${learningMaterial.title} 학습 리포트`,
        content: aiReport.report_text || '',
        reportType: ReportType.STUDENT_INSIGHTS,
        classId: null,
        createdBy: session.user.id,
        status: ReportStatus.COMPLETED,
        analysisData: {
          aiUserId: aiReport.user_id,
          weakestUnit: aiReport.weakest_unit,
          performanceSummary: aiReport.performance_summary,
          generatedAt: aiReport.generated_at,
        },
        metadata: {
          studyId,
          studyTitle: learningMaterial.title,
          subject: learningMaterial.subject,
          difficulty: learningMaterial.difficulty,
          source: 'ai-problem-completion',
        },
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            subject: true,
            gradeLevel: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        report,
        alreadyExists: false,
      },
    });
  } catch (error) {
    console.error('마이 리포트 생성 실패:', error);
    const message =
      error instanceof Error ? error.message : '리포트 생성 중 오류가 발생했습니다.';
    const needsAttempts = /학습 로그를 찾을 수 없습니다/.test(message);

    const missingLogMessage = `해당 사용자(userId: ${
      currentUserId ?? '알 수 없음'
    })에 대한 학습 로그가 없습니다. 테스트 중이라면 시드된 학생 계정(student1@example.com)으로 로그인해 실제 문제 풀이 로그를 만든 뒤 다시 시도해주세요.`;

    return NextResponse.json(
      {
        success: false,
        error: needsAttempts ? missingLogMessage : message,
      },
      { status: needsAttempts ? 400 : 500 },
    );
  }
}
