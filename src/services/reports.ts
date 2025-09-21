import { api } from '@/lib/core/api';
import type { Report } from '@/types/domain/report';

export const reportsService = {
  getReports: (params?: {
    type?: string;
    status?: string;
    page?: number;
    limit?: number;
    studentId?: string;
  }) => api.get<{ reports: Report[]; total: number }>('/reports', { params }),

  getReport: (id: string) => api.get<Report>(`/reports/${id}`),

  createReport: (data: {
    title: string;
    type: string;
    period: string;
    studentIds?: string[];
    subjectIds?: string[];
  }) => api.post<Report>('/reports', data),

  downloadReport: (id: string) =>
    api.get(`/reports/${id}/download`, {
      responseType: 'blob',
    }),

  getReportStats: () => api.get('/reports/stats'),
};
