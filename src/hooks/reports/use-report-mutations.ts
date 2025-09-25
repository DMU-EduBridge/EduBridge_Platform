import { reportsService } from '@/services/reports';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reportKeys } from '../keys/reports';

/**
 * 리포트 생성 뮤테이션 훅
 */
export function useCreateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reportsService.createReport,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reportKeys.all }),
  });
}

/**
 * 리포트 다운로드 뮤테이션 훅
 */
export function useDownloadReport() {
  return useMutation({
    mutationFn: reportsService.downloadReport,
  });
}
