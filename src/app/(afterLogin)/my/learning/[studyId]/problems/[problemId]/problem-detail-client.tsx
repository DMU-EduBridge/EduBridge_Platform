'use client';

import { ProblemActions } from '@/components/problems/problem-actions';
import { ProblemContent } from '@/components/problems/problem-content';
import { ProblemExplanation } from '@/components/problems/problem-explanation';
import { ProblemHeader } from '@/components/problems/problem-header';
import { ProblemOptions } from '@/components/problems/problem-options';
import { useProgress } from '@/hooks/learning/use-progress';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  problemId,
  initialProblem,
  currentIndex,
  totalCount,
  nextProblem,
}: ProblemDetailClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [problem, setProblem] = useState<Problem | undefined>(initialProblem);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [_elapsedTime, setElapsedTime] = useState(0);

  const startNewAttemptParam = useMemo(() => {
    const value = searchParams?.get('startNewAttempt');
    return value === '1' || value === 'true';
  }, [searchParams]);

  const [shouldStartNewAttempt, setShouldStartNewAttempt] = useState(startNewAttemptParam);
  const initialStartNewAttemptRef = useRef(startNewAttemptParam);

  const { progressData, addCompletedProblem, activeAttemptNumber, isLoading } = useProgress(
    studyId,
    shouldStartNewAttempt,
  );

  useEffect(() => {
    if (startNewAttemptParam) {
      initialStartNewAttemptRef.current = true;
      setShouldStartNewAttempt(true);
    }
  }, [startNewAttemptParam]);

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
  console.log('ProblemDetailClient 렌더링:', {
    studyId,
    problemId,
    currentIndex,
    totalCount,
    startNewAttemptParam,
    activeAttemptNumber,
  });

  // 문제 데이터 로드 및 진행 상태 복원
  useEffect(() => {
    const loadProblemData = async () => {
      if (initialProblem) {
        setProblem(initialProblem);

        // 이미 결과를 표시 중이면 진행 상태를 복원하지 않음
        if (showResult) {
          return;
        }

        setStartTime(new Date());
        setSelectedAnswer('');
        setShowResult(false);

        // 진행률은 React Query에서 자동 관리됨
      }
    };

    loadProblemData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initialProblem?.id, // problemId만 의존성으로 사용하여 무한 루프 방지
    studyId,
    problemId,
  ]);

  // 타이머 업데이트
  useEffect(() => {
    if (!showResult) {
      const timer = setInterval(() => {
        setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
      }, 1000);

      return () => clearInterval(timer);
    }
    return undefined;
  }, [startTime, showResult]);

  const onAnswerSelect = useCallback(
    (answer: string) => {
      if (!showResult) {
        setSelectedAnswer(answer);
        // 로컬 상태만 저장 (서버 저장은 정답 확인 시에만)
      }
    },
    [showResult],
  );

  const handleSubmit = useCallback(async () => {
    if (!problem || !selectedAnswer || activeAttemptNumber <= 0 || isLoading) return;

    console.log('문제 제출 시작:', problem.id, selectedAnswer);

    // 로컬에서 정답 확인
    const correct = selectedAnswer === problem.correctAnswer;

    setIsCorrect(correct);
    setShowResult(true);

    const elapsedSeconds = Math.max(
      Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
      0,
    );

    // 문제 완료 상태 추가 및 정답/오답 정보 저장 (재시도 포함)
    const answerData = {
      isCorrect: correct,
      selectedAnswer: selectedAnswer,
      correctAnswer: problem.correctAnswer,
      problemTitle: problem.title,
      completedAt: new Date().toISOString(),
    };

    console.log('답안 데이터:', answerData);

    // 문제 완료 처리 (React Query가 자동으로 상태 업데이트)
    // 재시도 시에도 새로운 시도로 기록됨
    try {
      const result = await addCompletedProblem({
        problemId: problem.id,
        answer: answerData,
        attemptNumber: activeAttemptNumber,
        startTime: startTime.toISOString(),
        timeSpent: elapsedSeconds,
        forceNewAttempt: initialStartNewAttemptRef.current,
      });
      console.log('문제 완료 처리 결과:', result);
      initialStartNewAttemptRef.current = false;
      setShouldStartNewAttempt(false);
    } catch (error) {
      console.error('문제 완료 처리 실패:', error);
    }
  }, [
    problem,
    selectedAnswer,
    addCompletedProblem,
    activeAttemptNumber,
    startTime,
    isLoading,
  ]);

  const handleNext = useCallback(async () => {
    // 다음 문제로 이동
    if (nextProblem) {
      router.push(`/my/learning/${encodeURIComponent(studyId)}/problems/${nextProblem.id}`);
    } else {
      // 다음 문제가 없으면 결과 페이지로 이동
      router.push(`/my/learning/${encodeURIComponent(studyId)}/results`);
    }
  }, [nextProblem, router, studyId]);

  const handleRetry = useCallback(async () => {
    console.log('재시도 시작:', problem?.id);

    // 로컬 상태만 초기화 (시도 히스토리는 보존)
    setSelectedAnswer('');
    setShowResult(false);
    setIsCorrect(false);
    setStartTime(new Date());
    setElapsedTime(0);
    // currentAttempt는 이미 maxAttempt + 1로 설정되어 있으므로 증가시키지 않음

    // 다음 제출을 새로운 시도로 기록하도록 플래그 설정
    initialStartNewAttemptRef.current = true;
    setShouldStartNewAttempt(true);

    console.log('재시도 완료 - 새로운 시도로 기록됨');
  }, [problem]);

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <ProblemHeader
          currentIndex={currentIndex}
          totalCount={totalCount}
          progressData={progressData} // 전체 진행률만 사용
          attemptNumber={activeAttemptNumber}
        />

        <ProblemContent problem={problem} />

        <ProblemOptions
          problem={problem}
          selectedAnswer={selectedAnswer}
          showResult={showResult}
          onAnswerSelect={onAnswerSelect}
        />

        <ProblemActions
          selectedAnswer={selectedAnswer}
          showResult={showResult}
          isCorrect={isCorrect}
          isLastProblem={currentIndex === totalCount}
          onSubmit={handleSubmit}
          onNext={handleNext}
          onRetry={handleRetry}
        />

        <ProblemExplanation
          problem={problem}
          showResult={showResult}
          isCorrect={isCorrect}
          selectedAnswer={selectedAnswer}
        />
      </div>
    </div>
  );
}

export default ProblemDetailClient;
