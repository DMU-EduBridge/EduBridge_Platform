export interface LMSStudent {
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
