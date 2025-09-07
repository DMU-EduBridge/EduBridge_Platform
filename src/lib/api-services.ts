import { api } from "./api";

// 타입 정의
export interface User {
  id: string;
  email: string;
  name: string;
  role: "TEACHER" | "STUDENT" | "ADMIN";
  avatar?: string;
  school?: string;
  department?: string;
  createdAt: string;
}

export interface Problem {
  id: string;
  title: string;
  subject: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
  type: "MULTIPLE_CHOICE" | "SHORT_ANSWER" | "ESSAY" | "CODING" | "MATH";
  questions: number;
  attempts: number;
  successRate: number;
  createdAt: string;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
}

export interface Student {
  id: string;
  name: string;
  email: string;
  grade: string;
  subjects: string[];
  progress: number;
  lastActivity: string;
  totalProblems: number;
  completedProblems: number;
  averageScore: number;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  joinDate: string;
}

export interface Report {
  id: string;
  title: string;
  type: "MONTHLY" | "INDIVIDUAL" | "SUBJECT" | "WEEKLY";
  period: string;
  students: number;
  totalProblems: number;
  averageScore: number;
  completionRate: number;
  insights: string[];
  recommendations: string[];
  status: "COMPLETED" | "IN_PROGRESS" | "PENDING";
  createdAt: string;
}

// 인증 관련 API
export const authApi = {
  login: (email: string, password: string) => api.post("/auth/login", { email, password }),

  register: (data: {
    name: string;
    email: string;
    password: string;
    role: string;
    school?: string;
    department?: string;
    phone?: string;
    location?: string;
  }) => api.post("/auth/register", data),

  logout: () => api.post("/auth/logout"),

  getProfile: () => api.get<User>("/auth/profile"),

  updateProfile: (data: Partial<User>) => api.put("/auth/profile", data),
};

// 문제 관리 API
export const problemsApi = {
  getProblems: (params?: {
    search?: string;
    subject?: string;
    difficulty?: string;
    page?: number;
    limit?: number;
  }) => api.get<{ problems: Problem[]; total: number }>("/problems", { params }),

  getProblem: (id: string) => api.get<Problem>(`/problems/${id}`),

  createProblem: (data: Omit<Problem, "id" | "createdAt" | "attempts" | "successRate">) =>
    api.post<Problem>("/problems", data),

  updateProblem: (id: string, data: Partial<Problem>) => api.put<Problem>(`/problems/${id}`, data),

  deleteProblem: (id: string) => api.delete(`/problems/${id}`),

  getProblemStats: () => api.get("/problems/stats"),
};

// 학생 관리 API
export const studentsApi = {
  getStudents: (params?: {
    search?: string;
    grade?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => api.get<{ students: Student[]; total: number }>("/students", { params }),

  getStudent: (id: string) => api.get<Student>(`/students/${id}`),

  updateStudent: (id: string, data: Partial<Student>) => api.put<Student>(`/students/${id}`, data),

  getStudentProgress: (id: string) => api.get(`/students/${id}/progress`),

  sendMessage: (id: string, message: string) => api.post(`/students/${id}/message`, { message }),

  getStudentStats: () => api.get("/students/stats"),
};

// 리포트 API
export const reportsApi = {
  getReports: (params?: { type?: string; status?: string; page?: number; limit?: number }) =>
    api.get<{ reports: Report[]; total: number }>("/reports", { params }),

  getReport: (id: string) => api.get<Report>(`/reports/${id}`),

  createReport: (data: {
    title: string;
    type: string;
    period: string;
    studentIds?: string[];
    subjectIds?: string[];
  }) => api.post<Report>("/reports", data),

  downloadReport: (id: string) =>
    api.get(`/reports/${id}/download`, {
      responseType: "blob",
    }),

  getReportStats: () => api.get("/reports/stats"),
};

// 학습 자료 API
export const learningApi = {
  getMaterials: (params?: {
    search?: string;
    subject?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => api.get("/learning-materials", { params }),

  getMaterial: (id: string) => api.get(`/learning-materials/${id}`),

  createMaterial: (data: any) => api.post("/learning-materials", data),

  updateMaterial: (id: string, data: any) => api.put(`/learning-materials/${id}`, data),

  deleteMaterial: (id: string) => api.delete(`/learning-materials/${id}`),

  getMaterialStats: () => api.get("/learning-materials/stats"),
};
