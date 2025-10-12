'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCreateTodo, useTodosData, useUpdateTodo } from '@/hooks/dashboard/use-todos';
import { ArrowLeft, Calendar, Check, Clock, Plus, Square } from 'lucide-react';
import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// 타입 정의
interface UITodo {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  category?: string;
  description?: string;
}

interface TodoData {
  todos: UITodo[];
  categories: string[];
  stats: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  };
}

interface TodoListDetailClientProps {
  session: Session;
  initialData: TodoData | null;
}

export function TodoListDetailClient({
  session: _session,
  initialData,
}: TodoListDetailClientProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [newTodo, setNewTodo] = useState('');
  const [newCategory, setNewCategory] = useState<string>('기타');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newDueDate, setNewDueDate] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // React Query로 데이터 가져오기 (초기 데이터는 서버에서 제공)
  const { todos = [], isLoading, error } = useTodosData();
  const todosTyped = todos as unknown as UITodo[];
  const updateTodoMutation = useUpdateTodo();
  const createTodoMutation = useCreateTodo();

  // 초기 데이터에서 categories와 stats 추출 (실제로는 API에서 가져와야 함)
  const categories: string[] = initialData?.categories || [
    '시험 준비',
    '복습',
    '예습',
    '과제',
    '기타',
  ];
  const stats = {
    total: todosTyped.length,
    completed: todosTyped.filter((todo: UITodo) => todo.completed).length,
    pending: todosTyped.filter((todo: UITodo) => !todo.completed).length,
    overdue: 0,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600">데이터를 불러오는데 실패했습니다.</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 할 일 토글 함수 (React Query mutation 사용)
  const toggleTodo = (id: string) => {
    const todo = todosTyped.find((t: UITodo) => t.id === id);
    if (todo) {
      updateTodoMutation.mutate({
        id,
        completed: !todo.completed,
      });
    }
  };

  // 새 할 일 추가 함수 (API 호출)
  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!newTodo.trim()) {
      setErrorMessage('할 일 내용을 입력해주세요.');
      return;
    }

    try {
      await createTodoMutation.mutateAsync({
        text: newTodo,
        priority: newPriority,
        category: newCategory,
        description: newDescription,
        ...(newDueDate ? { dueDate: newDueDate } : {}),
      });
      setNewTodo('');
      setNewCategory('기타');
      setNewDescription('');
      setNewPriority('medium');
      setNewDueDate('');
    } catch (error) {
      console.error('할 일 추가 실패:', error);
      setErrorMessage('할 일 추가에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  // 카테고리별 필터링
  const filteredTodos =
    selectedCategory === '전체'
      ? todosTyped
      : todosTyped.filter((todo: UITodo) => todo.category === selectedCategory);

  // 우선순위별 정렬
  const sortedTodos = filteredTodos.sort((a: UITodo, b: UITodo) => {
    const priorityOrder: Record<'high' | 'medium' | 'low', number> = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return '높음';
      case 'medium':
        return '보통';
      case 'low':
        return '낮음';
      default:
        return '보통';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              뒤로가기
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">할 일 목록</h1>
              <p className="mt-2 text-gray-600">나의 할 일을 관리하고 체크해보세요</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 pt-0">
        {/* 할 일 목록 */}
        <Card className="p-6">
          <div className="space-y-6 p-6">
            {/* 상단 카테고리 필터 한 줄 배치 */}
            <div className="flex flex-wrap gap-2 rounded-lg bg-gray-50 p-3">
              <button
                onClick={() => setSelectedCategory('전체')}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  selectedCategory === '전체'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                전체 ({stats.total})
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {category} ({todosTyped.filter((t: UITodo) => t.category === category).length})
                </button>
              ))}
            </div>

            {/* 새 할 일 추가 */}
            <form onSubmit={addTodo} className="space-y-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                <div className="md:col-span-6">
                  <label className="mb-1 block text-xs text-gray-600">할 일</label>
                  <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="예: 수학 복습하기"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    disabled={createTodoMutation.isPending}
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="mb-1 block text-xs text-gray-600">카테고리</label>
                  <input
                    list="todo-categories"
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="예: 과제 / 복습 / 기타"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    disabled={createTodoMutation.isPending}
                  />
                  <datalist id="todo-categories">
                    {categories.map((c) => (
                      <option value={c} key={c} />
                    ))}
                  </datalist>
                </div>
                <div className="md:col-span-3">
                  <label className="mb-1 block text-xs text-gray-600">우선순위</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as 'high' | 'medium' | 'low')}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    disabled={createTodoMutation.isPending}
                  >
                    <option value="high">높음</option>
                    <option value="medium">보통</option>
                    <option value="low">낮음</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                <div className="md:col-span-9">
                  <label className="mb-1 block text-xs text-gray-600">설명(선택)</label>
                  <input
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="예: 내일까지 2단원까지"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    disabled={createTodoMutation.isPending}
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="mb-1 block text-xs text-gray-600">마감일(선택)</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    disabled={createTodoMutation.isPending}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={createTodoMutation.isPending}
                className="flex w-full items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {createTodoMutation.isPending ? '추가 중...' : '추가'}
              </Button>
            </form>

            {errorMessage && <div className="text-sm text-red-600">{errorMessage}</div>}

            {/* 할 일 목록 */}
            <div className="space-y-3">
              {sortedTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-start gap-4 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                >
                  <button onClick={() => toggleTodo(todo.id)} className="mt-1 flex-shrink-0">
                    {todo.completed ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-500">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    ) : (
                      <Square className="h-5 w-5 text-gray-400" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3
                          className={`text-lg font-medium ${
                            todo.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                          }`}
                        >
                          {todo.text}
                        </h3>
                        {todo.description && (
                          <p className="mt-1 text-sm text-gray-600">{todo.description}</p>
                        )}
                      </div>

                      <div className="ml-4 flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(todo.priority)}`}
                        >
                          {getPriorityText(todo.priority)}
                        </span>
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                          {todo.category || '기타'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          마감:{' '}
                          {todo.dueDate
                            ? new Date(todo.dueDate).toLocaleDateString('ko-KR')
                            : '미정'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>생성: {new Date(todo.createdAt).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {sortedTodos.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-gray-500">할 일이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
