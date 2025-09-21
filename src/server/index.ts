import { PrismaClient } from '@prisma/client';
import { ProblemRepository } from './repositories/problem.repository';
import { UserRepository } from './repositories/user.repository';
import { ProblemService } from './services/problem.service';
import { UserService } from './services/user.service';

// Prisma 클라이언트 인스턴스
export const prisma = new PrismaClient();

// Repository 인스턴스들
export const userRepository = new UserRepository(prisma);
export const problemRepository = new ProblemRepository(prisma);

// Service 인스턴스들
export const userService = new UserService(userRepository);
export const problemService = new ProblemService(problemRepository);

// 의존성 주입 컨테이너
export class DIContainer {
  private static instance: DIContainer;
  private services: Map<string, any> = new Map();

  private constructor() {
    this.registerServices();
  }

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  private registerServices(): void {
    // Repositories
    this.services.set('userRepository', userRepository);
    this.services.set('problemRepository', problemRepository);

    // Services
    this.services.set('userService', userService);
    this.services.set('problemService', problemService);
  }

  public get<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }
    return service as T;
  }
}

// 편의 함수들
export const getService = <T>(serviceName: string): T => {
  return DIContainer.getInstance().get<T>(serviceName);
};

// 기존 problemService와의 호환성을 위한 export
export { problemService as default };
