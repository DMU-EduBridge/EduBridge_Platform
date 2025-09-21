import type { Prisma } from '@prisma/client';
import { teacherReportRepository } from '../repositories/teacher-report.repository';

export class TeacherReportService {
  async list(params: {
    teacherId?: string;
    reportType?: string;
    status?: string;
    page: number;
    limit: number;
  }) {
    const where: Prisma.TeacherReportWhereInput = {};
    if (params.teacherId) where.teacherId = params.teacherId;
    if (params.reportType && params.reportType !== 'all') where.reportType = params.reportType;
    if (params.status && params.status !== 'all') where.status = params.status;

    return teacherReportRepository.findMany(where, params.page, params.limit);
  }

  async detail(id: string) {
    const report = await teacherReportRepository.findById(id);
    if (!report) return null;

    const classInfo = report.classInfo ? JSON.parse(report.classInfo) : {};
    const analysis = report.analysis ? JSON.parse(report.analysis) : {};

    return {
      ...report,
      classInfo,
      analysis,
    };
  }

  async getByTeacher(teacherId: string) {
    return teacherReportRepository.getByTeacher(teacherId);
  }

  async create(input: {
    teacherId: string;
    title: string;
    content: string;
    reportType: string;
    classInfo: any;
    studentCount: number;
    analysis?: any;
  }) {
    const data: Prisma.TeacherReportCreateInput = {
      teacher: { connect: { id: input.teacherId } },
      title: input.title,
      content: input.content,
      reportType: input.reportType,
      classInfo: JSON.stringify(input.classInfo),
      studentCount: input.studentCount,
      analysis: input.analysis ? JSON.stringify(input.analysis) : null,
      status: 'COMPLETED',
    };
    return teacherReportRepository.create(data);
  }

  async update(
    id: string,
    input: {
      title?: string;
      content?: string;
      reportType?: string;
      classInfo?: any;
      studentCount?: number;
      analysis?: any;
      status?: string;
    },
  ) {
    const data: Prisma.TeacherReportUpdateInput = {
      title: input.title,
      content: input.content,
      reportType: input.reportType,
      classInfo: input.classInfo ? JSON.stringify(input.classInfo) : undefined,
      studentCount: input.studentCount,
      analysis: input.analysis ? JSON.stringify(input.analysis) : undefined,
      status: input.status,
    };
    return teacherReportRepository.update(id, data);
  }

  async remove(id: string) {
    return teacherReportRepository.delete(id);
  }

  async stats() {
    return teacherReportRepository.getStats();
  }
}

import { wrapService } from '@/lib/utils/service-metrics';
export const teacherReportService = wrapService(new TeacherReportService(), 'TeacherReportService');
