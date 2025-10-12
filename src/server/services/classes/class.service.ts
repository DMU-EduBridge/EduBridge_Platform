import { prisma } from '@/lib/core/prisma';
import { logger } from '@/lib/logger';
import {
  AddMemberRequest,
  ClassWithStats,
  CreateClassRequest,
  UpdateClassRequest,
} from '@/types/domain/class';

export class ClassService {
  /**
   * 선생님의 클래스 목록 조회
   */
  async getTeacherClasses(teacherId: string): Promise<ClassWithStats[]> {
    try {
      const classes = await prisma.class.findMany({
        where: {
          createdBy: teacherId,
          deletedAt: null,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
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
        orderBy: {
          createdAt: 'desc',
        },
      });

      return classes.map((cls) => ({
        ...cls,
        memberCount: cls._count.members,
        stats: {
          totalMembers: cls._count.members,
          activeMembers: cls._count.members,
          totalAssignments: 0, // TODO: ProblemAssignment 연동 시 구현
          completedAssignments: 0,
          averageProgress: 0, // TODO: 진도 계산 로직 구현
        },
      }));
    } catch (error) {
      logger.error('Failed to get teacher classes', { teacherId, error });
      throw new Error('클래스 목록을 불러오는데 실패했습니다.');
    }
  }

  /**
   * 특정 클래스 상세 조회
   */
  async getClassById(classId: string, userId: string): Promise<ClassWithStats | null> {
    try {
      const cls = await prisma.class.findFirst({
        where: {
          id: classId,
          deletedAt: null,
          OR: [
            { createdBy: userId },
            {
              members: {
                some: {
                  userId: userId,
                  isActive: true,
                },
              },
            },
          ],
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
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
            orderBy: {
              joinedAt: 'asc',
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

      if (!cls) {
        return null;
      }

      return {
        ...cls,
        memberCount: cls._count.members,
        stats: {
          totalMembers: cls._count.members,
          activeMembers: cls._count.members,
          totalAssignments: 0, // TODO: ProblemAssignment 연동 시 구현
          completedAssignments: 0,
          averageProgress: 0, // TODO: 진도 계산 로직 구현
        },
      };
    } catch (error) {
      logger.error('Failed to get class by id', { classId, userId, error });
      throw new Error('클래스 정보를 불러오는데 실패했습니다.');
    }
  }

  /**
   * 새 클래스 생성
   */
  async createClass(data: CreateClassRequest, createdBy: string): Promise<ClassWithStats> {
    try {
      const cls = await prisma.class.create({
        data: {
          ...data,
          createdBy,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
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

      // 클래스 생성자를 TEACHER 역할로 멤버에 추가
      await prisma.classMember.create({
        data: {
          classId: cls.id,
          userId: createdBy,
          role: 'TEACHER',
        },
      });

      return {
        ...cls,
        memberCount: cls._count.members,
        stats: {
          totalMembers: 1, // 생성자 포함
          activeMembers: 1,
          totalAssignments: 0,
          completedAssignments: 0,
          averageProgress: 0,
        },
      };
    } catch (error) {
      logger.error('Failed to create class', { data, createdBy, error });
      throw new Error('클래스 생성에 실패했습니다.');
    }
  }

  /**
   * 클래스 정보 수정
   */
  async updateClass(
    classId: string,
    data: UpdateClassRequest,
    userId: string,
  ): Promise<ClassWithStats> {
    try {
      // 권한 확인: 클래스 생성자만 수정 가능
      const existingClass = await prisma.class.findFirst({
        where: {
          id: classId,
          createdBy: userId,
          deletedAt: null,
        },
      });

      if (!existingClass) {
        throw new Error('클래스를 수정할 권한이 없습니다.');
      }

      const cls = await prisma.class.update({
        where: { id: classId },
        data,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
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

      return {
        ...cls,
        memberCount: cls._count.members,
        stats: {
          totalMembers: cls._count.members,
          activeMembers: cls._count.members,
          totalAssignments: 0,
          completedAssignments: 0,
          averageProgress: 0,
        },
      };
    } catch (error) {
      logger.error('Failed to update class', { classId, data, userId, error });
      throw new Error('클래스 수정에 실패했습니다.');
    }
  }

  /**
   * 클래스 삭제 (soft delete)
   */
  async deleteClass(classId: string, userId: string): Promise<void> {
    try {
      // 권한 확인: 클래스 생성자만 삭제 가능
      const existingClass = await prisma.class.findFirst({
        where: {
          id: classId,
          createdBy: userId,
          deletedAt: null,
        },
      });

      if (!existingClass) {
        throw new Error('클래스를 삭제할 권한이 없습니다.');
      }

      await prisma.class.update({
        where: { id: classId },
        data: {
          deletedAt: new Date(),
          isActive: false,
        },
      });

      // 모든 멤버를 비활성화
      await prisma.classMember.updateMany({
        where: { classId },
        data: {
          isActive: false,
          leftAt: new Date(),
        },
      });
    } catch (error) {
      logger.error('Failed to delete class', { classId, userId, error });
      throw new Error('클래스 삭제에 실패했습니다.');
    }
  }

  /**
   * 클래스에 멤버 추가
   */
  async addMember(classId: string, data: AddMemberRequest, userId: string): Promise<void> {
    try {
      // 권한 확인: 클래스 생성자 또는 TEACHER 역할 멤버만 추가 가능
      const hasPermission = await prisma.class.findFirst({
        where: {
          id: classId,
          OR: [
            { createdBy: userId },
            {
              members: {
                some: {
                  userId: userId,
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
        throw new Error('멤버를 추가할 권한이 없습니다.');
      }

      // 이미 멤버인지 확인
      const existingMember = await prisma.classMember.findFirst({
        where: {
          classId,
          userId: data.userId,
        },
      });

      if (existingMember) {
        if (existingMember.isActive) {
          throw new Error('이미 클래스 멤버입니다.');
        } else {
          // 비활성 멤버를 다시 활성화
          await prisma.classMember.update({
            where: { id: existingMember.id },
            data: {
              isActive: true,
              leftAt: null,
            },
          });
          return;
        }
      }

      await prisma.classMember.create({
        data: {
          classId,
          userId: data.userId,
          role: data.role || 'STUDENT',
        },
      });
    } catch (error) {
      logger.error('Failed to add member', { classId, data, userId, error });
      throw new Error('멤버 추가에 실패했습니다.');
    }
  }

  /**
   * 클래스에서 멤버 제거
   */
  async removeMember(classId: string, memberUserId: string, userId: string): Promise<void> {
    try {
      // 권한 확인: 클래스 생성자 또는 TEACHER 역할 멤버만 제거 가능
      const hasPermission = await prisma.class.findFirst({
        where: {
          id: classId,
          OR: [
            { createdBy: userId },
            {
              members: {
                some: {
                  userId: userId,
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
        throw new Error('멤버를 제거할 권한이 없습니다.');
      }

      // 자기 자신은 제거할 수 없음
      if (memberUserId === userId) {
        throw new Error('자기 자신은 클래스에서 제거할 수 없습니다.');
      }

      await prisma.classMember.updateMany({
        where: {
          classId,
          userId: memberUserId,
          isActive: true,
        },
        data: {
          isActive: false,
          leftAt: new Date(),
        },
      });
    } catch (error) {
      logger.error('Failed to remove member', { classId, memberUserId, userId, error });
      throw new Error('멤버 제거에 실패했습니다.');
    }
  }

  /**
   * 클래스 멤버 목록 조회
   */
  async getClassMembers(classId: string, userId: string) {
    try {
      // 권한 확인: 클래스 멤버만 조회 가능
      const hasPermission = await prisma.class.findFirst({
        where: {
          id: classId,
          OR: [
            { createdBy: userId },
            {
              members: {
                some: {
                  userId: userId,
                  isActive: true,
                },
              },
            },
          ],
          deletedAt: null,
        },
      });

      if (!hasPermission) {
        throw new Error('멤버 목록을 조회할 권한이 없습니다.');
      }

      const members = await prisma.classMember.findMany({
        where: {
          classId,
          isActive: true,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              avatar: true,
            },
          },
        },
        orderBy: [
          { role: 'asc' }, // TEACHER, ASSISTANT, STUDENT 순
          { joinedAt: 'asc' },
        ],
      });

      return members;
    } catch (error) {
      logger.error('Failed to get class members', { classId, userId, error });
      throw new Error('멤버 목록을 불러오는데 실패했습니다.');
    }
  }
}

export const classService = new ClassService();
