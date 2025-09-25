import { studentsService } from '@/services/students';
import { useQuery } from '@tanstack/react-query';
import { studentKeys } from '../keys/students';

/**
 * 학생 목록을 가져오는 훅
 * @param params 검색 및 필터 파라미터
 */
export function useStudentsList(params?: {
  search?: string;
  grade?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: studentKeys.list(params),
    queryFn: () => studentsService.getStudents(params).then((r) => r.data),
  });
}
