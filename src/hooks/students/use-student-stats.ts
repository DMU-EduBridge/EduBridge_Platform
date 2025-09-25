import { studentsService } from '@/services/students';
import { useQuery } from '@tanstack/react-query';
import { studentKeys } from '../keys/students';

/**
 * 학생 통계를 가져오는 훅
 */
export function useStudentStats() {
  return useQuery({
    queryKey: studentKeys.stats,
    queryFn: () => studentsService.getStudentStats().then((r) => r.data),
  });
}
