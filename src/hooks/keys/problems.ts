export const problemKeys = {
  all: ['problems'] as const,
  list: (params?: {
    search?: string;
    subject?: string;
    difficulty?: string;
    page?: number;
    limit?: number;
  }) => ['problems', 'list', params] as const,
  detail: (id: string) => ['problems', 'detail', id] as const,
  stats: ['problems', 'stats'] as const,
  solution: (id: string) => ['problems', 'solution', id] as const,
  attempt: (id: string) => ['problems', 'attempt', id] as const,
};
