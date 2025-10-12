export const studentKeys = {
  all: ['students'] as const,
  lists: () => [...studentKeys.all, 'list'] as const,
  list: (params?: {
    search?: string | undefined;
    grade?: string | undefined;
    status?: string | undefined;
    page?: number;
    limit?: number;
  }) => [...studentKeys.lists(), params] as const,
  details: () => [...studentKeys.all, 'detail'] as const,
  detail: (id: string) => [...studentKeys.details(), id] as const,
  progress: (id: string) => [...studentKeys.detail(id), 'progress'] as const,
  stats: () => [...studentKeys.all, 'stats'] as const,
} as const;
