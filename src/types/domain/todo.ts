export type TodoPriority = 'high' | 'medium' | 'low';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  priority: TodoPriority;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  // 서버 원장에는 없을 수 있는 화면 보조 필드들은 UI 타입에서 확장합니다
}

export interface CreateTodoRequest {
  text: string;
  priority?: TodoPriority;
  dueDate?: string;
  category?: string;
  description?: string;
}

export interface UpdateTodoRequest {
  id: string;
  completed: boolean;
}

// UI 전용 확장 타입 (컴포넌트에서만 사용)
export type UITodo = Todo & {
  category?: string;
  description?: string;
};

export interface TodoListResponse {
  success: boolean;
  data: Todo[];
}
