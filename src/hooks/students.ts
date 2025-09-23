import { studentsService } from '@/services/students';
import type { Student } from '@/types/domain/student';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { studentKeys } from './keys/students';

export function useStudents(params?: {
  search?: string;
  grade?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const queryClient = useQueryClient();

  const studentsQuery = useQuery({
    queryKey: studentKeys.list(params),
    queryFn: () => studentsService.getStudents(params).then((r) => r.data),
  });

  const useStudent = (id: string) =>
    useQuery({
      queryKey: studentKeys.detail(id),
      queryFn: () => studentsService.getStudent(id).then((r) => r.data),
      enabled: !!id,
    });

  const useStudentProgress = (id: string) =>
    useQuery({
      queryKey: studentKeys.progress(id),
      queryFn: () => studentsService.getStudentProgress(id).then((r) => r.data),
      enabled: !!id,
    });

  const statsQuery = useQuery({
    queryKey: studentKeys.stats,
    queryFn: () => studentsService.getStudentStats().then((r) => r.data),
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
