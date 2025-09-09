export const learningKeys = {
  all: ['learning-materials'] as const,
  list: (params?: {
    search?: string;
    subject?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => ['learning-materials', 'list', params] as const,
  detail: (id: string) => ['learning-materials', 'detail', id] as const,
  stats: ['learning-materials', 'stats'] as const,
};
