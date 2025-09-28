'use client';

import { ProblemActions } from '@/components/problems/problem-actions';
import { ProblemContent } from '@/components/problems/problem-content';
import { ProblemExplanation } from '@/components/problems/problem-explanation';
import { ProblemHeader } from '@/components/problems/problem-header';
import { ProblemOptions } from '@/components/problems/problem-options';
import { useProgress } from '@/hooks/use-progress';
// attemptService import 제거 - deleteAttempt 메서드 제거됨
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

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
  const [problem, setProblem] = useState<Problem | undefined>(initialProblem);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [_elapsedTime, setElapsedTime] = useState(0);

  const {
    completedProblems,
    setCompletedProblems,
    addCompletedProblem,
    initializeProgress,
    saveProgress,
    getProgress,
    learningStatus,
    loadLearningStatus,
  } = useProgress(studyId);

  // 진행률 계산 (메모이제이션)
  const progressData = useMemo(() => {
    // 현재 문제를 제외한 완료된 문제 수 계산
    const actualCompleted = problem
      ? completedProblems.filter((id) => id !== problem.id).length
      : completedProblems.length;

    // learningStatus가 있으면 서버 데이터와 비교하여 더 정확한 값 사용
    if (learningStatus) {
      const serverCompleted = learningStatus.completedProblems;
      const serverTotal = learningStatus.totalProblems;

      // 서버 데이터를 우선 사용하되, 로컬 데이터가 더 많으면 로컬 사용
      const finalCompleted = Math.max(actualCompleted, serverCompleted);
      const finalTotal = Math.max(totalCount, serverTotal);

      return {
        total: finalTotal,
        completed: finalCompleted,
        percentage: finalTotal > 0 ? Math.round((finalCompleted / finalTotal) * 100) : 0,
      };
    }

    // learningStatus가 없으면 로컬 상태 사용
    return {
      total: totalCount,
      completed: actualCompleted,
      percentage: totalCount > 0 ? Math.round((actualCompleted / totalCount) * 100) : 0,
    };
  }, [learningStatus, totalCount, completedProblems, problem]);

  // 문제 데이터 로드 및 진행 상태 복원
  useEffect(() => {
    const loadProblemData = async () => {
      if (initialProblem) {
        setProblem(initialProblem);

        // 이미 결과를 표시 중이면 진행 상태를 복원하지 않음
        if (showResult) {
          return;
        }

        // 이전 진행 상태 복원
        const savedProgress = getProgress(initialProblem.id);
        if (savedProgress) {
          setSelectedAnswer(savedProgress.selectedAnswer);
          setStartTime(new Date(savedProgress.startTime));
          // 이미 답을 선택했다면 결과 표시하지 않음
          setShowResult(false);
        } else {
          // 새로운 문제인 경우
          setStartTime(new Date());
          setSelectedAnswer('');
          setShowResult(false);
        }

        // 진행률 초기화 (필요한 경우)
        await initializeProgress(studyId, currentIndex, totalCount);
      }
    };

    loadProblemData();
  }, [
    initialProblem,
    studyId,
    currentIndex,
    totalCount,
    getProgress,
    initializeProgress,
    showResult,
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
        // 로컬 진행 상태 저장 (서버 요청 없음)
        if (startTime) {
          saveProgress(problemId, answer, startTime);
        }
      }
    },
    [showResult, startTime, saveProgress, problemId],
  );

  const handleSubmit = useCallback(() => {
    if (!problem || !selectedAnswer) return;

    // 로컬에서 정답 확인
    const correct = selectedAnswer === problem.correctAnswer;

    setIsCorrect(correct);
    setShowResult(true);

    // 문제 완료 상태 추가 및 정답/오답 정보 저장
    if (!completedProblems.includes(problem.id)) {
      const answerData = {
        isCorrect: correct,
        selectedAnswer: selectedAnswer,
        correctAnswer: problem.correctAnswer,
        problemTitle: problem.title,
        completedAt: new Date().toISOString(),
      };

      // 비동기로 문제 완료 처리 (진행률 즉시 업데이트)
      addCompletedProblem(problem.id, answerData);

      // 모든 문제를 다 풀었는지 확인 (로컬 상태 기준)
      const newCompletedCount = completedProblems.length + 1;
      if (newCompletedCount >= totalCount) {
        // 결과 표시 후 잠시 대기 후 결과 페이지로 이동
        setTimeout(() => {
          router.push(`/my/learning/${encodeURIComponent(studyId)}/results`);
        }, 3000);
      }
    }
  }, [
    problem,
    selectedAnswer,
    studyId,
    router,
    addCompletedProblem,
    completedProblems,
    totalCount,
  ]);

  const handleNext = useCallback(() => {
    // 해설 숨기기

    // 모든 문제를 다 풀었는지 확인
    if (learningStatus?.isCompleted) {
      router.push(`/my/learning/${encodeURIComponent(studyId)}/results`);
    } else if (nextProblem) {
      router.push(`/my/learning/${encodeURIComponent(studyId)}/problems/${nextProblem.id}`);
    } else {
      // 다음 문제가 없지만 아직 모든 문제를 완료하지 않은 경우
      router.push(`/my/learning/${encodeURIComponent(studyId)}/results`);
    }
  }, [nextProblem, router, studyId, learningStatus]);

  const handleRetry = useCallback(async () => {
    setSelectedAnswer('');
    setShowResult(false);
    setIsCorrect(false);
    setStartTime(new Date());
    setElapsedTime(0);

    // 문제를 다시 풀기 위해 completedProblems에서 제거
    if (problem && completedProblems.includes(problem.id)) {
      const updatedCompleted = completedProblems.filter((id) => id !== problem.id);
      setCompletedProblems(updatedCompleted);

      // 모든 시도 기록은 보존 - 새로운 시도로 기록됨
      // 학습 상태 다시 로드 (서버 데이터와 동기화)
      await loadLearningStatus();
    }
  }, [problem, completedProblems, setCompletedProblems, loadLearningStatus]);

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
          studyId={studyId}
          currentIndex={currentIndex}
          totalCount={totalCount}
          progressData={progressData}
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
