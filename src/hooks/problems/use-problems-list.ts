import { problemsService } from '@/services/problems';
import { useQuery } from '@tanstack/react-query';
import { problemKeys } from '../keys/problems';

/**
 * 문제 목록을 가져오는 훅
 * @param params 검색 및 필터 파라미터
 */
export function useProblemsList(params?: {
  search?: string;
  subject?: string;
  difficulty?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: problemKeys.list(params),
    queryFn: () => problemsService.getProblems(params).then((r) => r.data),
  });
}
