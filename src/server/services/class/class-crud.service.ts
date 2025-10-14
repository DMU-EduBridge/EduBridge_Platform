import { prisma } from '../../../lib/core/prisma';
import { logger } from '../../../lib/monitoring';
import {
  getOptimizedInclude,
  measureQueryTime,
  optimizePagination,
  optimizeWhereClause,
} from '../../../lib/performance/query-optimizer';
import { Class, ClassWithStats } from '../../../types/domain/class';

type ClassQueryParams = {
  page?: number;
  limit?: number;
  subject?: string;
  gradeLevel?: string;
  schoolYear?: string;
  semester?: string;
  isActive?: boolean;
  createdBy?: string;
};

type CreateClassRequest = {
  name: string;
  description?: string;
  subject: string;
  gradeLevel: string;
  schoolYear: string;
  semester: string;
  isActive?: boolean;
};

type UpdateClassRequest = {
  name?: string;
  description?: string;
  subject?: string;
  gradeLevel?: string;
  schoolYear?: string;
  semester?: string;
  isActive?: boolean;
};

export class ClassCrudService {
  /**
   * 클래스 목록 조회 (페이지네이션)
   */
  async getClasses(params: ClassQueryParams = {}): Promise<{
    success: true;
    data: ClassWithStats[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        subject,
        gradeLevel,
        schoolYear,
        semester,
        isActive,
        createdBy,
      } = params;

      // 페이지네이션 최적화
      const { limit: optimizedLimit, skip } = optimizePagination({
        page,
        limit,
        maxLimit: 50, // 최대 50개로 제한
      });

      // WHERE 조건 최적화
      const where = optimizeWhereClause({
        subject,
        gradeLevel,
        schoolYear,
        semester,
        isActive,
        createdBy,
        deletedAt: null,
      });

      // 관계 데이터 로딩 최적화 (필요한 것만)
      const include = getOptimizedInclude({
        includeCreator: true,
        includeAssignments: true,
        includeStats: true,
        assignmentLimit: 5, // 과제는 최대 5개만
      });

      const [classes, total] = await measureQueryTime('getClasses', () =>
        Promise.all([
          prisma.class.findMany({
            where,
            skip,
            take: optimizedLimit,
            include,
            orderBy: {
              createdAt: 'desc',
            },
          }),
          prisma.class.count({ where }),
        ]),
      );

      const classesWithDetails: ClassWithStats[] = classes.map((cls: any) => ({
        ...cls,
        description: cls.description ?? '',
        memberCount: cls._count?.members || cls.members?.length || 0,
        assignmentCount: cls._count?.assignments || cls.assignments?.length || 0,
        members:
          cls.members?.map((member: any) => ({
            ...member,
            role: member.role as any, // Type assertion for now
          })) || [],
      }));

      return {
        success: true,
        data: classesWithDetails,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('클래스 목록 조회 실패', undefined, {
        params,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('클래스 목록 조회에 실패했습니다.');
    }
  }

  /**
   * 클래스 상세 조회
   */
  async getClassById(id: string): Promise<ClassWithStats | null> {
    try {
      const cls: any = await measureQueryTime('getClassById', () =>
        prisma.class.findUnique({
          where: { id },
          include: getOptimizedInclude({
            includeCreator: true,
            includeAssignments: true,
            includeStats: true,
            assignmentLimit: 20,
          }),
        }),
      );

      if (!cls) return null;

      return {
        ...cls,
        description: cls.description ?? '',
        memberCount: cls._count?.members || cls.members?.length || 0,
        assignmentCount: cls._count?.assignments || cls.assignments?.length || 0,
        members:
          cls.members?.map((member: any) => ({
            ...member,
          })) || [],
      } as ClassWithStats;
    } catch (error) {
      logger.error('클래스 조회 실패', undefined, {
        classId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('클래스 조회에 실패했습니다.');
    }
  }

  /**
   * 클래스 생성
   */
  async createClass(data: CreateClassRequest, createdBy: string): Promise<Class> {
    try {
      const newClass = await prisma.class.create({
        data: {
          name: data.name,
          description: data.description || '',
          subject: data.subject,
          gradeLevel: data.gradeLevel,
          schoolYear: data.schoolYear,
          semester: data.semester,
          isActive: data.isActive ?? true,
          createdBy,
        },
      });

      logger.info('클래스 생성 성공', { classId: newClass.id, createdBy });
      return { ...newClass, description: newClass.description ?? '' } as Class;
    } catch (error) {
      logger.error('클래스 생성 실패', undefined, {
        data,
        createdBy,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('클래스 생성에 실패했습니다.');
    }
  }

  /**
   * 클래스 수정
   */
  async updateClass(id: string, data: UpdateClassRequest): Promise<Class> {
    try {
      const existingClass = await prisma.class.findUnique({ where: { id } });
      if (!existingClass) {
        throw new Error('클래스를 찾을 수 없습니다.');
      }

      const updatedClass = await prisma.class.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.description !== undefined && { description: data.description || '' }),
          ...(data.subject && { subject: data.subject }),
          ...(data.gradeLevel && { gradeLevel: data.gradeLevel }),
          ...(data.schoolYear && { schoolYear: data.schoolYear }),
          ...(data.semester && { semester: data.semester }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
        },
      });

      logger.info('클래스 수정 성공', { classId: id });
      return { ...updatedClass, description: updatedClass.description ?? '' } as Class;
    } catch (error) {
      logger.error('클래스 수정 실패', undefined, {
        classId: id,
        data,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('클래스 수정에 실패했습니다.');
    }
  }

  /**
   * 클래스 삭제 (소프트 삭제)
   */
  async deleteClass(id: string): Promise<Class> {
    try {
      const existingClass = await prisma.class.findUnique({ where: { id } });
      if (!existingClass) {
        throw new Error('클래스를 찾을 수 없습니다.');
      }

      const deletedClass = await prisma.class.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      logger.info('클래스 삭제 성공', { classId: id });
      return { ...deletedClass, description: deletedClass.description ?? '' } as Class;
    } catch (error) {
      logger.error('클래스 삭제 실패', undefined, {
        classId: id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error('클래스 삭제에 실패했습니다.');
    }
  }
}
