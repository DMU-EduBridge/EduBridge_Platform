import { User } from '@prisma/client';
import { logger } from '../../lib/monitoring';
import { CreateUserDtoType, UpdateUserDtoType, UserListQueryDtoType } from '../dto/user';
import { UserRepository } from '../repositories/user.repository';

export class UserService {
  private userRepository = new UserRepository();

  async getUserById(id: string): Promise<User | null> {
    try {
      return await this.userRepository.findById(id);
    } catch (error) {
      logger.error('사용자 조회 실패', undefined, {
        userId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('사용자 조회에 실패했습니다.');
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findByEmail(email);
    } catch (error) {
      logger.error('이메일로 사용자 조회 실패', undefined, {
        email,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('사용자 조회에 실패했습니다.');
    }
  }

  async getUsers(
    query: UserListQueryDtoType,
  ): Promise<{ users: User[]; total: number; pagination: any }> {
    try {
      const { users, total } = await this.userRepository.findMany(query);
      const { page, limit } = query;

      const pagination = {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      };

      return { users, total, pagination };
    } catch (error) {
      logger.error('사용자 목록 조회 실패', undefined, {
        query,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('사용자 목록 조회에 실패했습니다.');
    }
  }

  async createUser(data: CreateUserDtoType): Promise<User> {
    try {
      // 이메일 중복 확인
      const existingUser = await this.userRepository.findByEmail(data.email);
      if (existingUser) {
        throw new Error('이미 존재하는 이메일입니다.');
      }

      const user = await this.userRepository.create(data);
      logger.info('사용자 생성 성공', { userId: user.id, email: user.email });
      return user;
    } catch (error) {
      logger.error('사용자 생성 실패', undefined, {
        data,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error instanceof Error ? error : new Error('사용자 생성에 실패했습니다.');
    }
  }

  async updateUser(id: string, data: UpdateUserDtoType): Promise<User> {
    try {
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      const user = await this.userRepository.update(id, data);
      logger.info('사용자 업데이트 성공', { userId: id });
      return user;
    } catch (error) {
      logger.error('사용자 업데이트 실패', undefined, {
        userId: id,
        data,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error instanceof Error ? error : new Error('사용자 업데이트에 실패했습니다.');
    }
  }

  async deleteUser(id: string): Promise<User> {
    try {
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      const user = await this.userRepository.softDelete(id);
      logger.info('사용자 삭제 성공', { userId: id });
      return user;
    } catch (error) {
      logger.error('사용자 삭제 실패', undefined, {
        userId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error instanceof Error ? error : new Error('사용자 삭제에 실패했습니다.');
    }
  }

  async getUserStats(): Promise<any> {
    try {
      return await this.userRepository.getStats();
    } catch (error) {
      logger.error('사용자 통계 조회 실패', undefined, {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('사용자 통계 조회에 실패했습니다.');
    }
  }

  async getUsersByRole(role: 'STUDENT' | 'TEACHER' | 'ADMIN'): Promise<User[]> {
    try {
      return await this.userRepository.findByRole(role);
    } catch (error) {
      logger.error('역할별 사용자 조회 실패', undefined, {
        role,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('역할별 사용자 조회에 실패했습니다.');
    }
  }

  async updateUserRole(id: string, role: 'STUDENT' | 'TEACHER' | 'ADMIN'): Promise<User> {
    try {
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      const user = await this.userRepository.updateRole(id, role);
      logger.info('사용자 역할 업데이트 성공', { userId: id, newRole: role });
      return user;
    } catch (error) {
      logger.error('사용자 역할 업데이트 실패', undefined, {
        userId: id,
        role,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error instanceof Error ? error : new Error('사용자 역할 업데이트에 실패했습니다.');
    }
  }

  async setupUserRole(
    id: string,
    role: 'STUDENT' | 'TEACHER',
    additionalData?: any,
  ): Promise<User> {
    try {
      const existingUser = await this.userRepository.findById(id);
      if (!existingUser) {
        throw new Error('사용자를 찾을 수 없습니다.');
      }

      const updateData: UpdateUserDtoType = {
        role,
        ...additionalData,
      };

      const user = await this.userRepository.update(id, updateData);
      logger.info('사용자 역할 설정 성공', { userId: id, role });
      return user;
    } catch (error) {
      logger.error('사용자 역할 설정 실패', undefined, {
        userId: id,
        role,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error instanceof Error ? error : new Error('사용자 역할 설정에 실패했습니다.');
    }
  }
}
