import { prisma } from '../../../lib/core/prisma';
import { logger } from '../../../lib/monitoring';
import {
  ClassMember,
  ClassMemberQueryParams,
  ClassMemberRole,
  ClassMemberWithDetails,
  CreateClassMemberRequest,
  PaginatedResponse,
  UpdateClassMemberRequest,
} from '../../../types/domain/class';

export class ClassMemberService {
  /**
   * 클래스 멤버 목록 조회
   */
  async getClassMembers(
    params: ClassMemberQueryParams = {},
  ): Promise<PaginatedResponse<ClassMemberWithDetails>> {
    try {
      const { page = 1, limit = 10, classId, userId, role, isActive } = params;

      const skip = (page - 1) * limit;
      const where: any = {};

      if (classId) where.classId = classId;
      if (userId) where.userId = userId;
      if (role) where.role = role;
      if (isActive !== undefined) where.isActive = isActive;

      const [members, total] = await Promise.all([
        prisma.classMember.findMany({
          where,
          skip,
          take: limit,
          include: {
            user: true,
            class: true,
          },
          orderBy: {
            joinedAt: 'desc',
          },
        }),
        prisma.classMember.count({ where }),
      ]);

      const membersWithDetails: ClassMemberWithDetails[] = members.map((member) => ({
        ...member,
        role: member.role as ClassMemberRole,
      }));

      return {
        success: true,
        data: membersWithDetails,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('클래스 멤버 목록 조회 실패', undefined, {
        params,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('클래스 멤버 목록 조회에 실패했습니다.');
    }
  }

  /**
   * 클래스 멤버 상세 조회
   */
  async getClassMemberById(id: string): Promise<ClassMemberWithDetails | null> {
    try {
      const member = await prisma.classMember.findUnique({
        where: { id },
        include: {
          user: true,
          class: true,
        },
      });

      if (!member) return null;

      return {
        ...member,
        role: member.role as ClassMemberRole,
      };
    } catch (error) {
      logger.error('클래스 멤버 조회 실패', undefined, {
        memberId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('클래스 멤버 조회에 실패했습니다.');
    }
  }

  /**
   * 클래스에 멤버 추가
   */
  async addClassMember(data: CreateClassMemberRequest): Promise<ClassMember> {
    try {
      // 중복 멤버 확인
      const existingMember = await prisma.classMember.findFirst({
        where: {
          classId: data.classId,
          userId: data.userId,
          isActive: true,
        },
      });

      if (existingMember) {
        throw new Error('이미 클래스에 등록된 사용자입니다.');
      }

      const newMember = await prisma.classMember.create({
        data: {
          classId: data.classId,
          userId: data.userId,
          role: (data.role || 'STUDENT') as ClassMemberRole,
          joinedAt: new Date(),
          isActive: true,
        },
      });

      logger.info('클래스 멤버 추가 성공', {
        memberId: newMember.id,
        classId: data.classId,
        userId: data.userId,
      });
      return {
        ...newMember,
        role: newMember.role as ClassMemberRole,
      };
    } catch (error) {
      logger.error('클래스 멤버 추가 실패', undefined, {
        data,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('클래스 멤버 추가에 실패했습니다.');
    }
  }

  /**
   * 클래스 멤버 정보 수정
   */
  async updateClassMember(id: string, data: UpdateClassMemberRequest): Promise<ClassMember> {
    try {
      const existingMember = await prisma.classMember.findUnique({ where: { id } });
      if (!existingMember) {
        throw new Error('클래스 멤버를 찾을 수 없습니다.');
      }

      const updatedMember = await prisma.classMember.update({
        where: { id },
        data: {
          ...(data.role && { role: data.role }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
      });

      logger.info('클래스 멤버 수정 성공', { memberId: id });
      return {
        ...updatedMember,
        role: updatedMember.role as ClassMemberRole,
      };
    } catch (error) {
      logger.error('클래스 멤버 수정 실패', undefined, {
        memberId: id,
        data,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('클래스 멤버 수정에 실패했습니다.');
    }
  }

  /**
   * 클래스에서 멤버 제거
   */
  async removeClassMember(id: string): Promise<ClassMember> {
    try {
      const existingMember = await prisma.classMember.findUnique({ where: { id } });
      if (!existingMember) {
        throw new Error('클래스 멤버를 찾을 수 없습니다.');
      }

      const removedMember = await prisma.classMember.update({
        where: { id },
        data: {
          isActive: false,
          leftAt: new Date(),
        },
      });

      logger.info('클래스 멤버 제거 성공', { memberId: id });
      return {
        ...removedMember,
        role: removedMember.role as ClassMemberRole,
      };
    } catch (error) {
      logger.error('클래스 멤버 제거 실패', undefined, {
        memberId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('클래스 멤버 제거에 실패했습니다.');
    }
  }
}
