import { serializeArray } from '@/lib/utils/json';
import type { Prisma } from '@prisma/client';
import { userRepository } from '../repositories/user.repository';

export class UserService {
  async list(params: {
    search?: string;
    role?: string;
    status?: string;
    page: number;
    limit: number;
  }) {
    const where: Prisma.UserWhereInput = {};
    if (params.search)
      where.OR = [{ name: { contains: params.search } }, { email: { contains: params.search } }];
    if (params.role && params.role !== 'all') where.role = params.role;
    if (params.status && params.status !== 'all') where.status = params.status;

    return userRepository.findMany(where, params.page, params.limit);
  }

  async detail(id: string) {
    return userRepository.findById(id);
  }

  async findByEmail(email: string) {
    return userRepository.findByEmail(email);
  }

  async getTeachers() {
    return userRepository.getTeachers();
  }

  async getAdmins() {
    return userRepository.getAdmins();
  }

  async create(input: {
    name: string;
    email: string;
    role: string;
    grade?: string;
    school?: string;
    subject?: string;
    learningStyle?: string[];
    interests?: string[];
  }) {
    const data: Prisma.UserCreateInput = {
      name: input.name,
      email: input.email,
      role: input.role,
      grade: input.grade,
      school: input.school,
      subject: input.subject,
      status: 'ACTIVE',
      preferences:
        input.learningStyle || input.interests
          ? {
              create: {
                learningStyle: serializeArray(input.learningStyle) ?? '[]',
                interests: serializeArray(input.interests) ?? '[]',
                preferredDifficulty: 'MEDIUM',
              },
            }
          : undefined,
    };
    return userRepository.create(data);
  }

  async update(
    id: string,
    input: {
      name?: string;
      email?: string;
      role?: string;
      grade?: string;
      school?: string;
      subject?: string;
      status?: string;
      learningStyle?: string[];
      interests?: string[];
    },
  ) {
    const data: Prisma.UserUpdateInput = {
      name: input.name,
      email: input.email,
      role: input.role,
      grade: input.grade,
      school: input.school,
      subject: input.subject,
      status: input.status,
    };
    return userRepository.update(id, data);
  }

  async updateRole(id: string, role: string) {
    return userRepository.updateRole(id, role);
  }

  async remove(id: string) {
    return userRepository.delete(id);
  }

  async getStats() {
    return userRepository.getStats();
  }
}

import { wrapService } from '@/lib/utils/service-metrics';
export const userService = wrapService(new UserService(), 'UserService');
