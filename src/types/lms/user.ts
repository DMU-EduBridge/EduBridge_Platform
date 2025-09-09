export interface LMSUser {
  id: string;
  email: string;
  name: string;
  role: 'TEACHER' | 'STUDENT' | 'ADMIN';
  avatar?: string;
  school?: string;
  department?: string;
  createdAt: string;
}
