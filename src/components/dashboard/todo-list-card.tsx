'use client';

import { Card } from '@/components/ui/card';
import { useTodosData, useUpdateTodo } from '@/hooks/dashboard/use-todos';
import { Check, Square } from 'lucide-react';
import { memo } from 'react';

export const TodoListCard = memo(function TodoListCard() {
  const { todos, isLoading, error } = useTodosData();
  const updateTodoMutation = useUpdateTodo();

  const toggleTodo = (id: string, currentCompleted: boolean) => {
    updateTodoMutation.mutate({
      id,
      completed: !currentCompleted,
    });
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">해야할 일 리스트</h2>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">로딩 중...</div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">해야할 일 리스트</h2>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-red-500">데이터를 불러오는데 실패했습니다.</div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">해야할 일 리스트</h2>

        <div className="space-y-3">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className="flex cursor-pointer items-center space-x-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
              onClick={() => toggleTodo(todo.id, todo.completed)}
            >
              <div className="flex-shrink-0">
                {todo.completed ? (
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-500">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                ) : (
                  <Square className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <span
                className={`flex-1 text-sm ${
                  todo.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                }`}
              >
                {todo.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
});
