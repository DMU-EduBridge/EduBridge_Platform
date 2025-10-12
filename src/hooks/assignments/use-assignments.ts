import { AssignmentFilters, ProblemAssignment } from '@/types/domain/assignment';
import { useQuery } from '@tanstack/react-query';

const fetchAssignments = async (filters: AssignmentFilters = {}): Promise<ProblemAssignment[]> => {
  const params = new URLSearchParams();

  if (filters.classId) params.append('classId', filters.classId);
  if (filters.studentId) params.append('studentId', filters.studentId);
  if (filters.assignmentType) params.append('assignmentType', filters.assignmentType);
  if (filters.status) params.append('status', filters.status);
  if (filters.startDate) params.append('startDate', filters.startDate.toISOString());
  if (filters.endDate) params.append('endDate', filters.endDate.toISOString());

  const response = await fetch(`/api/assignments?${params.toString()}`);
  if (!response.ok) {
    throw new Error('배정 목록을 불러오는데 실패했습니다');
  }
  return response.json();
};

export const useAssignments = (filters: AssignmentFilters = {}) => {
  return useQuery({
    queryKey: ['assignments', filters],
    queryFn: () => fetchAssignments(filters),
    staleTime: 5 * 60 * 1000, // 5분
  });
};
