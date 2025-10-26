// Assignment domain types
import { AssignmentStatus, AssignmentType } from '@prisma/client';

// Query parameter types used across hooks/services
export interface ClassQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  subject?: string;
  gradeLevel?: string;
  isActive?: boolean;
}

export interface ClassMemberQueryParams {
  classId?: string;
  userId?: string;
  role?: 'STUDENT' | 'ASSISTANT' | 'TEACHER';
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface ProblemAssignmentQueryParams {
  classId?: string;
  studentId?: string;
  assignmentType?: AssignmentType;
  status?: AssignmentStatus;
  page?: number;
  limit?: number;
}

export interface ProblemAssignment {
  id: string;
  title: string;
  description?: string;
  assignmentType: AssignmentType;
  status: AssignmentStatus;
  classId?: string;
  studentId?: string;
  problemIds: string[];
  dueDate?: Date;
  instructions?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
  class?: {
    id: string;
    name: string;
    subject: string;
    gradeLevel: string;
  };
  student?: {
    id: string;
    name: string;
    email: string;
  };
  problems?: {
    id: string;
    title: string;
    subject: string;
    difficulty: string;
  }[];
}

export interface CreateAssignmentRequest {
  title: string;
  description?: string;
  assignmentType: AssignmentType;
  classId?: string;
  studentId?: string;
  problemIds: string[];
  dueDate?: Date;
  instructions?: string;
  metadata?: any;
}

export interface UpdateAssignmentRequest {
  title?: string;
  description?: string;
  status?: AssignmentStatus;
  dueDate?: Date;
  instructions?: string;
  metadata?: any;
}

export interface AssignmentFilters {
  classId?: string;
  studentId?: string;
  assignmentType?: AssignmentType;
  status?: AssignmentStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface AssignmentStats {
  totalAssignments: number;
  activeAssignments: number;
  completedAssignments: number;
  overdueAssignments: number;
  assignmentsByType: Record<string, number>;
  assignmentsByClass: { classId: string; className: string; count: number }[];
}

// ===== Class member request types (used by class hooks/services) =====
export interface CreateClassMemberRequest {
  classId: string;
  userId: string;
  role?: 'STUDENT' | 'ASSISTANT' | 'TEACHER';
}

export interface UpdateClassMemberRequest {
  id: string;
  role?: 'STUDENT' | 'ASSISTANT' | 'TEACHER';
  isActive?: boolean;
  leftAt?: Date | null;
}

// ===== Aliases for backward compatibility in hooks =====
export type CreateProblemAssignmentRequest = CreateAssignmentRequest;
export type UpdateProblemAssignmentRequest = UpdateAssignmentRequest;

// ===== Problem Assignment Query Params =====
export interface ProblemAssignmentQueryParams {
  page?: number;
  limit?: number;
  classId?: string;
  problemId?: string;
  assignedBy?: string;
  isActive?: boolean;
  dueDate?: Date;
}
