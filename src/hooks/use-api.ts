import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, problemsApi, studentsApi, reportsApi, learningApi } from "../lib/api-services";
import type { User, Problem, Student, Report } from "../lib/api-services";

// Query Keys
export const queryKeys = {
  auth: {
    profile: ["auth", "profile"] as const,
  },
  problems: {
    all: ["problems"] as const,
    list: (params?: any) => ["problems", "list", params] as const,
    detail: (id: string) => ["problems", "detail", id] as const,
    stats: ["problems", "stats"] as const,
  },
  students: {
    all: ["students"] as const,
    list: (params?: any) => ["students", "list", params] as const,
    detail: (id: string) => ["students", "detail", id] as const,
    progress: (id: string) => ["students", "progress", id] as const,
    stats: ["students", "stats"] as const,
  },
  reports: {
    all: ["reports"] as const,
    list: (params?: any) => ["reports", "list", params] as const,
    detail: (id: string) => ["reports", "detail", id] as const,
    stats: ["reports", "stats"] as const,
  },
  learning: {
    all: ["learning-materials"] as const,
    list: (params?: any) => ["learning-materials", "list", params] as const,
    detail: (id: string) => ["learning-materials", "detail", id] as const,
    stats: ["learning-materials", "stats"] as const,
  },
};

// 인증 관련 훅
export const useAuth = () => {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: () => authApi.getProfile().then((res: any) => res.data),
    enabled: false, // 수동으로 호출
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (response: any) => {
      // 토큰 저장
      if (typeof window !== "undefined") {
        localStorage.setItem("auth-token", response.data.token);
      }
      // 프로필 정보 다시 가져오기
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile });
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth-token");
      }
      queryClient.clear();
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile });
    },
  });

  return {
    profile: profileQuery,
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
    updateProfile: updateProfileMutation,
  };
};

// 문제 관리 훅
export const useProblems = (params?: any) => {
  const queryClient = useQueryClient();

  const problemsQuery = useQuery({
    queryKey: queryKeys.problems.list(params),
    queryFn: () => problemsApi.getProblems(params).then((res: any) => res.data),
  });

  const problemQuery = (id: string) =>
    useQuery({
      queryKey: queryKeys.problems.detail(id),
      queryFn: () => problemsApi.getProblem(id).then((res: any) => res.data),
      enabled: !!id,
    });

  const statsQuery = useQuery({
    queryKey: queryKeys.problems.stats,
    queryFn: () => problemsApi.getProblemStats().then((res: any) => res.data),
  });

  const createMutation = useMutation({
    mutationFn: problemsApi.createProblem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.problems.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Problem> }) =>
      problemsApi.updateProblem(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.problems.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.problems.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: problemsApi.deleteProblem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.problems.all });
    },
  });

  return {
    problems: problemsQuery,
    problem: problemQuery,
    stats: statsQuery,
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
  };
};

// 학생 관리 훅
export const useStudents = (params?: any) => {
  const queryClient = useQueryClient();

  const studentsQuery = useQuery({
    queryKey: queryKeys.students.list(params),
    queryFn: () => studentsApi.getStudents(params).then((res: any) => res.data),
  });

  const studentQuery = (id: string) =>
    useQuery({
      queryKey: queryKeys.students.detail(id),
      queryFn: () => studentsApi.getStudent(id).then((res: any) => res.data),
      enabled: !!id,
    });

  const progressQuery = (id: string) =>
    useQuery({
      queryKey: queryKeys.students.progress(id),
      queryFn: () => studentsApi.getStudentProgress(id).then((res: any) => res.data),
      enabled: !!id,
    });

  const statsQuery = useQuery({
    queryKey: queryKeys.students.stats,
    queryFn: () => studentsApi.getStudentStats().then((res: any) => res.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Student> }) =>
      studentsApi.updateStudent(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      studentsApi.sendMessage(id, message),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.students.detail(id) });
    },
  });

  return {
    students: studentsQuery,
    student: studentQuery,
    progress: progressQuery,
    stats: statsQuery,
    update: updateMutation,
    sendMessage: sendMessageMutation,
  };
};

// 리포트 훅
export const useReports = (params?: any) => {
  const queryClient = useQueryClient();

  const reportsQuery = useQuery({
    queryKey: queryKeys.reports.list(params),
    queryFn: () => reportsApi.getReports(params).then((res: any) => res.data),
  });

  const reportQuery = (id: string) =>
    useQuery({
      queryKey: queryKeys.reports.detail(id),
      queryFn: () => reportsApi.getReport(id).then((res: any) => res.data),
      enabled: !!id,
    });

  const statsQuery = useQuery({
    queryKey: queryKeys.reports.stats,
    queryFn: () => reportsApi.getReportStats().then((res: any) => res.data),
  });

  const createMutation = useMutation({
    mutationFn: reportsApi.createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });
    },
  });

  const downloadMutation = useMutation({
    mutationFn: reportsApi.downloadReport,
  });

  return {
    reports: reportsQuery,
    report: reportQuery,
    stats: statsQuery,
    create: createMutation,
    download: downloadMutation,
  };
};

// 학습 자료 훅
export const useLearningMaterials = (params?: any) => {
  const queryClient = useQueryClient();

  const materialsQuery = useQuery({
    queryKey: queryKeys.learning.list(params),
    queryFn: () => learningApi.getMaterials(params).then((res) => res.data),
  });

  const materialQuery = (id: string) =>
    useQuery({
      queryKey: queryKeys.learning.detail(id),
      queryFn: () => learningApi.getMaterial(id).then((res) => res.data),
      enabled: !!id,
    });

  const statsQuery = useQuery({
    queryKey: queryKeys.learning.stats,
    queryFn: () => learningApi.getMaterialStats().then((res) => res.data),
  });

  const createMutation = useMutation({
    mutationFn: learningApi.createMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.learning.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => learningApi.updateMaterial(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.learning.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.learning.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: learningApi.deleteMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.learning.all });
    },
  });

  return {
    materials: materialsQuery,
    material: materialQuery,
    stats: statsQuery,
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
  };
};
