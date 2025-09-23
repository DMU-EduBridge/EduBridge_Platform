import { TeacherReport } from '@prisma/client';
import { logger } from '../../lib/monitoring';
import {
  CreateReportAnalysisDtoType,
  CreateTeacherReportDtoType,
  TeacherReportListQueryDtoType,
  UpdateTeacherReportDtoType,
} from '../dto/teacher-report';
import { TeacherReportRepository } from '../repositories/teacher-report.repository';

export class TeacherReportService {
  private teacherReportRepository = new TeacherReportRepository();

  async getTeacherReportById(id: string): Promise<TeacherReport | null> {
    try {
      return await this.teacherReportRepository.findById(id);
    } catch (error) {
      logger.error('교사 리포트 조회 실패', undefined, {
        reportId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('교사 리포트 조회에 실패했습니다.');
    }
  }

  async getTeacherReports(query: TeacherReportListQueryDtoType): Promise<{
    reports: TeacherReport[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const { reports, total } = await this.teacherReportRepository.findMany(query);
      const totalPages = Math.ceil(total / query.limit);

      return {
        reports,
        pagination: {
          page: query.page,
          limit: query.limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      logger.error('교사 리포트 목록 조회 실패', undefined, {
        query,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('교사 리포트 목록 조회에 실패했습니다.');
    }
  }

  async createTeacherReport(data: CreateTeacherReportDtoType, userId: string): Promise<TeacherReport> {
    try {
      return await this.teacherReportRepository.create(data, userId);
    } catch (error) {
      logger.error('교사 리포트 생성 실패', undefined, {
        data,
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('교사 리포트 생성에 실패했습니다.');
    }
  }

  async updateTeacherReport(id: string, data: UpdateTeacherReportDtoType): Promise<TeacherReport> {
    try {
      const existingReport = await this.teacherReportRepository.findById(id);
      if (!existingReport) {
        throw new Error('교사 리포트를 찾을 수 없습니다.');
      }

      return await this.teacherReportRepository.update(id, data);
    } catch (error) {
      logger.error('교사 리포트 업데이트 실패', undefined, {
        reportId: id,
        data,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async deleteTeacherReport(id: string): Promise<TeacherReport> {
    try {
      const existingReport = await this.teacherReportRepository.findById(id);
      if (!existingReport) {
        throw new Error('교사 리포트를 찾을 수 없습니다.');
      }

      return await this.teacherReportRepository.delete(id);
    } catch (error) {
      logger.error('교사 리포트 삭제 실패', undefined, {
        reportId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async getTeacherReportsByUserId(userId: string): Promise<TeacherReport[]> {
    try {
      return await this.teacherReportRepository.findByUserId(userId);
    } catch (error) {
      logger.error('사용자 교사 리포트 목록 조회 실패', undefined, {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('사용자 교사 리포트 목록 조회에 실패했습니다.');
    }
  }

  async createReportAnalysis(data: CreateReportAnalysisDtoType): Promise<any> {
    try {
      const existingReport = await this.teacherReportRepository.findById(data.reportId);
      if (!existingReport) {
        throw new Error('교사 리포트를 찾을 수 없습니다.');
      }

      return await this.teacherReportRepository.createAnalysis(data);
    } catch (error) {
      logger.error('리포트 분석 생성 실패', undefined, {
        data,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async getTeacherReportStats(): Promise<{
    totalReports: number;
    byStatus: Record<string, number>;
    byAnalysisType: Record<string, number>;
  }> {
    try {
      return await this.teacherReportRepository.getTeacherReportStats();
    } catch (error) {
      logger.error('교사 리포트 통계 조회 실패', undefined, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('교사 리포트 통계 조회에 실패했습니다.');
    }
  }
}