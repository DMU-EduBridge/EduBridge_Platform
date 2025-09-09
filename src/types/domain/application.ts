import type { Project } from './project';
import type { User } from './user';

export interface Application {
  id: string;
  projectId: string;
  project: Project;
  studentId: string;
  student: User;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  message?: string;
  resume?: string;
  portfolio: string[];
  createdAt: Date;
  updatedAt: Date;
}
