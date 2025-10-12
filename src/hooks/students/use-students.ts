import { studentsService } from '@/services/students';
import type { Student } from '@/types/domain/student';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studentKeys } from '../keys/students';

/**
 * 학생 관리용 통합 훅
 * 관리 페이지에서 사용하는 모든 기능을 제공
 * @param params 검색 및 필터 파라미터
 */
export function useStudents(params?: {
  search?: string | undefined;
  grade?: string | undefined;
  status?: string | undefined;
  page?: number;
  limit?: number;
}) {
  const queryClient = useQueryClient();

  const studentsQuery = useQuery({
    queryKey: studentKeys.list(params),
    queryFn: () => studentsService.getStudents(params),
  });

  const useStudent = (id: string) =>
    useQuery({
      queryKey: studentKeys.detail(id),
      queryFn: () => studentsService.getStudent(id),
      enabled: !!id,
    });

  const useStudentProgress = (id: string) =>
    useQuery({
      queryKey: studentKeys.progress(id),
      queryFn: () => studentsService.getStudentProgress(id),
      enabled: !!id,
    });

  const statsQuery = useQuery({
    queryKey: studentKeys.stats,
    queryFn: () => studentsService.getStudentStats(),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Student> }) =>
      studentsService.updateStudent(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
    },
  });

  const sendMessage = useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      studentsService.sendMessage(id, message),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(id) });
    },
  });

  return {
    students: studentsQuery,
    student: useStudent,
    progress: useStudentProgress,
    stats: statsQuery,
    update,
    sendMessage,
  };
}
