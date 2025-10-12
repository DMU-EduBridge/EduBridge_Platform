export const reportKeys = {
  all: ['reports'] as const,
  lists: () => [...reportKeys.all, 'list'] as const,
  list: (params?: {
    type?: string | undefined;
    status?: string | undefined;
    page?: number;
    limit?: number;
    studentId?: string | undefined;
  }) => [...reportKeys.lists(), params] as const,
  details: () => [...reportKeys.all, 'detail'] as const,
  detail: (id: string) => [...reportKeys.details(), id] as const,
  stats: () => [...reportKeys.all, 'stats'] as const,
} as const;
