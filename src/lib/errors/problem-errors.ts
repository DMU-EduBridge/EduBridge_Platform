/**
 * 문제 관련 커스텀 에러 클래스들
 */

export class ProblemNotFoundError extends Error {
  constructor(problemId: string) {
    super(`문제를 찾을 수 없습니다: ${problemId}`);
    this.name = 'ProblemNotFoundError';
  }
}

export class ProblemCreationError extends Error {
  constructor(message: string) {
    super(`문제 생성 실패: ${message}`);
    this.name = 'ProblemCreationError';
  }
}

export class ProblemUpdateError extends Error {
  constructor(problemId: string, message: string) {
    super(`문제 수정 실패 (${problemId}): ${message}`);
    this.name = 'ProblemUpdateError';
  }
}

export class ProblemDeletionError extends Error {
  constructor(problemId: string, message: string) {
    super(`문제 삭제 실패 (${problemId}): ${message}`);
    this.name = 'ProblemDeletionError';
  }
}

export class ProblemAttemptError extends Error {
  constructor(problemId: string, message: string) {
    super(`답안 제출 실패 (${problemId}): ${message}`);
    this.name = 'ProblemAttemptError';
  }
}

export class ProblemStatsError extends Error {
  constructor(message: string) {
    super(`통계 조회 실패: ${message}`);
    this.name = 'ProblemStatsError';
  }
}
