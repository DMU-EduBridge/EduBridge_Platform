import type { User } from './user';

export interface Project {
  id: string;
  title: string;
  description: string;
  status:
    | 'DRAFT'
    | 'SUBMITTED'
    | 'REVIEWED'
    | 'ACCEPTED'
    | 'REJECTED'
    | 'IN_PROGRESS'
    | 'COMPLETED';
  professorId: string;
  professor: User;
  researchArea: string;
  keywords: string[];
  requirements: string[];
  duration?: number;
  maxParticipants: number;
  startDate?: Date;
  endDate?: Date;
  attachments: string[];
  githubRepo?: string;
  driveFolder?: string;
  createdAt: Date;
  updatedAt: Date;
}
