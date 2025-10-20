import { api } from '@/lib/core/api';
import type { Student } from '@/types/domain/student';

export const studentsService = {
  getStudents: (params?: {
    search?: string | undefined;
    grade?: string | undefined;
    status?: string | undefined;
    page?: number;
    limit?: number;
  }) => api.get('/students', { params }).then((res) => res.data),

  getStudent: (id: string) => api.get(`/students/${id}`).then((res) => res.data),

  updateStudent: (id: string, data: Partial<Student>) =>
    api.put(`/students/${id}`, data).then((res) => res.data),

  getStudentProgress: (id: string) => api.get(`/students/${id}/progress`).then((res) => res.data),

  sendMessage: (id: string, message: string) =>
    api.post(`/students/${id}/message`, { message }).then((res) => res.data),

  getStudentStats: () => api.get('/students/stats').then((res) => res.data),

  inviteStudent: (data: { name: string; email: string; gradeLevel: string; message?: string }) =>
    api.post('/students/invite', data).then((res) => res.data),

  deleteStudent: (id: string) => api.delete(`/students?studentId=${id}`).then((res) => res.data),
};
