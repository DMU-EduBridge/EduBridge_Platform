import { logger } from '@/lib/logger';

export interface CreateAttemptRequest {
  problemId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent?: number;
  startTime?: string;
  studyId?: string;
  attemptNumber?: number;
}

export interface Attempt {
  id: string;
  userId: string;
  problemId: string;
  selected: string;
  isCorrect: boolean;
  startedAt: string;
  completedAt: string;
  timeSpent: number;
  problem?: {
    id: string;
    title: string;
    correctAnswer: string;
    points: number;
  };
}

export interface AttemptsResponse {
  success: boolean;
  attempts?: Attempt[];
  error?: string;
  code?: string;
  details?: any;
}

export interface CreateAttemptResponse {
  success: boolean;
  attempt?: Attempt;
  error?: string;
  code?: string;
  details?: any;
}

class AttemptService {
  private baseUrl = '/api/attempts';

  async createAttempt(data: CreateAttemptRequest): Promise<CreateAttemptResponse> {
    try {
      logger.info('시도 기록 생성 요청', data, 'ATTEMPT_SERVICE');

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        logger.error(
          '시도 기록 생성 실패',
          {
            status: response.status,
            error: result,
          },
          'ATTEMPT_SERVICE',
        );
        return result;
      }

      logger.info(
        '시도 기록 생성 성공',
        {
          attemptId: result.attempt?.id,
        },
        'ATTEMPT_SERVICE',
      );

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(
        '시도 기록 생성 네트워크 오류',
        {
          message: errorMessage,
        },
        'ATTEMPT_SERVICE',
      );

      return {
        success: false,
        error: '네트워크 오류가 발생했습니다.',
        code: 'NETWORK_ERROR',
        details: errorMessage,
      };
    }
  }

  async getAttempts(studyId?: string, problemId?: string): Promise<AttemptsResponse> {
    try {
      const params = new URLSearchParams();
      if (studyId) params.append('studyId', studyId);
      if (problemId) params.append('problemId', problemId);

      const url = `${this.baseUrl}?${params.toString()}`;

      logger.info('시도 기록 조회 요청', { studyId, problemId }, 'ATTEMPT_SERVICE');

      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        logger.error(
          '시도 기록 조회 실패',
          {
            status: response.status,
            error: result,
          },
          'ATTEMPT_SERVICE',
        );
        return result;
      }

      logger.info(
        '시도 기록 조회 성공',
        {
          count: result.attempts?.length || 0,
        },
        'ATTEMPT_SERVICE',
      );

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(
        '시도 기록 조회 네트워크 오류',
        {
          message: errorMessage,
        },
        'ATTEMPT_SERVICE',
      );

      return {
        success: false,
        error: '네트워크 오류가 발생했습니다.',
        code: 'NETWORK_ERROR',
        details: errorMessage,
      };
    }
  }

  // deleteAttempt 메서드 제거 - 모든 시도 기록 보존
  // "다시 풀기"는 새로운 시도로 기록되며, 기존 기록은 삭제하지 않음
}

export const attemptService = new AttemptService();
