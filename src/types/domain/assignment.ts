// Assignment domain types
import { AssignmentStatus, AssignmentType } from '@prisma/client';

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
