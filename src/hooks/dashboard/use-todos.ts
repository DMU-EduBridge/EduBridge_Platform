import type { CreateTodoRequest, TodoListResponse, UpdateTodoRequest } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * 할 일 리스트를 가져오는 훅
 */
export function useTodos() {
  return useQuery<TodoListResponse>({
    queryKey: ['dashboard', 'todos'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/todos');

      if (!response.ok) {
        throw new Error('할 일 리스트를 가져오는데 실패했습니다.');
      }

      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2분
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * 할 일 리스트 데이터를 가져오는 훅 (데이터만 반환)
 */
export function useTodosData() {
  const { data, ...rest } = useTodos();

  return {
    ...rest,
    todos: data?.data || [],
  };
}

/**
 * 새 할 일을 생성하는 훅
 */
export function useCreateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (todoData: CreateTodoRequest) => {
      const response = await fetch('/api/dashboard/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todoData),
      });

      if (!response.ok) {
        throw new Error('할 일 생성에 실패했습니다.');
      }

      return response.json();
    },
    onSuccess: () => {
      // 할 일 리스트 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'todos'] });
    },
  });
}

/**
 * 할 일 완료 상태를 업데이트하는 훅
 */
export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (todoData: UpdateTodoRequest) => {
      const response = await fetch('/api/dashboard/todos', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(todoData),
      });

      if (!response.ok) {
        throw new Error('할 일 업데이트에 실패했습니다.');
      }

      return response.json();
    },
    onSuccess: () => {
      // 할 일 리스트 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'todos'] });
    },
  });
}
