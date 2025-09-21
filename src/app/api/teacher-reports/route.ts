import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Teacher Report 생성 요청 스키마
const TeacherReportSchema = z.object({
  title: z.string().min(1, '리포트 제목을 입력해주세요'),
  reportType: z.enum(['full', 'summary']).default('full'),
  classInfo: z.object({
    grade: z.number().optional(),
    classNum: z.number().optional(),
    subject: z.string().optional(),
    semester: z.string().optional(),
    year: z.number().optional(),
    teacher: z.string().optional(),
    totalStudents: z.number().optional(),
  }),
  students: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      math: z.number().optional(),
      korean: z.number().optional(),
      english: z.number().optional(),
      science: z.number().optional(),
      social: z.number().optional(),
      assignmentRate: z.number().optional(),
      attendanceRate: z.number().optional(),
    }),
  ),
  subjects: z.array(z.string()).optional(),
  includeVisualization: z.boolean().default(false),
  includeExcel: z.boolean().default(false),
});

// Teacher Report 목록 조회 스키마
const TeacherReportListSchema = z.object({
  status: z.string().optional(),
  reportType: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

/**
 * Teacher Report 생성 API
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // 선생님 또는 관리자만 리포트 생성 가능
    if (!session?.user?.role || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = TeacherReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const { title, reportType, classInfo, students, subjects, includeVisualization, includeExcel } =
      parsed.data;

    const startTime = Date.now();

    // Teacher Report AI 서버에 요청 (시뮬레이션)
    // 실제로는 Teacher Report AI 서버에 HTTP 요청을 보내야 함
    const teacherReportResponse = await generateTeacherReport({
      students,
      classInfo,
      subjects: subjects || ['math', 'korean', 'english', 'science', 'social'],
      reportType,
      includeVisualization,
      includeExcel,
    });

    const generationTime = Date.now() - startTime;

    // Teacher Report 저장
    const teacherReport = await prisma.teacherReport.create({
      data: {
        title,
        content: teacherReportResponse.report,
        reportType,
        classInfo: JSON.stringify(classInfo),
        students: JSON.stringify(students),
        analysisData: JSON.stringify(teacherReportResponse.analysisData),
        metadata: JSON.stringify(teacherReportResponse.metadata),
        tokenUsage: teacherReportResponse.tokenUsage,
        generationTimeMs: generationTime,
        modelName: teacherReportResponse.metadata?.modelUsed || 'gpt-4',
        costUsd: teacherReportResponse.metadata?.totalCost || 0,
        status: 'draft',
        createdBy: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // 학생 데이터 저장
    for (const student of students) {
      await prisma.studentData.create({
        data: {
          studentId: student.id,
          name: student.name,
          math: student.math,
          korean: student.korean,
          english: student.english,
          science: student.science,
          social: student.social,
          assignmentRate: student.assignmentRate,
          attendanceRate: student.attendanceRate,
          reportId: teacherReport.id,
        },
      });
    }

    // 학급 정보 저장
    await prisma.classInfo.create({
      data: {
        grade: classInfo.grade,
        classNum: classInfo.classNum,
        subject: classInfo.subject,
        semester: classInfo.semester,
        year: classInfo.year,
        teacher: classInfo.teacher,
        totalStudents: classInfo.totalStudents,
        reportId: teacherReport.id,
      },
    });

    // 분석 데이터 저장
    if (teacherReportResponse.analysisData) {
      const analysisTypes = [
        'basic_statistics',
        'achievement_distribution',
        'struggling_students',
        'subject_weaknesses',
        'assignment_analysis',
      ];

      for (const analysisType of analysisTypes) {
        if (teacherReportResponse.analysisData[analysisType]) {
          await prisma.reportAnalysis.create({
            data: {
              reportId: teacherReport.id,
              analysisType,
              analysisData: JSON.stringify(teacherReportResponse.analysisData[analysisType]),
            },
          });
        }
      }
    }

    // API 사용량 기록
    await prisma.aIApiUsage.create({
      data: {
        userId: session.user.id,
        apiType: 'teacher_report_generation',
        modelName: 'gpt-4',
        tokensUsed: teacherReportResponse.tokenUsage || 0,
        costUsd: teacherReportResponse.metadata?.totalCost || 0,
        requestCount: 1,
        responseTimeMs: generationTime,
        success: true,
      },
    });

    // 성능 지표 기록
    await prisma.aIPerformanceMetric.create({
      data: {
        operationType: 'teacher_report_generation',
        durationMs: generationTime,
        success: true,
        metadata: JSON.stringify({
          reportType,
          studentsCount: students.length,
          subjectsCount: subjects?.length || 0,
          includeVisualization,
          includeExcel,
        }),
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Teacher Report가 성공적으로 생성되었습니다.',
      report: teacherReport,
      metadata: teacherReportResponse.metadata,
    });
  } catch (error) {
    console.error('Teacher Report 생성 오류:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Teacher Report 생성 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}

/**
 * Teacher Report 목록 조회 API
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = {
      status: searchParams.get('status') || undefined,
      reportType: searchParams.get('reportType') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    };

    const parsed = TeacherReportListSchema.safeParse(query);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const { status, reportType, page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    // 필터 조건 구성
    const where: any = {};

    // 관리자가 아닌 경우 자신이 생성한 리포트만 조회
    if (session.user.role !== 'ADMIN') {
      where.createdBy = session.user.id;
    }

    if (status) where.status = status;
    if (reportType) where.reportType = reportType;

    // Teacher Report 목록 조회
    const [reports, total] = await Promise.all([
      prisma.teacherReport.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              studentData: true,
              reportAnalyses: true,
            },
          },
        },
      }),
      prisma.teacherReport.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Teacher Report 목록 조회 오류:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Teacher Report 목록 조회 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}

/**
 * Teacher Report AI 서버 시뮬레이션 함수
 */
async function generateTeacherReport(params: {
  students: any[];
  classInfo: any;
  subjects: string[];
  reportType: string;
  includeVisualization: boolean;
  includeExcel: boolean;
}) {
  // 실제로는 Teacher Report AI 서버에 HTTP 요청을 보내야 함
  // 여기서는 시뮬레이션 데이터를 반환

  const { students, classInfo, subjects, reportType } = params;

  // 기본 통계 계산
  const basicStatistics: any = {};
  const achievementDistribution: any = {};
  const strugglingStudents: any = {};

  for (const subject of subjects) {
    const scores = students.map((s) => s[subject]).filter((s) => s !== undefined);
    if (scores.length > 0) {
      const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
      const sortedScores = scores.sort((a, b) => a - b);
      const median = sortedScores[Math.floor(sortedScores.length / 2)];
      const std = Math.sqrt(
        scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length,
      );

      basicStatistics[subject] = {
        mean: parseFloat(mean.toFixed(1)),
        median: parseFloat(median.toFixed(1)),
        std: parseFloat(std.toFixed(1)),
        min: Math.min(...scores),
        max: Math.max(...scores),
        count: scores.length,
      };

      // 성취도 분포
      const high = scores.filter((s) => s >= 90).length;
      const medium = scores.filter((s) => s >= 70 && s < 90).length;
      const low = scores.filter((s) => s < 70).length;

      achievementDistribution[subject] = { high, medium, low, total: scores.length };

      // 부진 학생 식별 (평균 대비 1.5 표준편차 이하)
      const threshold = mean - 1.5 * std;
      strugglingStudents[subject] = students
        .filter((s) => s[subject] !== undefined && s[subject] < threshold)
        .map((s) => ({
          name: s.name,
          score: s[subject],
          gap: parseFloat((mean - s[subject]).toFixed(1)),
        }));
    }
  }

  // 과제 제출률 분석
  const assignmentRates = students.map((s) => s.assignmentRate).filter((r) => r !== undefined);
  const avgAssignmentRate =
    assignmentRates.length > 0
      ? assignmentRates.reduce((a, b) => a + b, 0) / assignmentRates.length
      : 0;

  const lateStudents = students
    .filter((s) => s.assignmentRate !== undefined && s.assignmentRate < 80)
    .map((s) => ({ name: s.name, rate: s.assignmentRate }));

  const assignmentAnalysis = {
    averageRate: parseFloat(avgAssignmentRate.toFixed(1)),
    totalStudents: students.length,
    lateSubmissionCount: lateStudents.length,
    lateStudents,
  };

  // AI 리포트 생성 (시뮬레이션)
  const reportContent = generateReportContent({
    classInfo,
    basicStatistics,
    achievementDistribution,
    strugglingStudents,
    assignmentAnalysis,
    reportType,
  });

  return {
    report: reportContent,
    analysisData: {
      basicStatistics,
      achievementDistribution,
      strugglingStudents,
      assignmentAnalysis,
      totalStudents: students.length,
    },
    metadata: {
      generatedAt: new Date().toISOString(),
      reportDate: new Date().toLocaleDateString('ko-KR'),
      classInfo: `${classInfo.grade}학년 ${classInfo.classNum}반`,
      totalStudents: students.length,
      subjectsAnalyzed: subjects,
      reportType,
      modelUsed: 'gpt-4',
      generationTimeSeconds: 15.2,
      totalCost: 0.05,
    },
    tokenUsage: 1250,
  };
}

/**
 * 리포트 내용 생성 (시뮬레이션)
 */
function generateReportContent(data: any) {
  const {
    classInfo,
    basicStatistics,
    achievementDistribution,
    strugglingStudents,
    assignmentAnalysis,
    reportType,
  } = data;

  let content = `=== 학급 학습 현황 리포트 ===\n`;
  content += `작성일: ${new Date().toLocaleDateString('ko-KR')}\n`;
  content += `대상: ${classInfo.grade}학년 ${classInfo.classNum}반 (${classInfo.subject || '전체과목'})\n\n`;

  if (reportType === 'full') {
    content += `【전체 현황】\n`;
    content += `이번 학급의 전체적인 학습 수준은 양호한 편입니다. `;

    const subjects = Object.keys(basicStatistics);
    if (subjects.length > 0) {
      const avgScores = subjects.map((subject) => basicStatistics[subject].mean);
      const overallAvg = avgScores.reduce((a, b) => a + b, 0) / avgScores.length;
      content += `전체 평균 점수는 ${overallAvg.toFixed(1)}점으로 `;

      if (overallAvg >= 80) {
        content += `우수한 수준입니다.`;
      } else if (overallAvg >= 70) {
        content += `양호한 수준입니다.`;
      } else {
        content += `개선이 필요한 수준입니다.`;
      }
    }

    content += `\n\n【주의 대상 학생】\n`;
    const allStrugglingStudents = Object.values(strugglingStudents).flat();
    if (allStrugglingStudents.length > 0) {
      content += `학습 부진 학생 ${allStrugglingStudents.length}명이 식별되었습니다. `;
      content += `이들 학생에게는 개별 지도와 보충 수업이 필요합니다.\n`;
    } else {
      content += `현재 특별한 주의가 필요한 학생은 없습니다.\n`;
    }

    content += `\n【과목별 분석】\n`;
    for (const subject of subjects) {
      const stats = basicStatistics[subject];
      const distribution = achievementDistribution[subject];
      content += `${subject}: 평균 ${stats.mean}점, 상위권 ${distribution.high}명, 중위권 ${distribution.medium}명, 하위권 ${distribution.low}명\n`;
    }

    content += `\n【종합 의견】\n`;
    content += `과제 제출률은 ${assignmentAnalysis.averageRate}%로 `;
    if (assignmentAnalysis.averageRate >= 90) {
      content += `매우 양호합니다.`;
    } else if (assignmentAnalysis.averageRate >= 80) {
      content += `양호합니다.`;
    } else {
      content += `개선이 필요합니다.`;
    }

    if (assignmentAnalysis.lateSubmissionCount > 0) {
      content += ` 지각 제출 학생 ${assignmentAnalysis.lateSubmissionCount}명에게는 시간 관리 지도가 필요합니다.`;
    }
  } else {
    content += `【학급 현황】\n`;
    content += `총 ${data.totalStudents}명의 학생이 있으며, 전체적인 학습 수준은 양호합니다.\n\n`;

    content += `【주요 관심사항】\n`;
    const allStrugglingStudents = Object.values(strugglingStudents).flat();
    if (allStrugglingStudents.length > 0) {
      content += `학습 부진 학생 ${allStrugglingStudents.length}명의 개별 지도가 필요합니다.\n`;
    }

    if (assignmentAnalysis.lateSubmissionCount > 0) {
      content += `과제 지각 제출 학생 ${assignmentAnalysis.lateSubmissionCount}명의 관리가 필요합니다.\n`;
    }

    content += `\n【권장 조치사항】\n`;
    content += `1. 부진 학생 대상 보충 수업 실시\n`;
    content += `2. 과제 관리 체크리스트 제공\n`;
    content += `3. 정기적인 학습 상담 실시\n`;
  }

  return content;
}
