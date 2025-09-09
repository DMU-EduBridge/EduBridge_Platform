import { api } from "@/lib/api";
import type { LMSReport } from "@/types/lms";

export const reportsService = {
  getReports: (params?: { type?: string; status?: string; page?: number; limit?: number }) =>
    api.get<{ reports: LMSReport[]; total: number }>("/reports", { params }),

  getReport: (id: string) => api.get<LMSReport>(`/reports/${id}`),

  createReport: (data: {
    title: string;
    type: string;
    period: string;
    studentIds?: string[];
    subjectIds?: string[];
  }) => api.post<LMSReport>("/reports", data),

  downloadReport: (id: string) =>
    api.get(`/reports/${id}/download`, {
      responseType: "blob",
    }),

  getReportStats: () => api.get("/reports/stats"),
};
