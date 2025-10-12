import { api } from '@/lib/core/api';

export const reportsService = {
  getReports: (params?: {
    type?: string | undefined;
    status?: string | undefined;
    page?: number;
    limit?: number;
    studentId?: string | undefined;
  }) => api.get('/reports', { params }).then((res) => res.data),

  getReport: (id: string) => api.get(`/reports/${id}`).then((res) => res.data),
  getReportDetail: (id: string) => api.get(`/reports/${id}/detail`).then((res) => res.data),

  createReport: (data: {
    title: string;
    type: string;
    period: string;
    studentIds?: string[];
    subjectIds?: string[];
  }) => api.post('/reports', data).then((res) => res.data),

  downloadReport: (id: string) =>
    api
      .get(`/reports/${id}/download`, {
        responseType: 'blob',
      })
      .then((res) => res.data),

  getReportStats: () => api.get('/reports/stats').then((res) => res.data),
  // 단일 상세 API만 유지
};
