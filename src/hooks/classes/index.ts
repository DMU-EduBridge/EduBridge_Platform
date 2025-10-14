import { classService } from '@/server/services/class';
import type {
  ClassMemberQueryParams,
  ClassQueryParams,
  CreateClassMemberRequest,
  CreateProblemAssignmentRequest,
  ProblemAssignmentQueryParams,
  UpdateClassMemberRequest,
  UpdateProblemAssignmentRequest,
} from '@/types/domain/assignment';
import type { CreateClassRequest, UpdateClassRequest } from '@/types/domain/class';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// ===== 쿼리 키 =====
export const classKeys = {
  all: ['classes'] as const,
  lists: () => [...classKeys.all, 'list'] as const,
  list: (params: ClassQueryParams) => [...classKeys.lists(), params] as const,
  details: () => [...classKeys.all, 'detail'] as const,
  detail: (id: string) => [...classKeys.details(), id] as const,
  members: () => [...classKeys.all, 'members'] as const,
  memberList: (params: ClassMemberQueryParams) => [...classKeys.members(), 'list', params] as const,
  memberDetail: (id: string) => [...classKeys.members(), 'detail', id] as const,
  assignments: () => [...classKeys.all, 'assignments'] as const,
  assignmentList: (params: ProblemAssignmentQueryParams) =>
    [...classKeys.assignments(), 'list', params] as const,
  assignmentDetail: (id: string) => [...classKeys.assignments(), 'detail', id] as const,
  userClasses: (userId: string) => [...classKeys.all, 'user', userId] as const,
  classStats: (classId: string) => [...classKeys.all, 'stats', classId] as const,
  studentPerformance: (studentId: string, classId: string) =>
    [...classKeys.all, 'performance', studentId, classId] as const,
};

// ===== 클래스 관련 훅들 =====

/**
 * 클래스 목록 조회 훅
 */
export const useClasses = (params: ClassQueryParams = {}) => {
  return useQuery({
    queryKey: classKeys.list(params),
    queryFn: () => classService.getClasses(params),
    staleTime: 5 * 60 * 1000, // 5분
  });
};

/**
 * 클래스 상세 조회 훅
 */
export const useClass = (id: string) => {
  return useQuery({
    queryKey: classKeys.detail(id),
    queryFn: () => classService.getClassById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * 사용자 클래스 목록 조회 훅
 */
export const useUserClasses = (userId: string) => {
  return useQuery({
    queryKey: classKeys.userClasses(userId),
    queryFn: () => classService.getUserClasses(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * 클래스 통계 조회 훅
 */
export const useClassStats = (classId: string) => {
  return useQuery({
    queryKey: classKeys.classStats(classId),
    queryFn: () => classService.getClassStats(classId),
    enabled: !!classId,
    staleTime: 2 * 60 * 1000, // 2분
  });
};

/**
 * 학생 클래스 내 성취도 조회 훅
 */
export const useStudentClassPerformance = (studentId: string, classId: string) => {
  return useQuery({
    queryKey: classKeys.studentPerformance(studentId, classId),
    queryFn: () => classService.getStudentPerformanceInClass(classId),
    enabled: !!classId,
    staleTime: 2 * 60 * 1000,
  });
};

// ===== 클래스 멤버 관련 훅들 =====

/**
 * 클래스 멤버 목록 조회 훅
 */
export const useClassMembers = (params: ClassMemberQueryParams = {}) => {
  return useQuery({
    queryKey: classKeys.memberList(params),
    queryFn: () => classService.getClassMembers(params),
    staleTime: 5 * 60 * 1000,
  });
};

// ===== 문제 할당 관련 훅들 =====

/**
 * 문제 할당 목록 조회 훅
 */
export const useProblemAssignments = (params: ProblemAssignmentQueryParams = {}) => {
  return useQuery({
    queryKey: classKeys.assignmentList(params),
    queryFn: () => classService.getProblemAssignments(params),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * 클래스별 할당된 문제 목록 조회 훅
 */
export const useClassAssignments = (classId: string) => {
  return useQuery({
    queryKey: [...classKeys.assignments(), 'class', classId],
    queryFn: () => classService.getProblemAssignments({ classId }),
    enabled: !!classId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * 학생별 할당된 문제 목록 조회 훅
 */
export const useStudentAssignments = (studentId: string) => {
  return useQuery({
    queryKey: [...classKeys.assignments(), 'student', studentId],
    queryFn: () => classService.getProblemAssignments({ studentId }),
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000,
  });
};

// ===== 뮤테이션 훅들 =====

/**
 * 클래스 생성 뮤테이션
 */
export const useCreateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, createdBy }: { data: CreateClassRequest; createdBy: string }) =>
      classService.createClass(data, createdBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
    },
  });
};

/**
 * 클래스 수정 뮤테이션
 */
export const useUpdateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClassRequest }) =>
      classService.updateClass(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: classKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
    },
  });
};

/**
 * 클래스 삭제 뮤테이션
 */
export const useDeleteClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => classService.deleteClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.lists() });
    },
  });
};

/**
 * 클래스 멤버 추가 뮤테이션
 */
export const useAddClassMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClassMemberRequest) => classService.addClassMember(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: classKeys.memberList({ classId: data.classId }) });
      queryClient.invalidateQueries({ queryKey: classKeys.detail(data.classId) });
    },
  });
};

/**
 * 클래스 멤버 수정 뮤테이션
 */
export const useUpdateClassMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClassMemberRequest }) =>
      classService.updateClassMember(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: classKeys.memberDetail(id) });
      queryClient.invalidateQueries({ queryKey: classKeys.members() });
    },
  });
};

/**
 * 클래스 멤버 제거 뮤테이션
 */
export const useRemoveClassMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => classService.removeClassMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.members() });
    },
  });
};

/**
 * 문제 할당 뮤테이션
 */
export const useAssignProblem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      assignedBy,
    }: {
      data: CreateProblemAssignmentRequest;
      assignedBy: string;
    }) => classService.assignProblem(data, assignedBy),
    onSuccess: (_, { data }) => {
      if (data.classId) {
        queryClient.invalidateQueries({
          queryKey: classKeys.assignmentList({ classId: data.classId }),
        });
        queryClient.invalidateQueries({ queryKey: classKeys.detail(data.classId) });
      } else {
        queryClient.invalidateQueries({ queryKey: classKeys.assignments() });
      }
    },
  });
};

/**
 * 문제 할당 수정 뮤테이션
 */
export const useUpdateProblemAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProblemAssignmentRequest }) =>
      classService.updateProblemAssignment(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: classKeys.assignmentDetail(id) });
      queryClient.invalidateQueries({ queryKey: classKeys.assignments() });
    },
  });
};

/**
 * 문제 할당 취소 뮤테이션
 */
export const useCancelProblemAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => classService.removeProblemAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: classKeys.assignments() });
    },
  });
};

// ===== 통합 훅들 =====

/**
 * 클래스 관리 통합 훅
 */
export const useClassManagement = (classId?: string) => {
  const classQuery = useClass(classId || '');
  const membersQuery = useClassMembers(classId ? { classId } : {});
  const assignmentsQuery = useClassAssignments(classId || '');
  const statsQuery = useClassStats(classId || '');

  return {
    class: classQuery,
    members: membersQuery,
    assignments: assignmentsQuery,
    stats: statsQuery,
    isLoading:
      classQuery.isLoading ||
      membersQuery.isLoading ||
      assignmentsQuery.isLoading ||
      statsQuery.isLoading,
    error: classQuery.error || membersQuery.error || assignmentsQuery.error || statsQuery.error,
  };
};

/**
 * 학생 학습 관리 통합 훅
 */
export const useStudentLearning = (studentId: string, classId?: string) => {
  const userClassesQuery = useUserClasses(studentId);
  const assignmentsQuery = useStudentAssignments(studentId);
  const performanceQuery = useStudentClassPerformance(studentId, classId || '');

  return {
    classes: userClassesQuery,
    assignments: assignmentsQuery,
    performance: performanceQuery,
    isLoading:
      userClassesQuery.isLoading || assignmentsQuery.isLoading || performanceQuery.isLoading,
    error: userClassesQuery.error || assignmentsQuery.error || performanceQuery.error,
  };
};
