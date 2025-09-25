import { studentsService } from '@/services/students';
import { useQuery } from '@tanstack/react-query';
import { studentKeys } from '../keys/students';

/**
 * 특정 학생을 가져오는 훅
 * @param id 학생 ID
 */
export function useStudent(id: string) {
  return useQuery({
    queryKey: studentKeys.detail(id),
    queryFn: () => studentsService.getStudent(id).then((r) => r.data),
    enabled: !!id,
  });
}

/**
 * 학생 진행 상황을 가져오는 훅
 * @param id 학생 ID
 */
export function useStudentProgress(id: string) {
  return useQuery({
    queryKey: studentKeys.progress(id),
    queryFn: () => studentsService.getStudentProgress(id).then((r) => r.data),
    enabled: !!id,
  });
}
