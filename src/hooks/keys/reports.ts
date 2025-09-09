export const reportKeys = {
  all: ['reports'] as const,
  list: (params?: { type?: string; status?: string; page?: number; limit?: number }) =>
    ['reports', 'list', params] as const,
  detail: (id: string) => ['reports', 'detail', id] as const,
  stats: ['reports', 'stats'] as const,
};
