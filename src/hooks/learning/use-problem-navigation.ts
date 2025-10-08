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

  // wrongOnly/ids 파라미터 유지
  const wrongOnlyParam = useMemo(() => {
    const value = searchParams?.get('wrongOnly');
    return value === '1' || value === 'true';
  }, [searchParams]);

  const idsParam = useMemo(() => {
    const value = searchParams?.get('ids');
    return value ?? undefined;
  }, [searchParams]);

  const fromParam = useMemo(() => {
    const value = searchParams?.get('from');
    return value ?? undefined; // 'results' | 'incorrect'
  }, [searchParams]);

  const handleNext = useCallback(() => {
    const sp = new URLSearchParams();
    if (startNewAttemptParam) sp.set('startNewAttempt', '1');
    if (wrongOnlyParam) sp.set('wrongOnly', '1');
    if (idsParam) sp.set('ids', idsParam);
    const suffix = sp.toString() ? `?${sp.toString()}` : '';
    if (currentIndex < totalCount && nextProblem) {
      router.push(`/my/learning/${studyId}/problems/${nextProblem.id}${suffix}`);
    } else {
      // 마지막 문제인 경우: wrongOnly + 단일 ids면 출발지에 따라 복귀
      const isSingleWrongOnly =
        wrongOnlyParam && !!idsParam && idsParam.split(',').filter(Boolean).length === 1;
      if (isSingleWrongOnly) {
        if (fromParam === 'results') {
          router.push(`/my/learning/${studyId}/results${suffix}`);
        } else {
          router.push('/my/incorrect-answers');
        }
      } else {
        router.push(`/my/learning/${studyId}/results${suffix}`);
      }
    }
  }, [
    currentIndex,
    totalCount,
    nextProblem,
    studyId,
    router,
    startNewAttemptParam,
    wrongOnlyParam,
    idsParam,
    fromParam,
  ]);

  const handleBackToLearning = useCallback(() => {
    router.push('/my/learning');
  }, [router]);

  return {
    startNewAttemptParam,
    wrongOnlyParam,
    idsParam,
    fromParam,
    handleNext,
    handleBackToLearning,
  };
}
