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
import { useEffect, useRef, useState } from 'react';

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
  const { addCompletedProblem, activeAttemptNumber, isError: progressError, error: progressErrorData } = useProgress(studyId, shouldStartNewAttempt);

  // 학습 세션 정보 가져오기
  const { data: studyItem } = useStudyItem(studyId);

  const { startNewAttemptParam, handleNext } = useProblemNavigation({
    studyId,
    currentIndex,
    totalCount,
    nextProblem,
  });

  // 시도 번호 고정: 첫 결정된 시도 번호를 이후 제출에 계속 사용하여 시도 번호 흔들림 방지
  const lockedAttemptNumberRef = useRef<number | null>(null);
  useEffect(() => {
    if (typeof activeAttemptNumber === 'number' && activeAttemptNumber > 0) {
      if (lockedAttemptNumberRef.current === null) {
        lockedAttemptNumberRef.current = activeAttemptNumber;
      }
    }
  }, [activeAttemptNumber]);

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

  // 에러 처리
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('문제 풀이 중 에러 발생:', event.error);
      setError('문제를 불러오는 중 오류가 발생했습니다.');
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('처리되지 않은 Promise 거부:', event.reason);
      setError('네트워크 오류가 발생했습니다.');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // React Query 에러 처리
  useEffect(() => {
    if (progressError) {
      console.error('진행 상태 조회 실패:', progressErrorData);
      setError('학습 진행 상태를 불러올 수 없습니다.');
    }
  }, [progressError, progressErrorData]);

  // 에러 상태 추가
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">오류가 발생했습니다</h1>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
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
        try {
          // 브라우저 환경에서만 알림
          if (typeof window !== 'undefined') {
            window.alert('답안을 선택한 후 제출해 주세요.');
          }
        } catch {}
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
            attemptNumber={activeAttemptNumber}
            startTime={startTime}
            isActive={!showResult}
            studyTitle={studyItem?.title}
            subject={problem?.subject}
          />
          <div className="flex flex-col gap-4 px-6">
            <ProblemContent problem={problem} currentIndex={currentIndex} />

            <ProblemOptions
              problem={problem}
              selectedAnswer={selectedAnswer}
              showResult={showResult}
              onAnswerSelect={handleAnswerSelect}
            />

            <ProblemExplanation problem={problem} showResult={showResult} isCorrect={isCorrect} />

            <ProblemActions
              selectedAnswer={selectedAnswer}
              showResult={showResult}
              isLastProblem={currentIndex === totalCount}
              onSubmit={handleSubmit}
              onNext={handleNextEnsured}
              onPrevious={handlePrevious}
              currentIndex={currentIndex}
            />
          </div>
        </div>
      </div>
    </LearningErrorBoundary>
  );
}

export default ProblemDetailClient;
