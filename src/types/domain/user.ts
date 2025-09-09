export interface User {
  id: string;
  email: string;
  name: string;
  role: 'PROFESSOR' | 'STUDENT' | 'ADMIN';
  avatar?: string;
  bio?: string;
  department?: string;
  researchAreas?: string[];
  studentId?: string;
  major?: string;
  year?: number;
  skills?: string[];
  portfolio?: string[];
  createdAt: Date;
  updatedAt: Date;
}
