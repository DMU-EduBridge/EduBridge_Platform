import { api } from '@/lib/core/api';
import type { Student } from '@/types/domain/student';

export const studentsService = {
  getStudents: (params?: {
    search?: string;
    grade?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => api.get<{ students: Student[]; total: number }>('/students', { params }),

  getStudent: (id: string) => api.get<Student>(`/students/${id}`),

  updateStudent: (id: string, data: Partial<Student>) => api.put<Student>(`/students/${id}`, data),

  getStudentProgress: (id: string) => api.get(`/students/${id}/progress`),

  sendMessage: (id: string, message: string) => api.post(`/students/${id}/message`, { message }),

  getStudentStats: () => api.get('/students/stats'),
};
