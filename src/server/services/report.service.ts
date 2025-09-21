import { prisma } from '@/lib/core/prisma';
import { generateAnalysisFromData, generateAnalysisSmart } from '@/lib/utils/ai-report';
import { serializeArray } from '@/lib/utils/json';
import type { Prisma } from '@prisma/client';
import { reportRepository } from '../repositories/report.repository';

export class ReportService {
  async list(params: {
    type?: string;
    status?: string;
    studentId?: string;
    page: number;
    limit: number;
  }) {
    const where: Prisma.AnalysisReportWhereInput = {};
    if (params.type && params.type !== 'all') where.type = params.type;
    if (params.status && params.status !== 'all') where.status = params.status;
    if (params.studentId) where.studentId = params.studentId;
    return reportRepository.findMany(where, params.page, params.limit);
  }

  async detail(id: string) {
    const report = await reportRepository.findById(id);
    if (!report) return null;

    const attempts = await prisma.attempt.findMany({
      where: { userId: report.studentId },
      select: { isCorrect: true },
    });
    const totalProblems = attempts.length;
    const correctCount = attempts.filter((a) => a.isCorrect).length;
    const averageScore = totalProblems > 0 ? Math.round((correctCount / totalProblems) * 100) : 0;
    const completionRate = averageScore;

    const payload = {
      id: report.id,
      title: report.title,
      type: report.type,
      period: report.period,
      status: report.status,
      students: 1,
      totalProblems,
      averageScore,
      completionRate,
      insights: report.insights ? JSON.parse(report.insights) : [],
      recommendations: report.recommendations ? JSON.parse(report.recommendations) : [],
      strengths: report.strengths ? JSON.parse(report.strengths) : [],
      weaknesses: report.weaknesses ? JSON.parse(report.weaknesses) : [],
      createdAt: report.createdAt,
      student: report.student,
    };
    return payload;
  }

  async create(input: {
    studentId: string;
    type: string;
    title: string;
    period: string;
    insights?: string[];
    recommendations?: string[];
    strengths?: string[];
    weaknesses?: string[];
  }) {
    let { insights, recommendations, strengths, weaknesses } = input;

    if (!insights && !recommendations) {
      const attempts = await prisma.attempt.findMany({
        where: { userId: input.studentId },
        include: { problem: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
      const problems = attempts.map((a) => ({
        id: a.problemId,
        subject: a.problem?.subject || undefined,
        difficulty: a.problem?.difficulty || undefined,
        isCorrect: a.isCorrect,
      }));
      const bySubject: Record<string, { attempts: number; correct: number }> = {};
      for (const p of problems) {
        const key = p.subject || '기타';
        bySubject[key] = bySubject[key] || { attempts: 0, correct: 0 };
        bySubject[key].attempts += 1;
        bySubject[key].correct += p.isCorrect ? 1 : 0;
      }
      const subjects = Object.entries(bySubject).map(([subject, v]) => ({
        subject,
        attempts: v.attempts,
        correct: v.correct,
      }));

      const gen = process.env.OPENAI_API_KEY
        ? await generateAnalysisSmart({ problems, subjects })
        : generateAnalysisFromData({ problems, subjects });
      insights = gen.insights;
      recommendations = gen.recommendations;
      strengths = gen.strengths;
      weaknesses = gen.weaknesses;
    }

    const data: Prisma.AnalysisReportCreateInput = {
      student: { connect: { id: input.studentId } },
      type: input.type,
      title: input.title,
      period: input.period,
      insights: serializeArray(insights),
      recommendations: serializeArray(recommendations),
      strengths: serializeArray(strengths),
      weaknesses: serializeArray(weaknesses),
      status: 'COMPLETED',
    };

    return reportRepository.create(data);
  }

  async update(
    id: string,
    input: {
      title?: string;
      type?: string;
      period?: string;
      insights?: string[];
      recommendations?: string[];
      strengths?: string[];
      weaknesses?: string[];
      status?: string;
    },
  ) {
    const data: Prisma.AnalysisReportUpdateInput = {
      title: input.title,
      type: input.type,
      period: input.period,
      insights: serializeArray(input.insights),
      recommendations: serializeArray(input.recommendations),
      strengths: serializeArray(input.strengths),
      weaknesses: serializeArray(input.weaknesses),
      status: input.status,
    };
    return reportRepository.update(id, data);
  }

  async remove(id: string) {
    return reportRepository.delete(id);
  }

  async getByStudent(studentId: string, page: number, limit: number) {
    return reportRepository.findByStudentId(studentId, page, limit);
  }

  async stats() {
    return reportRepository.getStats();
  }
}

import { wrapService } from '@/lib/utils/service-metrics';
export const reportService = wrapService(new ReportService(), 'ReportService');
