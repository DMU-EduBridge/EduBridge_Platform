import { reportsService } from '@/services/reports';
import { useQuery } from '@tanstack/react-query';
import { reportKeys } from '../keys/reports';

/**
 * 특정 리포트를 가져오는 훅
 * @param id 리포트 ID
 */
export function useReport(id: string) {
  return useQuery({
    queryKey: reportKeys.detail(id),
    queryFn: () => reportsService.getReport(id).then((r) => r.data),
    enabled: !!id,
  });
}

/**
 * 리포트 통계를 가져오는 훅
 */
export function useReportStats() {
  return useQuery({
    queryKey: reportKeys.stats(),
    queryFn: () => reportsService.getReportStats().then((r) => r.data),
  });
}
