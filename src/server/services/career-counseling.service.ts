import { serializeArray } from '@/lib/utils/json';
import type { Prisma } from '@prisma/client';
import { careerCounselingRepository } from '../repositories/career-counseling.repository';

export class CareerCounselingService {
  async list(params: {
    studentId?: string;
    type?: string;
    status?: string;
    page: number;
    limit: number;
  }) {
    const where: Prisma.CareerCounselingWhereInput = {};
    if (params.studentId) where.studentId = params.studentId;
    if (params.type && params.type !== 'all') where.type = params.type;
    if (params.status && params.status !== 'all') where.status = params.status;

    return careerCounselingRepository.findMany(where, params.page, params.limit);
  }

  async detail(id: string) {
    const counseling = await careerCounselingRepository.findById(id);
    if (!counseling) return null;

    const careerSuggestions = counseling.careerSuggestions
      ? JSON.parse(counseling.careerSuggestions)
      : [];
    const universityRecommendations = counseling.universityRecommendations
      ? JSON.parse(counseling.universityRecommendations)
      : [];
    const skillGaps = counseling.skillGaps ? JSON.parse(counseling.skillGaps) : [];

    return {
      ...counseling,
      careerSuggestions,
      universityRecommendations,
      skillGaps,
    };
  }

  async getByStudent(studentId: string) {
    return careerCounselingRepository.getByStudent(studentId);
  }

  async getUpcoming() {
    return careerCounselingRepository.getUpcoming();
  }

  async create(input: {
    studentId: string;
    type: string;
    title: string;
    content: string;
    careerSuggestions?: string[];
    universityRecommendations?: string[];
    skillGaps?: string[];
  }) {
    const data: Prisma.CareerCounselingCreateInput = {
      student: { connect: { id: input.studentId } },
      type: input.type,
      title: input.title,
      content: input.content,
      careerSuggestions: serializeArray(input.careerSuggestions),
      universityRecommendations: serializeArray(input.universityRecommendations),
      skillGaps: serializeArray(input.skillGaps),
      status: 'COMPLETED',
    };
    return careerCounselingRepository.create(data);
  }

  async update(
    id: string,
    input: {
      title?: string;
      content?: string;
      type?: string;
      careerSuggestions?: string[];
      universityRecommendations?: string[];
      skillGaps?: string[];
      status?: string;
    },
  ) {
    const data: Prisma.CareerCounselingUpdateInput = {
      title: input.title,
      content: input.content,
      type: input.type,
      careerSuggestions: serializeArray(input.careerSuggestions),
      universityRecommendations: serializeArray(input.universityRecommendations),
      skillGaps: serializeArray(input.skillGaps),
      status: input.status,
    };
    return careerCounselingRepository.update(id, data);
  }

  async remove(id: string) {
    return careerCounselingRepository.delete(id);
  }

  async stats() {
    return careerCounselingRepository.getStats();
  }
}

import { wrapService } from '@/lib/utils/service-metrics';
export const careerCounselingService = wrapService(
  new CareerCounselingService(),
  'CareerCounselingService',
);
