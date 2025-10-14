import { reportsService } from '@/services/reports';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reportKeys } from '../keys/reports';

/**
 * 리포트 관리용 통합 훅
 * 관리 페이지에서 사용하는 모든 기능을 제공
 * @param params 검색 및 필터 파라미터
 */
export function useReports(params?: {
  type?: string | undefined;
  status?: string | undefined;
  page?: number;
  limit?: number;
  studentId?: string | undefined;
}) {
  const queryClient = useQueryClient();

  const reports = useQuery({
    queryKey: reportKeys.list(params),
    queryFn: () => reportsService.getReports(params),
  });

  const useReport = (id: string) =>
    useQuery({
      queryKey: reportKeys.detail(id),
      queryFn: () => reportsService.getReport(id),
      enabled: !!id,
    });

  const stats = useQuery({
    queryKey: reportKeys.stats(),
    queryFn: () => reportsService.getReportStats(),
  });

  const create = useMutation({
    mutationFn: reportsService.createReport,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reportKeys.all }),
  });

  const download = useMutation({ mutationFn: reportsService.downloadReport });

  return { reports, useReport, stats, create, download };
}
