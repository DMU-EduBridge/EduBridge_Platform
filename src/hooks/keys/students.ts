export const studentKeys = {
  all: ['students'] as const,
  list: (params?: {
    search?: string;
    grade?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => ['students', 'list', params] as const,
  detail: (id: string) => ['students', 'detail', id] as const,
  progress: (id: string) => ['students', 'progress', id] as const,
  stats: ['students', 'stats'] as const,
};
