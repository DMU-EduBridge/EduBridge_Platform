import { User } from './user';

export interface Class {
  id: string;
  name: string;
  description?: string | null;
  subject: string;
  gradeLevel: string;
  schoolYear: string;
  semester: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  createdBy: string;
  creator?: User;
  members?: ClassMember[];
  memberCount?: number;
}

export interface ClassMember {
  id: string;
  classId: string;
  userId: string;
  role: 'STUDENT' | 'ASSISTANT' | 'TEACHER';
  joinedAt: Date;
  leftAt?: Date | null;
  isActive: boolean;
  user?: User | null;
  class?: Class;
}

export interface CreateClassRequest {
  name: string;
  description?: string;
  subject: string;
  gradeLevel: string;
  schoolYear: string;
  semester: string;
}

export interface UpdateClassRequest {
  name?: string;
  description?: string;
  subject?: string;
  gradeLevel?: string;
  schoolYear?: string;
  semester?: string;
  isActive?: boolean;
}

export interface AddMemberRequest {
  userId: string;
  role?: 'STUDENT' | 'ASSISTANT' | 'TEACHER';
}

export interface ClassStats {
  totalMembers: number;
  activeMembers: number;
  totalAssignments: number;
  completedAssignments: number;
  averageProgress: number;
}

export interface ClassWithStats extends Class {
  stats: ClassStats;
}
