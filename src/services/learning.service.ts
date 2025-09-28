import { logger } from '@/lib/logger';

export interface LearningAttempt {
  problemId: string;
  isCorrect: boolean;
  selected: string;
  createdAt: string;
}

export interface LearningStatus {
  totalProblems: number;
  completedProblems: number;
  correctAnswers: number;
  wrongAnswers: number;
  isCompleted: boolean;
  attempts: LearningAttempt[];
}

export interface LearningStatusResponse {
  success: boolean;
  data?: LearningStatus;
  error?: string;
  code?: string;
  details?: any;
}

class LearningService {
  private baseUrl = '/api/learning/complete';

  async getLearningStatus(studyId: string): Promise<LearningStatusResponse> {
    try {
      const url = `${this.baseUrl}?studyId=${encodeURIComponent(studyId)}`;

      logger.info('학습 상태 조회 요청', { studyId }, 'LEARNING_SERVICE');

      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        logger.error(
          '학습 상태 조회 실패',
          {
            status: response.status,
            error: result,
          },
          'LEARNING_SERVICE',
        );
        return result;
      }

      logger.info(
        '학습 상태 조회 성공',
        {
          studyId,
          totalProblems: result.data?.totalProblems || 0,
          completedProblems: result.data?.completedProblems || 0,
          isCompleted: result.data?.isCompleted || false,
        },
        'LEARNING_SERVICE',
      );

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(
        '학습 상태 조회 네트워크 오류',
        {
          message: errorMessage,
        },
        'LEARNING_SERVICE',
      );

      return {
        success: false,
        error: '네트워크 오류가 발생했습니다.',
        code: 'NETWORK_ERROR',
        details: errorMessage,
      };
    }
  }
}

export const learningService = new LearningService();
