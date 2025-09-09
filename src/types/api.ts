// API 응답 타입 정의
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 에러 응답 타입
export interface ApiError {
  error: string;
  success: false;
  statusCode?: number;
}

// 통계 응답 타입
export interface StatsResponse {
  totalProblems?: number;
  activeProblems?: number;
  bySubject?: Record<string, number>;
  byDifficulty?: Record<string, number>;
  totalStudents?: number;
  activeStudents?: number;
  byGrade?: Record<string, number>;
  averageScore?: number;
  completionRate?: number;
  totalReports?: number;
  completedReports?: number;
  pendingReports?: number;
}

// 문제 생성/수정 요청 타입
export interface CreateProblemRequest {
  title: string;
  description: string;
  content: string;
  subject: string;
  type: string;
  difficulty: string;
  options?: string[];
  correctAnswer: string;
  hints?: string[];
  tags?: string[];
}

export interface UpdateProblemRequest extends Partial<CreateProblemRequest> {
  id: string;
}

// 학생 생성/수정 요청 타입
export interface CreateStudentRequest {
  name: string;
  email: string;
  grade: string;
  subjects?: string[];
  learningStyle?: string[];
  interests?: string[];
}

export interface UpdateStudentRequest extends Partial<CreateStudentRequest> {
  id: string;
}

// 리포트 생성 요청 타입
export interface CreateReportRequest {
  title: string;
  type: string;
  period: string;
  studentIds?: string[];
  subjectIds?: string[];
}

// 학습 자료 생성/수정 요청 타입
export interface CreateLearningMaterialRequest {
  title: string;
  description?: string;
  content: string;
  subject: string;
  difficulty: string;
  estimatedTime?: number;
  files?: string[];
  status: string;
}

export interface UpdateLearningMaterialRequest extends Partial<CreateLearningMaterialRequest> {
  id: string;
}
