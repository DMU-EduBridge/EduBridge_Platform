import { api } from "@/lib/api";
import type { LMSStudent } from "@/types/lms";

export const studentsService = {
  getStudents: (params?: {
    search?: string;
    grade?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => api.get<{ students: LMSStudent[]; total: number }>("/students", { params }),

  getStudent: (id: string) => api.get<LMSStudent>(`/students/${id}`),

  updateStudent: (id: string, data: Partial<LMSStudent>) =>
    api.put<LMSStudent>(`/students/${id}`, data),

  getStudentProgress: (id: string) => api.get(`/students/${id}/progress`),

  sendMessage: (id: string, message: string) => api.post(`/students/${id}/message`, { message }),

  getStudentStats: () => api.get("/students/stats"),
};
