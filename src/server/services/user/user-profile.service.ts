import { User } from '@prisma/client';
import { prisma } from '../../../lib/core/prisma';
import { logger } from '../../../lib/monitoring';
import { UserRole } from '../../../types/domain/user';

export class UserProfileService {
  /**
   * 역할별 사용자 목록 조회
   */
  async getUsersByRole(role: UserRole): Promise<User[]> {
    try {
      const users = await prisma.user.findMany({
        where: { role },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              attempts: true,
            },
          },
        },
      });

      logger.info('역할별 사용자 목록 조회 성공', { role, count: users.length });
      return users;
    } catch (error) {
      logger.error('역할별 사용자 목록 조회 실패', undefined, {
        role,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('역할별 사용자 목록 조회에 실패했습니다.');
    }
  }

  /**
   * 과목별 사용자 목록 조회
   */
  async getUsersBySubject(subject: string): Promise<User[]> {
    try {
      const users = await prisma.user.findMany({
        where: { subject },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              attempts: true,
            },
          },
        },
      });

      logger.info('과목별 사용자 목록 조회 성공', { subject, count: users.length });
      return users;
    } catch (error) {
      logger.error('과목별 사용자 목록 조회 실패', undefined, {
        subject,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('과목별 사용자 목록 조회에 실패했습니다.');
    }
  }

  /**
   * 사용자 검색
   */
  async searchUsers(query: string): Promise<User[]> {
    try {
      const users = await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { email: { contains: query } },
            { subject: { contains: query } },
            { bio: { contains: query } },
            { school: { contains: query } },
          ],
        },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              attempts: true,
            },
          },
        },
      });

      logger.info('사용자 검색 성공', { query, count: users.length });
      return users;
    } catch (error) {
      logger.error('사용자 검색 실패', undefined, {
        query,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('사용자 검색에 실패했습니다.');
    }
  }

  /**
   * 사용자 프로필 업데이트 (기본 정보만)
   */
  async updateProfile(
    id: string,
    data: {
      name?: string;
      avatar?: string;
      bio?: string;
      gradeLevel?: string;
      school?: string;
      subject?: string;
    },
  ): Promise<User> {
    try {
      const existingUser = await prisma.user.findUnique({ where: { id } });
      if (!existingUser) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      const user = await prisma.user.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.avatar !== undefined && { avatar: data.avatar }),
          ...(data.bio !== undefined && { bio: data.bio }),
          ...(data.gradeLevel !== undefined && { gradeLevel: data.gradeLevel }),
          ...(data.school !== undefined && { school: data.school }),
          ...(data.subject !== undefined && { subject: data.subject }),
        },
      });

      logger.info('사용자 프로필 업데이트 성공', { userId: id });
      return user;
    } catch (error) {
      logger.error('사용자 프로필 업데이트 실패', undefined, {
        userId: id,
        data,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('사용자 프로필 업데이트에 실패했습니다.');
    }
  }

  /**
   * 사용자 아바타 업데이트
   */
  async updateAvatar(id: string, avatarUrl: string): Promise<User> {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: { avatar: avatarUrl },
      });

      logger.info('사용자 아바타 업데이트 성공', { userId: id });
      return user;
    } catch (error) {
      logger.error('사용자 아바타 업데이트 실패', undefined, {
        userId: id,
        avatarUrl,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('사용자 아바타 업데이트에 실패했습니다.');
    }
  }

  /**
   * 사용자 상태 업데이트
   */
  async updateStatus(
    id: string,
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED',
  ): Promise<User> {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: { status },
      });

      logger.info('사용자 상태 업데이트 성공', { userId: id, status });
      return user;
    } catch (error) {
      logger.error('사용자 상태 업데이트 실패', undefined, {
        userId: id,
        status,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('사용자 상태 업데이트에 실패했습니다.');
    }
  }
}
