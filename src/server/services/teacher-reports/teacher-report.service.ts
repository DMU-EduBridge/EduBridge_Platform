import { prisma } from '@/lib/core/prisma';
import { logger } from '@/lib/logger';
import {
  CreateTeacherReportRequest,
  ReportFilters,
  ReportGenerationOptions,
  ReportStats,
  TeacherReport,
  UpdateTeacherReportRequest,
} from '@/types/domain/teacher-report';
import { ReportStatus } from '@prisma/client';

export class TeacherReportService {
  /**
   * 교사의 리포트 목록 조회
   */
  async getTeacherReports(
    teacherId: string,
    filters: ReportFilters = {},
  ): Promise<TeacherReport[]> {
    try {
      const whereClause: any = {
        createdBy: teacherId,
      };

      if (filters.classId) {
        whereClause.classId = filters.classId;
      }
      if (filters.reportType) {
        whereClause.reportType = filters.reportType;
      }
      if (filters.status) {
        whereClause.status = filters.status;
      }
      if (filters.startDate || filters.endDate) {
        whereClause.createdAt = {};
        if (filters.startDate) whereClause.createdAt.gte = filters.startDate;
        if (filters.endDate) whereClause.createdAt.lte = filters.endDate;
      }

      const reports = await prisma.teacherReport.findMany({
        where: whereClause,
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
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return reports as TeacherReport[];
    } catch (error) {
      logger.error('Failed to get teacher reports', { teacherId, filters, error });
      throw new Error('리포트 목록을 불러오는데 실패했습니다.');
    }
  }

  /**
   * 특정 리포트 조회
   */
  async getReportById(reportId: string, teacherId: string): Promise<TeacherReport | null> {
    try {
      const report = await prisma.teacherReport.findFirst({
        where: {
          id: reportId,
          createdBy: teacherId,
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
            },
          },
          reportAnalyses: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      return report as TeacherReport | null;
    } catch (error) {
      logger.error('Failed to get report by id', { reportId, teacherId, error });
      throw new Error('리포트를 불러오는데 실패했습니다.');
    }
  }

  /**
   * 새 리포트 생성
   */
  async createReport(data: CreateTeacherReportRequest, teacherId: string): Promise<TeacherReport> {
    try {
      // 클래스 권한 확인
      if (data.classId) {
        const hasPermission = await prisma.class.findFirst({
          where: {
            id: data.classId,
            OR: [
              { createdBy: teacherId },
              {
                members: {
                  some: {
                    userId: teacherId,
                    role: 'TEACHER',
                    isActive: true,
                  },
                },
              },
            ],
            deletedAt: null,
          },
        });

        if (!hasPermission) {
          throw new Error('해당 클래스에 대한 권한이 없습니다.');
        }
      }

      const classInfo = data.classId ? await this.getClassInfo(data.classId) : null;
      const students = data.studentIds ? await this.getStudentsInfo(data.studentIds) : null;

      const report = await prisma.teacherReport.create({
        data: {
          title: data.title,
          content: '', // 초기 빈 콘텐츠
          reportType: data.reportType,
          classId: data.classId && data.classId.trim() !== '' ? data.classId : null,
          createdBy: teacherId,
          status: ReportStatus.DRAFT,
          ...(classInfo && { classInfo }),
          ...(students && { students }),
          metadata: {
            analysisPeriod: data.analysisPeriod,
            includeCharts: data.includeCharts,
            includeRecommendations: data.includeRecommendations,
            customPrompt: data.customPrompt,
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
            },
          },
        },
      });

      return report as TeacherReport;
    } catch (error) {
      logger.error('Failed to create report', { data, teacherId, error });
      throw new Error('리포트 생성에 실패했습니다.');
    }
  }

  /**
   * 리포트 수정
   */
  async updateReport(
    reportId: string,
    data: UpdateTeacherReportRequest,
    teacherId: string,
  ): Promise<TeacherReport> {
    try {
      // 권한 확인
      const existingReport = await prisma.teacherReport.findFirst({
        where: {
          id: reportId,
          createdBy: teacherId,
        },
      });

      if (!existingReport) {
        throw new Error('리포트를 수정할 권한이 없습니다.');
      }

      const report = await prisma.teacherReport.update({
        where: { id: reportId },
        data,
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
            },
          },
        },
      });

      return report as TeacherReport;
    } catch (error) {
      logger.error('Failed to update report', { reportId, data, teacherId, error });
      throw new Error('리포트 수정에 실패했습니다.');
    }
  }

  /**
   * 리포트 삭제
   */
  async deleteReport(reportId: string, teacherId: string): Promise<void> {
    try {
      // 권한 확인
      const existingReport = await prisma.teacherReport.findFirst({
        where: {
          id: reportId,
          createdBy: teacherId,
        },
      });

      if (!existingReport) {
        throw new Error('리포트를 삭제할 권한이 없습니다.');
      }

      await prisma.teacherReport.delete({
        where: { id: reportId },
      });
    } catch (error) {
      logger.error('Failed to delete report', { reportId, teacherId, error });
      throw new Error('리포트 삭제에 실패했습니다.');
    }
  }

  /**
   * 리포트 생성 (AI 기반)
   */
  async generateReport(
    reportId: string,
    options: ReportGenerationOptions,
    teacherId: string,
  ): Promise<TeacherReport> {
    try {
      // 권한 확인
      const existingReport = await prisma.teacherReport.findFirst({
        where: {
          id: reportId,
          createdBy: teacherId,
        },
        include: {
          class: {
            include: {
              members: {
                where: {
                  isActive: true,
                  role: 'STUDENT',
                },
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      if (!existingReport) {
        throw new Error('리포트를 생성할 권한이 없습니다.');
      }

      // 리포트 상태를 GENERATING으로 변경
      await prisma.teacherReport.update({
        where: { id: reportId },
        data: { status: ReportStatus.GENERATING },
      });

      try {
        // AI 리포트 생성 로직
        const generatedContent = await this.generateAIContent(existingReport, options);
        const analysisData = await this.generateAnalysisData(existingReport, options);

        // 리포트 완성
        const report = await prisma.teacherReport.update({
          where: { id: reportId },
          data: {
            content: generatedContent.content,
            analysisData: analysisData,
            status: ReportStatus.COMPLETED,
            tokenUsage: generatedContent.tokenUsage,
            generationTimeMs: generatedContent.generationTimeMs,
            modelName: generatedContent.modelName,
            costUsd: generatedContent.costUsd,
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
              },
            },
          },
        });

        return report as TeacherReport;
      } catch (generationError) {
        // 생성 실패 시 상태를 FAILED로 변경
        await prisma.teacherReport.update({
          where: { id: reportId },
          data: { status: ReportStatus.FAILED },
        });
        throw generationError;
      }
    } catch (error) {
      logger.error('Failed to generate report', { reportId, options, teacherId, error });
      throw new Error('리포트 생성에 실패했습니다.');
    }
  }

  /**
   * 리포트 통계 조회
   */
  async getReportStats(teacherId: string): Promise<ReportStats> {
    try {
      const reports = await prisma.teacherReport.findMany({
        where: {
          createdBy: teacherId,
        },
        include: {
          class: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      const totalReports = reports.length;
      const completedReports = reports.filter((r) => r.status === ReportStatus.COMPLETED).length;
      const draftReports = reports.filter((r) => r.status === ReportStatus.DRAFT).length;
      const failedReports = reports.filter((r) => r.status === ReportStatus.FAILED).length;

      const completedReportsWithTime = reports.filter((r) => r.generationTimeMs);
      const averageGenerationTime =
        completedReportsWithTime.length > 0
          ? completedReportsWithTime.reduce((sum, r) => sum + (r.generationTimeMs || 0), 0) /
            completedReportsWithTime.length
          : 0;

      const totalTokenUsage = reports.reduce((sum, r) => sum + (r.tokenUsage || 0), 0);
      const totalCost = reports.reduce((sum, r) => sum + (r.costUsd || 0), 0);

      // 리포트 타입별 통계
      const reportsByType = reports.reduce(
        (acc, report) => {
          const type = report.reportType;
          if (!acc[type]) acc[type] = 0;
          acc[type]++;
          return acc;
        },
        {} as Record<string, number>,
      );

      // 클래스별 통계
      const reportsByClass = reports
        .filter((r) => r.classId)
        .reduce(
          (acc, report) => {
            const classId = report.classId!;
            const className = report.class?.name || 'Unknown';
            if (!acc[classId]) {
              acc[classId] = { classId, className, count: 0 };
            }
            acc[classId].count++;
            return acc;
          },
          {} as Record<string, { classId: string; className: string; count: number }>,
        );

      return {
        totalReports,
        completedReports,
        draftReports,
        failedReports,
        averageGenerationTime,
        totalTokenUsage,
        totalCost,
        reportsByType: Object.entries(reportsByType).map(([type, count]) => ({ type, count })),
        reportsByClass: Object.values(reportsByClass),
      };
    } catch (error) {
      logger.error('Failed to get report stats', { teacherId, error });
      throw new Error('리포트 통계를 불러오는데 실패했습니다.');
    }
  }

  /**
   * 클래스 정보 조회
   */
  private async getClassInfo(classId: string) {
    const classInfo = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        members: {
          where: {
            isActive: true,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: {
              where: {
                isActive: true,
              },
            },
          },
        },
      },
    });

    return classInfo;
  }

  /**
   * 학생 정보 조회
   */
  private async getStudentsInfo(studentIds: string[]) {
    const students = await prisma.user.findMany({
      where: {
        id: {
          in: studentIds,
        },
        role: 'STUDENT',
      },
      select: {
        id: true,
        name: true,
        email: true,
        gradeLevel: true,
      },
    });

    return students;
  }

  /**
   * AI 콘텐츠 생성
   */
  private async generateAIContent(report: any, options: ReportGenerationOptions) {
    // TODO: 실제 AI 서비스 연동
    // 현재는 더미 데이터 반환
    const startTime = Date.now();

    // 시뮬레이션된 AI 생성
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const content = this.generateMockContent(report, options);

    return {
      content,
      tokenUsage: Math.floor(Math.random() * 1000) + 500,
      generationTimeMs: Date.now() - startTime,
      modelName: 'gpt-4',
      costUsd: Math.random() * 0.1,
    };
  }

  /**
   * 분석 데이터 생성
   */
  private async generateAnalysisData(report: any, options: ReportGenerationOptions) {
    // TODO: 실제 분석 로직 구현
    return {
      summary: '학생들의 전반적인 학습 진도가 양호합니다.',
      insights: [
        '대부분의 학생이 기본 문제를 잘 해결하고 있습니다.',
        '고난이도 문제에서 개선의 여지가 있습니다.',
        '학습 시간이 충분하지 않은 학생들이 있습니다.',
      ],
      recommendations: [
        '고난이도 문제에 대한 추가 설명이 필요합니다.',
        '학습 시간 관리에 대한 지도가 필요합니다.',
        '개별 맞춤형 학습 계획을 수립해보세요.',
      ],
      charts: options.includeCharts ? this.generateMockCharts(report) : null,
    };
  }

  /**
   * 목 콘텐츠 생성
   */
  private generateMockContent(_report: any, options: ReportGenerationOptions): string {
    const className = _report.class?.name || '클래스';
    const reportType = _report.reportType;

    let content = `# ${className} ${this.getReportTypeName(reportType)} 리포트\n\n`;

    content += `## 📊 전체 현황\n`;
    content += `- **리포트 생성일**: ${new Date().toLocaleDateString()}\n`;
    content += `- **분석 기간**: 최근 30일\n`;
    content += `- **대상 학생**: ${_report.class?.members?.length || 0}명\n\n`;

    content += `## 📈 주요 성과\n`;
    content += `1. **평균 진도율**: 75%\n`;
    content += `2. **평균 정답률**: 82%\n`;
    content += `3. **활성 학생 비율**: 90%\n\n`;

    content += `## 🎯 개선 영역\n`;
    content += `1. **고난이도 문제**: 추가 설명 및 연습 필요\n`;
    content += `2. **학습 시간**: 일부 학생들의 학습 시간 부족\n`;
    content += `3. **개별 맞춤**: 수준별 학습 계획 수립 필요\n\n`;

    if (options.includeRecommendations) {
      content += `## 💡 권장사항\n`;
      content += `1. **교수법 개선**: 시각적 자료 활용 증가\n`;
      content += `2. **피드백 강화**: 즉시 피드백 제공 시스템 구축\n`;
      content += `3. **학습 동기**: 게임화 요소 도입 고려\n\n`;
    }

    content += `## 📋 다음 단계\n`;
    content += `1. 취약 영역 보완 학습 자료 제공\n`;
    content += `2. 개별 상담을 통한 학습 계획 수립\n`;
    content += `3. 정기적인 진도 점검 및 피드백\n`;

    return content;
  }

  /**
   * 리포트 타입명 반환
   */
  private getReportTypeName(reportType: string): string {
    const typeNames = {
      PROGRESS_REPORT: '진도',
      PERFORMANCE_ANALYSIS: '성과 분석',
      CLASS_SUMMARY: '클래스 요약',
      STUDENT_INSIGHTS: '학생 인사이트',
    };
    return typeNames[reportType as keyof typeof typeNames] || '리포트';
  }

  /**
   * 목 차트 데이터 생성
   */
  private generateMockCharts(_report: any) {
    return {
      progressChart: {
        labels: ['1주차', '2주차', '3주차', '4주차'],
        data: [65, 70, 75, 80],
      },
      accuracyChart: {
        labels: ['기본', '중급', '고급'],
        data: [85, 75, 65],
      },
      timeChart: {
        labels: ['월', '화', '수', '목', '금'],
        data: [120, 150, 180, 140, 160],
      },
    };
  }
}

export const teacherReportService = new TeacherReportService();
