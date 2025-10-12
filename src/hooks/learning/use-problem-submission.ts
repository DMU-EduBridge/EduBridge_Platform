import { useCallback, useRef, useState } from 'react';

interface Problem {
  id: string;
  title: string;
  correctAnswer: string;
  points: number;
  options: string[];
}

interface UseProblemSubmissionProps {
  problem?: Problem | undefined;
  activeAttemptNumber: number;
  addCompletedProblem: (data: any) => Promise<any>;
  onSubmissionComplete?: (isCorrect: boolean) => void;
}

export function useProblemSubmission({
  problem,
  activeAttemptNumber,
  addCompletedProblem,
  onSubmissionComplete,
}: UseProblemSubmissionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const startTimeRef = useRef<Date>(new Date());
  const initialStartNewAttemptRef = useRef(false);

  const handleAnswerSelect = useCallback(
    (answer: string, index: number) => {
      if (!showResult) {
        console.log('handleAnswerSelect 호출:', { answer, index });
        // 인덱스+1을 문자열로 변환하여 저장
        const selectedAnswerValue = (index + 1).toString();
        setSelectedAnswer(selectedAnswerValue);
        setSelectedIndex(index);
        console.log('selectedAnswer 설정됨:', selectedAnswerValue);
      }
    },
    [showResult],
  );

  const handleSubmit = useCallback(async () => {
    if (!problem || !selectedAnswer || activeAttemptNumber <= 0 || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 로컬에서 정답 확인 - 인덱스 기반으로 비교
      const correctAnswerIndex = problem.options.findIndex(
        (option) => option === problem.correctAnswer,
      );
      const correct = selectedIndex === correctAnswerIndex;
      setIsCorrect(correct);
      setShowResult(true);

      const elapsedSeconds = Math.max(
        Math.floor((new Date().getTime() - startTimeRef.current.getTime()) / 1000),
        0,
      );

      // 문제 완료 상태 추가 및 정답/오답 정보 저장
      console.log('제출 전 데이터 확인:', { selectedAnswer, correctAnswer: problem.correctAnswer });
      const answerData = {
        isCorrect: correct,
        selectedAnswer: selectedAnswer,
        correctAnswer: problem.correctAnswer,
        problemTitle: problem.title,
        completedAt: new Date().toISOString(),
      };

      await addCompletedProblem({
        problemId: problem.id,
        answer: answerData,
        attemptNumber: activeAttemptNumber,
        startTime: startTimeRef.current.toISOString(),
        timeSpent: elapsedSeconds,
        forceNewAttempt: initialStartNewAttemptRef.current,
      });

      initialStartNewAttemptRef.current = false;
      onSubmissionComplete?.(correct);
    } catch (error) {
      console.error('문제 제출 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    problem,
    selectedAnswer,
    activeAttemptNumber,
    isSubmitting,
    addCompletedProblem,
    onSubmissionComplete,
  ]);

  const resetSubmission = useCallback(() => {
    setSelectedAnswer('');
    setShowResult(false);
    setIsCorrect(false);
    setIsSubmitting(false);
    startTimeRef.current = new Date();
  }, []);

  const setInitialStartNewAttempt = useCallback((value: boolean) => {
    initialStartNewAttemptRef.current = value;
  }, []);

  return {
    selectedAnswer,
    showResult,
    isCorrect,
    isSubmitting,
    handleAnswerSelect,
    handleSubmit,
    resetSubmission,
    setInitialStartNewAttempt,
  };
}
