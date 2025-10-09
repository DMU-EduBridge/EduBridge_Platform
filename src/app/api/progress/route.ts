import { ApiSuccess, ApiError } from '@/lib/api-response';
import { logger } from '@/lib/monitoring';
import { ProgressPostSchema } from '@/lib/validation/schemas';
import { withAuth } from '@/server/http/handler';
import { progressService } from '@/server/services/progress/progress.service';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

// 문제 완료 상태 저장
export async function POST(request: NextRequest) {
  return withAuth(async ({ userId }) => {
    const body = await request.json();
    const data = ProgressPostSchema.parse(body);

    try {
      const result = await progressService.saveProgress(userId, data);
      logger.info('문제 진행 저장 성공', {
        userId,
        studyId: data.studyId,
        problemId: data.problemId,
      });
      return ApiSuccess.ok(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'PROBLEM_NOT_IN_STUDY') {
          return ApiError.badRequest('해당 문제는 이 학습 자료에 속하지 않습니다.');
        }
        if (error.message === 'NO_PROBLEMS') {
          return ApiError.badRequest('학습 자료에 등록된 문제가 없습니다.');
        }
      }
      throw error;
    }
  });
}

// 학습 진행 상태 조회
export async function GET(request: NextRequest) {
  return withAuth(async ({ userId }) => {
    const { searchParams } = new URL(request.url);
    const studyId = searchParams.get('studyId');
    const startNewAttemptParam = searchParams.get('startNewAttempt');
    let startNewAttempt: boolean | number | undefined;

    if (startNewAttemptParam === 'true') {
      startNewAttempt = true;
    } else if (startNewAttemptParam === 'false') {
      startNewAttempt = false;
    } else if (startNewAttemptParam && !isNaN(Number(startNewAttemptParam))) {
      startNewAttempt = Number(startNewAttemptParam);
    }

    if (!studyId) {
      return ApiError.badRequest('studyId가 필요합니다.');
    }

    const result = await progressService.getProgress(userId, studyId, startNewAttempt);
    logger.info('학습 진행 상태 조회 성공', { userId, studyId });
    return ApiSuccess.ok(result);
  });
}

// 문제 진행 상태 삭제 (재시도용)
export async function DELETE(request: NextRequest) {
  return withAuth(async ({ userId }) => {
    const { searchParams } = new URL(request.url);
    const studyId = searchParams.get('studyId');
    const problemId = searchParams.get('problemId');

    if (!studyId) {
      return ApiError.badRequest('studyId가 필요합니다.');
    }

    const result = await progressService.deleteProgress(userId, studyId, problemId || undefined);
    logger.info('문제 진행 상태 삭제 성공', {
      userId,
      studyId,
      problemId,
      deletedCount: result.deletedCount,
    });
    return ApiSuccess.ok(result);
  });
}
