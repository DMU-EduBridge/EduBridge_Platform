import {
  CreateTeacherReportRequest,
  ReportGenerationOptions,
  UpdateTeacherReportRequest,
} from '@/types/domain/teacher-report';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CreateReportResponse {
  success: boolean;
  data: any;
}

interface UpdateReportResponse {
  success: boolean;
  data: any;
}

interface GenerateReportResponse {
  success: boolean;
  data: any;
}

interface DeleteReportResponse {
  success: boolean;
  data: { message: string };
}

export function useTeacherReportMutations() {
  const queryClient = useQueryClient();

  const createReport = useMutation<CreateReportResponse, Error, CreateTeacherReportRequest>({
    mutationFn: async (data) => {
      const response = await fetch('/api/teacher-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '리포트 생성에 실패했습니다');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-reports'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-report-stats'] });
    },
  });

  const updateReport = useMutation<
    UpdateReportResponse,
    Error,
    { reportId: string; data: UpdateTeacherReportRequest }
  >({
    mutationFn: async ({ reportId, data }) => {
      const response = await fetch(`/api/teacher-reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '리포트 수정에 실패했습니다');
      }

      return response.json();
    },
    onSuccess: (_, { reportId }) => {
      queryClient.invalidateQueries({ queryKey: ['teacher-reports'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-report-detail', reportId] });
    },
  });

  const generateReport = useMutation<
    GenerateReportResponse,
    Error,
    { reportId: string; options: ReportGenerationOptions }
  >({
    mutationFn: async ({ reportId, options }) => {
      const response = await fetch(`/api/teacher-reports/${reportId}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '리포트 생성에 실패했습니다');
      }

      return response.json();
    },
    onSuccess: (_, { reportId }) => {
      queryClient.invalidateQueries({ queryKey: ['teacher-reports'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-report-detail', reportId] });
      queryClient.invalidateQueries({ queryKey: ['teacher-report-stats'] });
    },
  });

  const deleteReport = useMutation<DeleteReportResponse, Error, string>({
    mutationFn: async (reportId) => {
      const response = await fetch(`/api/teacher-reports/${reportId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '리포트 삭제에 실패했습니다');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-reports'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-report-stats'] });
    },
  });

  return {
    createReport,
    updateReport,
    generateReport,
    deleteReport,
  };
}
