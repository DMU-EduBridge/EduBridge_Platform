import { studentsService } from '@/services/students';
import type { Student } from '@/types/domain/student';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studentKeys } from '../keys/students';

/**
 * 학생 초대 뮤테이션 훅
 */
export function useInviteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; email: string; gradeLevel: string; message?: string }) =>
      studentsService.inviteStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
    },
  });
}

/**
 * 학생 삭제 뮤테이션 훅
 */
export function useDeleteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => studentsService.deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
    },
  });
}

/**
 * 학생 정보 수정 뮤테이션 훅
 */
export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Student> }) =>
      studentsService.updateStudent(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: studentKeys.all });
    },
  });
}

/**
 * 학생에게 메시지 전송 뮤테이션 훅
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      studentsService.sendMessage(id, message),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: studentKeys.detail(id) });
    },
  });
}

/**
 * 학생 관련 모든 뮤테이션을 제공하는 통합 훅
 */
export function useStudentMutations() {
  const updateStudent = useUpdateStudent();
  const sendMessage = useSendMessage();
  const inviteStudent = useInviteStudent();
  const deleteStudent = useDeleteStudent();

  return {
    updateStudent,
    sendMessage,
    inviteStudent,
    deleteStudent,
  };
}
