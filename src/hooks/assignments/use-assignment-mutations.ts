import {
  CreateAssignmentRequest,
  ProblemAssignment,
  UpdateAssignmentRequest,
} from '@/types/domain/assignment';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const createAssignment = async (data: CreateAssignmentRequest): Promise<ProblemAssignment> => {
  const response = await fetch('/api/assignments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '배정 생성에 실패했습니다');
  }

  return response.json();
};

const updateAssignment = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateAssignmentRequest;
}): Promise<ProblemAssignment> => {
  const response = await fetch(`/api/assignments/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '배정 수정에 실패했습니다');
  }

  return response.json();
};

const deleteAssignment = async (id: string): Promise<void> => {
  const response = await fetch(`/api/assignments/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '배정 삭제에 실패했습니다');
  }
};

export const useAssignmentMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateAssignment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assignment', data.id] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });

  return {
    createAssignment: createMutation.mutateAsync,
    updateAssignment: updateMutation.mutateAsync,
    deleteAssignment: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  };
};
