import { problemsService } from '@/services/problems';
import { useQuery } from '@tanstack/react-query';
import { problemKeys } from '../keys/problems';

/**
 * 특정 문제를 가져오는 훅
 * @param id 문제 ID
 */
export function useProblem(id: string) {
  return useQuery({
    queryKey: problemKeys.detail(id),
    queryFn: () => problemsService.getProblem(id).then((r) => r.data),
    enabled: !!id,
  });
}
