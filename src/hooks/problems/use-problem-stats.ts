import { problemsService } from '@/services/problems';
import { useQuery } from '@tanstack/react-query';
import { problemKeys } from '../keys/problems';

/**
 * 문제 통계를 가져오는 훅
 */
export function useProblemStats() {
  return useQuery({
    queryKey: problemKeys.stats,
    queryFn: () => problemsService.getProblemStats().then((r) => r.data),
  });
}
