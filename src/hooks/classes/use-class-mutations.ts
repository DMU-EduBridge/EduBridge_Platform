import { ClassWithStats, CreateClassRequest, UpdateClassRequest } from '@/types/domain/class';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CreateClassResponse {
  success: boolean;
  data: ClassWithStats;
}

interface UpdateClassResponse {
  success: boolean;
  data: ClassWithStats;
}

interface DeleteClassResponse {
  success: boolean;
  data: { message: string };
}

export function useClassMutations() {
  const queryClient = useQueryClient();

  const createClass = useMutation<CreateClassResponse, Error, CreateClassRequest>({
    mutationFn: async (data) => {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '클래스 생성에 실패했습니다');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });

  const updateClass = useMutation<
    UpdateClassResponse,
    Error,
    { classId: string; data: UpdateClassRequest }
  >({
    mutationFn: async ({ classId, data }) => {
      const response = await fetch(`/api/classes/${classId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '클래스 수정에 실패했습니다');
      }

      return response.json();
    },
    onSuccess: (_, { classId }) => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['class', classId] });
    },
  });

  const deleteClass = useMutation<DeleteClassResponse, Error, string>({
    mutationFn: async (classId) => {
      const response = await fetch(`/api/classes/${classId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '클래스 삭제에 실패했습니다');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });

  return {
    createClass,
    updateClass,
    deleteClass,
  };
}
