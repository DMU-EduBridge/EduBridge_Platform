import { logger } from '@/lib/logger';

export interface ProgressData {
  selectedAnswer: string;
  startTime: string;
  lastAccessed: string;
}

export interface ProgressResponse {
  success: boolean;
  progress?: ProgressData[];
  error?: string;
  code?: string;
  details?: any;
}

class ProgressService {
  private baseUrl = '/api/progress';

  async saveProgress(
    studyId: string,
    problemId: string,
    selectedAnswer: string,
    startTime: Date,
  ): Promise<ProgressResponse> {
    try {
      logger.info(
        '진행 상태 저장 요청',
        {
          studyId,
          problemId,
          selectedAnswer,
        },
        'PROGRESS_SERVICE',
      );

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studyId,
          problemId,
          selectedAnswer,
          startTime: startTime.toISOString(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        logger.error(
          '진행 상태 저장 실패',
          {
            status: response.status,
            error: result,
          },
          'PROGRESS_SERVICE',
        );
        return result;
      }

      logger.info(
        '진행 상태 저장 성공',
        {
          studyId,
          problemId,
        },
        'PROGRESS_SERVICE',
      );

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(
        '진행 상태 저장 네트워크 오류',
        {
          message: errorMessage,
        },
        'PROGRESS_SERVICE',
      );

      return {
        success: false,
        error: '네트워크 오류가 발생했습니다.',
        code: 'NETWORK_ERROR',
        details: errorMessage,
      };
    }
  }

  async getProgress(studyId: string, problemId?: string): Promise<ProgressResponse> {
    try {
      const params = new URLSearchParams();
      params.append('studyId', studyId);
      if (problemId) params.append('problemId', problemId);

      const url = `${this.baseUrl}?${params.toString()}`;

      logger.info('진행 상태 조회 요청', { studyId, problemId }, 'PROGRESS_SERVICE');

      const response = await fetch(url);
      const result = await response.json();

      if (!response.ok) {
        logger.error(
          '진행 상태 조회 실패',
          {
            status: response.status,
            error: result,
          },
          'PROGRESS_SERVICE',
        );
        return result;
      }

      logger.info(
        '진행 상태 조회 성공',
        {
          studyId,
          problemId,
          count: result.progress?.length || 0,
        },
        'PROGRESS_SERVICE',
      );

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(
        '진행 상태 조회 네트워크 오류',
        {
          message: errorMessage,
        },
        'PROGRESS_SERVICE',
      );

      return {
        success: false,
        error: '네트워크 오류가 발생했습니다.',
        code: 'NETWORK_ERROR',
        details: errorMessage,
      };
    }
  }

  async clearProgress(studyId: string, problemId?: string): Promise<ProgressResponse> {
    try {
      const params = new URLSearchParams();
      params.append('studyId', studyId);
      if (problemId) params.append('problemId', problemId);

      const url = `${this.baseUrl}?${params.toString()}`;

      logger.info('진행 상태 삭제 요청', { studyId, problemId }, 'PROGRESS_SERVICE');

      const response = await fetch(url, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        logger.error(
          '진행 상태 삭제 실패',
          {
            status: response.status,
            error: result,
          },
          'PROGRESS_SERVICE',
        );
        return result;
      }

      logger.info(
        '진행 상태 삭제 성공',
        {
          studyId,
          problemId,
        },
        'PROGRESS_SERVICE',
      );

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(
        '진행 상태 삭제 네트워크 오류',
        {
          message: errorMessage,
        },
        'PROGRESS_SERVICE',
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

export const progressService = new ProgressService();
