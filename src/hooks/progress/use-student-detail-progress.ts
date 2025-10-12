import { studentProgressService } from '@/services/progress';
import { ProgressFilters } from '@/types/domain/progress';
import { useQuery } from '@tanstack/react-query';

export function useStudentDetailProgress(studentId: string, filters?: ProgressFilters) {
  return useQuery({
    queryKey: ['student-progress', studentId, filters],
    queryFn: () => studentProgressService.getStudentDetailProgress(studentId, filters),
    enabled: !!studentId,
  });
}
