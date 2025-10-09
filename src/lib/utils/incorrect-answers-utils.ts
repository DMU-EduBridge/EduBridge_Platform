/**
 * 오답노트 관련 유틸리티 함수
 */

import { INCORRECT_ANSWERS_CONFIG } from '@/lib/constants/incorrect-answers';
import type {
  IncorrectAnswerProblem,
  IncorrectAnswerSubject,
  IncorrectAnswersStats,
  ProblemAttempt,
  ProgressRecord,
} from '@/types/incorrect-answers';

/**
 * 문제별 시도들을 그룹핑합니다.
 */
export function groupAttemptsByProblem(
  progresses: ProgressRecord[],
): Map<string, ProgressRecord[]> {
  const attemptsByProblem = new Map<string, ProgressRecord[]>();

  for (const progress of progresses) {
    if (!attemptsByProblem.has(progress.problemId)) {
      attemptsByProblem.set(progress.problemId, []);
    }
    attemptsByProblem.get(progress.problemId)!.push(progress);
  }

  return attemptsByProblem;
}

/**
 * 시도 배열을 ProblemAttempt 형태로 변환합니다.
 */
export function transformAttemptsToProblemAttempts(attempts: ProgressRecord[]): ProblemAttempt[] {
  return attempts.map((attempt) => ({
    attemptNumber: attempt.attemptNumber || INCORRECT_ANSWERS_CONFIG.DEFAULT_ATTEMPT_NUMBER,
    selectedAnswer: attempt.selectedAnswer || '',
    completedAt: attempt.completedAt?.toISOString() || new Date().toISOString(),
    timeSpent: attempt.timeSpent || 0,
  }));
}

/**
 * ProgressRecord를 IncorrectAnswerProblem으로 변환합니다.
 */
export function transformProgressToProblem(
  progress: ProgressRecord,
  allAttempts: ProblemAttempt[],
): IncorrectAnswerProblem {
  const subject = progress.problem.subject || INCORRECT_ANSWERS_CONFIG.DEFAULT_SUBJECT;

  return {
    id: progress.problemId,
    question:
      progress.problem.title ||
      progress.problem.content?.slice(0, INCORRECT_ANSWERS_CONFIG.QUESTION_PREVIEW_LENGTH) ||
      '문제',
    myAnswer: progress.selectedAnswer || '',
    correctAnswer: progress.problem.correctAnswer || '',
    explanation: progress.problem.explanation || '',
    difficulty: (
      progress.problem.difficulty || INCORRECT_ANSWERS_CONFIG.DEFAULT_DIFFICULTY
    ).toLowerCase() as 'easy' | 'medium' | 'hard',
    topic: subject,
    attempts: progress.attemptNumber || INCORRECT_ANSWERS_CONFIG.DEFAULT_ATTEMPT_NUMBER,
    lastAttempt: progress.completedAt?.toISOString() || new Date().toISOString(),
    allAttempts,
  };
}

/**
 * 과목별로 문제들을 그룹핑합니다.
 */
export function groupProblemsBySubject(
  attemptsByProblem: Map<string, ProgressRecord[]>,
): Map<string, IncorrectAnswerSubject> {
  const groups = new Map<string, IncorrectAnswerSubject>();

  attemptsByProblem.forEach((attempts) => {
    // 빈 배열이면 건너뛰기
    if (attempts.length === 0) return;

    // 최신 시도를 대표로 사용
    const latestProgress = attempts[0];
    if (!latestProgress) return;

    const subject = latestProgress.problem.subject || INCORRECT_ANSWERS_CONFIG.DEFAULT_SUBJECT;

    // 기존 그룹이 있으면 가져오고, 없으면 새로 생성
    const existingGroup = groups.get(subject);
    const group: IncorrectAnswerSubject = existingGroup || {
      id: subject,
      subject,
      grade: '',
      gradeColor: INCORRECT_ANSWERS_CONFIG.DEFAULT_GRADE_COLOR,
      status: INCORRECT_ANSWERS_CONFIG.DEFAULT_STATUS,
      statusColor: INCORRECT_ANSWERS_CONFIG.DEFAULT_STATUS_COLOR,
      incorrectCount: 0,
      retryCount: 0,
      completedCount: 0,
      totalProblems: 0,
      lastUpdated: latestProgress.completedAt?.toISOString() || new Date().toISOString(),
      problems: [],
    };

    // 그룹 정보 업데이트
    group.incorrectCount += 1;
    group.lastUpdated =
      group.lastUpdated &&
      latestProgress.completedAt &&
      latestProgress.completedAt > new Date(group.lastUpdated)
        ? latestProgress.completedAt.toISOString()
        : group.lastUpdated;

    // 모든 시도들을 포함한 문제 정보 생성
    const allAttempts = transformAttemptsToProblemAttempts(attempts);
    const problem = transformProgressToProblem(latestProgress, allAttempts);

    group.problems.push(problem);
    groups.set(subject, group);
  });

  return groups;
}

/**
 * 통계 정보를 계산합니다.
 */
export function calculateIncorrectAnswersStats(
  incorrectAnswers: IncorrectAnswerSubject[],
): IncorrectAnswersStats {
  const totalIncorrect = incorrectAnswers.reduce((sum, group) => sum + group.incorrectCount, 0);

  const totalProblems = incorrectAnswers.reduce((sum, group) => sum + group.problems.length, 0);
  const totalAttempts = incorrectAnswers.reduce(
    (sum, group) => sum + group.problems.reduce((ps, problem) => ps + problem.attempts, 0),
    0,
  );

  const averageAttempts =
    totalProblems > 0 ? Number((totalAttempts / totalProblems).toFixed(1)) : 0;

  const mostDifficultSubject =
    incorrectAnswers.sort((a, b) => b.incorrectCount - a.incorrectCount)[0]?.subject || '';

  return {
    totalIncorrect,
    totalRetry: 0, // TODO: 재시도 로직 구현 시 업데이트
    totalCompleted: 0, // TODO: 완료 로직 구현 시 업데이트
    averageAttempts,
    mostDifficultSubject,
  };
}

/**
 * 날짜를 한국어 형식으로 포맷팅합니다.
 */
export function formatKoreanDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 시간을 초 단위로 변환합니다.
 */
export function formatTimeSpent(timeSpent: number): string {
  return `${Math.round(timeSpent / 1000)}초`;
}
