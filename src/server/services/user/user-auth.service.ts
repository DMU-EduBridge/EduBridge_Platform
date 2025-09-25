import { prisma } from '../../../lib/core/prisma';
import { logger } from '../../../lib/monitoring';

export class UserAuthService {
  /**
   * 사용자 마지막 로그인 시간 업데이트
   */
  async updateLastLogin(id: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id },
        data: { lastLoginAt: new Date() },
      });
      logger.info('마지막 로그인 시간 업데이트 성공', { userId: id });
    } catch (error) {
      logger.error('마지막 로그인 시간 업데이트 실패', undefined, {
        userId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('마지막 로그인 시간 업데이트에 실패했습니다.');
    }
  }

  /**
   * 비밀번호 재설정 토큰 설정
   */
  async setPasswordResetToken(email: string, token: string, expires: Date): Promise<void> {
    try {
      await prisma.user.update({
        where: { email },
        data: {
          passwordResetToken: token,
          passwordResetExpires: expires,
        },
      });
      logger.info('비밀번호 재설정 토큰 설정 성공', { email });
    } catch (error) {
      logger.error('비밀번호 재설정 토큰 설정 실패', undefined, {
        email,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('비밀번호 재설정 토큰 설정에 실패했습니다.');
    }
  }

  /**
   * 비밀번호 재설정 토큰 제거
   */
  async clearPasswordResetToken(email: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { email },
        data: {
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });
      logger.info('비밀번호 재설정 토큰 제거 성공', { email });
    } catch (error) {
      logger.error('비밀번호 재설정 토큰 제거 실패', undefined, {
        email,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('비밀번호 재설정 토큰 제거에 실패했습니다.');
    }
  }

  /**
   * 비밀번호 재설정 토큰 검증
   */
  async validatePasswordResetToken(token: string): Promise<{ valid: boolean; user?: any }> {
    try {
      const user = await prisma.user.findFirst({
        where: {
          passwordResetToken: token,
          passwordResetExpires: {
            gt: new Date(),
          },
        },
      });

      if (!user) {
        return { valid: false };
      }

      return { valid: true, user };
    } catch (error) {
      logger.error('비밀번호 재설정 토큰 검증 실패', undefined, {
        token,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('비밀번호 재설정 토큰 검증에 실패했습니다.');
    }
  }

  /**
   * 비밀번호 업데이트
   */
  async updatePassword(id: string, newPassword: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id },
        data: {
          password: newPassword, // Hashing should be done before this point
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });
      logger.info('비밀번호 업데이트 성공', { userId: id });
    } catch (error) {
      logger.error('비밀번호 업데이트 실패', undefined, {
        userId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('비밀번호 업데이트에 실패했습니다.');
    }
  }
}
