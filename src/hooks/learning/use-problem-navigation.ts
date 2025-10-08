import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

interface UseProblemNavigationProps {
  studyId: string;
  currentIndex: number;
  totalCount: number;
  nextProblem?: { id: string } | undefined;
}

export function useProblemNavigation({
  studyId,
  currentIndex,
  totalCount,
  nextProblem,
}: UseProblemNavigationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const startNewAttemptParam = useMemo(() => {
    const value = searchParams?.get('startNewAttempt');
    return value === '1' || value === 'true';
  }, [searchParams]);

  const handleNext = useCallback(() => {
    const suffix = startNewAttemptParam ? '?startNewAttempt=1' : '';
    if (currentIndex < totalCount && nextProblem) {
      router.push(`/my/learning/${studyId}/problems/${nextProblem.id}${suffix}`);
    } else {
      // 마지막 문제인 경우 결과 페이지로 이동
      router.push(`/my/learning/${studyId}/results${suffix}`);
    }
  }, [currentIndex, totalCount, nextProblem, studyId, router, startNewAttemptParam]);

  const handleBackToLearning = useCallback(() => {
    router.push('/my/learning');
  }, [router]);

  return {
    startNewAttemptParam,
    handleNext,
    handleBackToLearning,
  };
}
