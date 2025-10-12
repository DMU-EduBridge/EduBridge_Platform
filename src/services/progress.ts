import { api } from '@/lib/core/api';
import { ProgressFilters } from '@/types/domain/progress';

export const studentProgressService = {
  getStudentDetailProgress: (studentId: string, filters?: ProgressFilters) =>
    api.get(`/students/${studentId}/progress`, { params: filters }).then((res) => res.data),
};
