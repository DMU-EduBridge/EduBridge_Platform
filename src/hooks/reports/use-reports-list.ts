import { reportsService } from '@/services/reports';
import { useQuery } from '@tanstack/react-query';
import { reportKeys } from '../keys/reports';

/**
 * 리포트 목록을 가져오는 훅
 * @param params 검색 및 필터 파라미터
 */
export function useReportsList(params?: {
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
  studentId?: string;
}) {
  return useQuery({
    queryKey: reportKeys.list(params),
    queryFn: () => reportsService.getReports(params).then((r) => r.data),
  });
}
