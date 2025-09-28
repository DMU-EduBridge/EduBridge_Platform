import { ApiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/core/prisma';

export interface StudySessionData {
  id: string;
  userId: string;
  studyId: string;
  totalProblems: number;
  completedProblems: number;
  isCompleted: boolean;
  startedAt: Date;
  completedAt?: Date;
  attempts: Array<{
    id: string;
    problemId: string;
    selected: string;
    isCorrect: boolean;
    startedAt: Date;
    completedAt?: Date;
    timeSpent?: number;
  }>;
}

export interface CreateStudySessionData {
  userId: string;
  studyId: string;
  totalProblems: number;
}

export interface UpdateStudySessionData {
  completedProblems?: number;
  isCompleted?: boolean;
  completedAt?: Date;
}

export class StudySessionService {
  /**
   * 사용자의 특정 학습 자료에 대한 최신 학습 세션 조회
   */
  async getLatestSession(
    userId: string,
    studyId: string,
  ): Promise<ApiResponse<StudySessionData | null>> {
    try {
      const session = await prisma.studySession.findFirst({
        where: {
          userId,
          studyId,
        },
        include: {
          attempts: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!session) {
        return { success: true, data: null };
      }

      return {
        success: true,
        data: {
          id: session.id,
          userId: session.userId,
          studyId: session.studyId,
          totalProblems: session.totalProblems,
          completedProblems: session.completedProblems,
          isCompleted: session.isCompleted,
          startedAt: session.startedAt,
          completedAt: session.completedAt,
          attempts: session.attempts.map((attempt) => ({
            id: attempt.id,
            problemId: attempt.problemId,
            selected: attempt.selected,
            isCorrect: attempt.isCorrect,
            startedAt: attempt.startedAt,
            completedAt: attempt.completedAt,
            timeSpent: attempt.timeSpent,
          })),
        },
      };
    } catch (error) {
      console.error('학습 세션 조회 실패:', error);
      return { success: false, error: '학습 세션 조회에 실패했습니다.' };
    }
  }

  /**
   * 새로운 학습 세션 생성
   */
  async createSession(data: CreateStudySessionData): Promise<ApiResponse<StudySessionData>> {
    try {
      const session = await prisma.studySession.create({
        data: {
          userId: data.userId,
          studyId: data.studyId,
          totalProblems: data.totalProblems,
          completedProblems: 0,
          isCompleted: false,
        },
        include: {
          attempts: true,
        },
      });

      return {
        success: true,
        data: {
          id: session.id,
          userId: session.userId,
          studyId: session.studyId,
          totalProblems: session.totalProblems,
          completedProblems: session.completedProblems,
          isCompleted: session.isCompleted,
          startedAt: session.startedAt,
          completedAt: session.completedAt,
          attempts: [],
        },
      };
    } catch (error) {
      console.error('학습 세션 생성 실패:', error);
      return { success: false, error: '학습 세션 생성에 실패했습니다.' };
    }
  }

  /**
   * 학습 세션 업데이트
   */
  async updateSession(
    sessionId: string,
    data: UpdateStudySessionData,
  ): Promise<ApiResponse<StudySessionData>> {
    try {
      const session = await prisma.studySession.update({
        where: { id: sessionId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          attempts: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      return {
        success: true,
        data: {
          id: session.id,
          userId: session.userId,
          studyId: session.studyId,
          totalProblems: session.totalProblems,
          completedProblems: session.completedProblems,
          isCompleted: session.isCompleted,
          startedAt: session.startedAt,
          completedAt: session.completedAt,
          attempts: session.attempts.map((attempt) => ({
            id: attempt.id,
            problemId: attempt.problemId,
            selected: attempt.selected,
            isCorrect: attempt.isCorrect,
            startedAt: attempt.startedAt,
            completedAt: attempt.completedAt,
            timeSpent: attempt.timeSpent,
          })),
        },
      };
    } catch (error) {
      console.error('학습 세션 업데이트 실패:', error);
      return { success: false, error: '학습 세션 업데이트에 실패했습니다.' };
    }
  }

  /**
   * 학습 세션에 문제 시도 추가
   */
  async addAttempt(
    sessionId: string,
    attemptData: {
      userId: string;
      problemId: string;
      selected: string;
      isCorrect: boolean;
      timeSpent?: number;
      classId?: string;
    },
  ): Promise<ApiResponse<StudySessionData>> {
    try {
      // 트랜잭션으로 시도 추가 및 세션 업데이트
      const result = await prisma.$transaction(async (tx) => {
        // 시도 추가
        const attempt = await tx.attempt.create({
          data: {
            userId: attemptData.userId,
            studySessionId: sessionId,
            problemId: attemptData.problemId,
            selected: attemptData.selected,
            isCorrect: attemptData.isCorrect,
            timeSpent: attemptData.timeSpent,
            classId: attemptData.classId,
            completedAt: new Date(),
          },
        });

        // 세션의 완료된 문제 수 업데이트
        const session = await tx.studySession.findUnique({
          where: { id: sessionId },
          include: {
            attempts: {
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        });

        if (!session) {
          throw new Error('학습 세션을 찾을 수 없습니다.');
        }

        // 고유한 문제 ID 수 계산
        const uniqueProblemIds = new Set(session.attempts.map((a) => a.problemId));
        const completedProblems = uniqueProblemIds.size;
        const isCompleted = completedProblems >= session.totalProblems;

        // 세션 업데이트
        const updatedSession = await tx.studySession.update({
          where: { id: sessionId },
          data: {
            completedProblems,
            isCompleted,
            completedAt: isCompleted ? new Date() : null,
          },
          include: {
            attempts: {
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        });

        return updatedSession;
      });

      return {
        success: true,
        data: {
          id: result.id,
          userId: result.userId,
          studyId: result.studyId,
          totalProblems: result.totalProblems,
          completedProblems: result.completedProblems,
          isCompleted: result.isCompleted,
          startedAt: result.startedAt,
          completedAt: result.completedAt,
          attempts: result.attempts.map((attempt) => ({
            id: attempt.id,
            problemId: attempt.problemId,
            selected: attempt.selected,
            isCorrect: attempt.isCorrect,
            startedAt: attempt.startedAt,
            completedAt: attempt.completedAt,
            timeSpent: attempt.timeSpent,
          })),
        },
      };
    } catch (error) {
      console.error('문제 시도 추가 실패:', error);
      return { success: false, error: '문제 시도 추가에 실패했습니다.' };
    }
  }

  /**
   * 학습 세션 삭제
   */
  async deleteSession(sessionId: string): Promise<ApiResponse<boolean>> {
    try {
      await prisma.studySession.delete({
        where: { id: sessionId },
      });

      return { success: true, data: true };
    } catch (error) {
      console.error('학습 세션 삭제 실패:', error);
      return { success: false, error: '학습 세션 삭제에 실패했습니다.' };
    }
  }
}

export const studySessionService = new StudySessionService();
