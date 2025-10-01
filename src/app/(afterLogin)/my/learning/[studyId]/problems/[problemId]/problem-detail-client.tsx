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
import { useEffect, useMemo, useState } from 'react';

interface Problem {
  id: string;
  title: string;
  description?: string | undefined;
  content: string;
  type: 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | 'ESSAY' | 'TRUE_FALSE' | 'CODING' | 'MATH';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  subject: string;
  options: string[];
  correctAnswer: string;
  explanation?: string | undefined;
  hints?: any;
  points: number;
  timeLimit?: number | undefined;
}

interface ProblemDetailClientProps {
  studyId: string;
  problemId: string;
  initialProblem?: Problem | undefined;
  currentIndex: number;
  totalCount: number;
  nextProblem?: { id: string } | undefined;
}

export function ProblemDetailClient({
  studyId,
  initialProblem,
  currentIndex,
  totalCount,
  nextProblem,
}: ProblemDetailClientProps) {
  const [problem, setProblem] = useState<Problem | undefined>(initialProblem);
  const [shouldStartNewAttempt, setShouldStartNewAttempt] = useState(false);
  const [startTime, setStartTime] = useState<Date>(new Date());

  // 커스텀 훅들
  const { progressData, addCompletedProblem, activeAttemptNumber } = useProgress(
    studyId,
    shouldStartNewAttempt,
  );

  const { startNewAttemptParam, handleNext } = useProblemNavigation({
    studyId,
    currentIndex,
    totalCount,
    nextProblem,
  });

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
    activeAttemptNumber,
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

  useEffect(() => {
    if (!startNewAttemptParam) {
      return;
    }

    if (typeof window === 'undefined') {
      return;
    }

    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('startNewAttempt');
      window.history.replaceState(null, '', url.toString());
    } catch (error) {
      console.warn('startNewAttempt 쿼리 제거 실패:', error);
    }
  }, [startNewAttemptParam]);

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

  // timeSpent 계산 최적화
  const timeSpent = useMemo(() => {
    return Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
  }, [startTime]);

  if (!problem) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg text-gray-600">문제를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <LearningErrorBoundary>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4">
          <ProblemHeader
            currentIndex={currentIndex}
            totalCount={totalCount}
            progressData={progressData}
            attemptNumber={activeAttemptNumber}
            startTime={startTime}
            isActive={!showResult}
          />

          <ProblemContent problem={problem} />

          <ProblemOptions
            problem={problem}
            selectedAnswer={selectedAnswer}
            showResult={showResult}
            onAnswerSelect={handleAnswerSelect}
          />

          <ProblemActions
            selectedAnswer={selectedAnswer}
            showResult={showResult}
            isCorrect={isCorrect}
            isLastProblem={currentIndex === totalCount}
            onSubmit={handleSubmit}
            onNext={handleNext}
            timeSpent={timeSpent}
          />

          <ProblemExplanation
            problem={problem}
            showResult={showResult}
            isCorrect={isCorrect}
            selectedAnswer={selectedAnswer}
          />
        </div>
      </div>
    </LearningErrorBoundary>
  );
}

export default ProblemDetailClient;
