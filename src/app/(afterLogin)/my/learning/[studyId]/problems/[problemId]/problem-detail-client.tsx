'use client';

import { LearningErrorBoundary } from '@/components/learning/error-boundary';
import { ProblemActions } from '@/components/problems/problem-actions';
import { ProblemContent } from '@/components/problems/problem-content';
import { ProblemExplanation } from '@/components/problems/problem-explanation';
import { ProblemHeader } from '@/components/problems/problem-header';
import { ProblemOptions } from '@/components/problems/problem-options';
import { useProblemNavigation } from '@/hooks/learning/use-problem-navigation';
import { useProblemSubmission } from '@/hooks/learning/use-problem-submission';
import { useProgress } from '@/hooks/learning/use-progress';
import { useStudyItem } from '@/hooks/learning/use-study-item';
import { DEFAULT_VALUES, ERROR_MESSAGES } from '@/lib/constants/learning';
import {
  calculateRemainingProblems,
  parseStartNewAttemptParam,
  showBrowserAlert,
} from '@/lib/utils/learning-utils';
import type { Problem } from '@/types/domain/problem';
import type { ProblemDetailClientProps } from '@/types/learning';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * 문제 상세 페이지 클라이언트 컴포넌트
 * @param props 컴포넌트 props
 * @returns JSX.Element
 */

export function ProblemDetailClient({
  studyId,
  initialProblem,
  currentIndex,
  totalCount,
  nextProblem,
  isStudent = true,
}: ProblemDetailClientProps) {
  const [problem, setProblem] = useState<Problem | undefined>(initialProblem);
  const [shouldStartNewAttempt, setShouldStartNewAttempt] = useState(false);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const searchParams = useSearchParams();

  // URL에서 startNewAttempt 파라미터를 파싱
  const startNewAttemptNumber = useMemo(() => {
    const parsed = parseStartNewAttemptParam(searchParams);
    return parsed !== undefined ? parsed : shouldStartNewAttempt ? true : false;
  }, [searchParams, shouldStartNewAttempt]);

  // 커스텀 훅들
  const { addCompletedProblem, activeAttemptNumber, progressData } = useProgress(
    studyId,
    startNewAttemptNumber,
  );

  // 학습 세션 정보 가져오기
  const { data: studyItem } = useStudyItem(studyId);

  // 남은 문항 수 계산 (클라이언트에서 실시간 계산)
  const clientRemainingProblems = useMemo(() => {
    return calculateRemainingProblems(progressData.completed, totalCount);
  }, [progressData.completed, totalCount]);

  const { startNewAttemptParam, handleNext } = useProblemNavigation({
    studyId,
    currentIndex,
    totalCount,
    nextProblem,
  });

  // 시도 번호 고정: 첫 결정된 시도 번호를 이후 제출에 계속 사용하여 시도 번호 흔들림 방지
  const lockedAttemptNumberRef = useRef<number | null>(null);

  useEffect(() => {
    console.log('startNewAttemptNumber:', startNewAttemptNumber);
    console.log('activeAttemptNumber:', activeAttemptNumber);
    console.log('lockedAttemptNumberRef.current:', lockedAttemptNumberRef.current);

    // startNewAttemptNumber가 유효한 숫자이면 그것을 우선 사용
    if (
      typeof startNewAttemptNumber === 'number' &&
      startNewAttemptNumber > DEFAULT_VALUES.POINTS
    ) {
      lockedAttemptNumberRef.current = startNewAttemptNumber;
      console.log('Using startNewAttemptNumber as lockedAttemptNumber:', startNewAttemptNumber);
    } else if (
      typeof activeAttemptNumber === 'number' &&
      activeAttemptNumber > DEFAULT_VALUES.POINTS
    ) {
      if (lockedAttemptNumberRef.current === null) {
        lockedAttemptNumberRef.current = activeAttemptNumber;
        console.log('lockedAttemptNumber set to:', activeAttemptNumber);
      }
    }
  }, [activeAttemptNumber, startNewAttemptNumber]);

  const {
    selectedAnswer,
    showResult,
    isCorrect,
    handleAnswerSelect,
    handleSubmit,
    resetSubmission,
    setInitialStartNewAttempt,
  } = useProblemSubmission({
    problem,
    activeAttemptNumber: lockedAttemptNumberRef.current ?? activeAttemptNumber,
    addCompletedProblem,
  });

  // 초기 설정
  useEffect(() => {
    if (startNewAttemptParam) {
      setInitialStartNewAttempt(true);
      setShouldStartNewAttempt(true);
    }
  }, [startNewAttemptParam, setInitialStartNewAttempt]);

  // 새 시도 시작 시 진행률 초기화를 위한 쿼리 키 변경
  useEffect(() => {
    if (shouldStartNewAttempt) {
      // 새 시도 시작 시 기존 캐시를 무효화
      console.log('새 시도 시작 - 진행률 초기화');
    }
  }, [shouldStartNewAttempt]);

  // NOTE: startNewAttempt 쿼리를 유지하여 새로고침에도 컨텍스트 보존

  // 문제 데이터 로드 및 진행 상태 복원
  useEffect(() => {
    if (initialProblem) {
      setProblem(initialProblem);

      // 새로운 문제로 변경 시 제출 상태 초기화
      if (!showResult) {
        resetSubmission();
        setStartTime(new Date());
      }
    }
  }, [initialProblem, showResult, resetSubmission]);

  if (!problem) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg text-gray-600">문제를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  // 이전 문제로 이동하는 핸들러
  const handlePrevious = () => {
    if (currentIndex > 1) {
      // 이전 문제로 이동 로직
      window.history.back();
    }
  };

  // 다음 이동 시 항상 저장 보장 (마지막 문제뿐 아니라 일반 이동도 포함)
  const handleNextEnsured = () => {
    if (!showResult) {
      if (!selectedAnswer) {
        // 답안을 선택하지 않으면 저장 및 이동을 허용하지 않음
        showBrowserAlert(ERROR_MESSAGES.ANSWER_REQUIRED);
        return;
      }

      try {
        Promise.resolve(handleSubmit()).finally(() => {
          handleNext();
        });
      } catch (_e) {
        handleNext();
      }
      return;
    }

    handleNext();
  };

  return (
    <LearningErrorBoundary>
      <div className="min-h-screen bg-white py-8">
        <div className="mx-auto">
          <ProblemHeader
            currentIndex={currentIndex}
            totalCount={totalCount}
            remainingProblems={clientRemainingProblems}
            attemptNumber={activeAttemptNumber}
            startTime={startTime}
            isActive={isStudent && !showResult}
            studyTitle={studyItem?.title}
            subject={problem?.subject}
          />
          <div className="flex flex-col gap-4 px-6">
            <ProblemContent problem={problem} currentIndex={currentIndex} />

            {isStudent ? (
              <>
                <ProblemOptions
                  problem={problem}
                  selectedAnswer={selectedAnswer}
                  showResult={showResult}
                  onAnswerSelect={handleAnswerSelect}
                />

                <ProblemExplanation
                  problem={problem}
                  showResult={showResult}
                  isCorrect={isCorrect}
                />

                <ProblemActions
                  selectedAnswer={selectedAnswer}
                  showResult={showResult}
                  isLastProblem={currentIndex >= totalCount}
                  onSubmit={handleSubmit}
                  onNext={handleNextEnsured}
                  onPrevious={handlePrevious}
                  currentIndex={currentIndex}
                />
              </>
            ) : (
              <>
                <ProblemOptions
                  problem={problem}
                  selectedAnswer={(() => {
                    const correctIndex = problem.options.findIndex(
                      (opt) => opt === problem.correctAnswer,
                    );
                    return (correctIndex + 1).toString();
                  })()}
                  showResult={true}
                  onAnswerSelect={() => {}}
                />

                <ProblemExplanation problem={problem} showResult={true} isCorrect={true} />

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="text-center text-blue-800">
                    선생님은 문제를 볼 수만 있습니다. 문제 풀이는 학생만 가능합니다.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </LearningErrorBoundary>
  );
}

export default ProblemDetailClient;
