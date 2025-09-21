// 리포트 관련 타입 정의
export type ReportType = 'MONTHLY' | 'INDIVIDUAL' | 'SUBJECT' | 'WEEKLY' | 'FULL' | 'SUMMARY';
export type ReportStatus = 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'FAILED';

export interface Report {
  id: string;
  title: string;
  type: ReportType;
  period: string;
  content?: string;
  insights?: string[];
  recommendations?: string[];
  strengths?: string[];
  weaknesses?: string[];
  status: ReportStatus;
  studentId?: string;
  teacherId?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  // 추가 속성들
  students?: number;
  totalProblems?: number;
  averageScore?: number;
  completionRate?: number;
}

// Teacher Report 전용 타입
export interface TeacherReport {
  id: string;
  teacherId: string;
  title: string;
  content: string;
  reportType: 'FULL' | 'SUMMARY';
  classInfo: {
    grade: number;
    class: number;
    subject: string;
    teacher: string;
  };
  studentCount: number;
  analysis?: any;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
