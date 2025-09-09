export interface LMSReport {
  id: string;
  title: string;
  type: "MONTHLY" | "INDIVIDUAL" | "SUBJECT" | "WEEKLY";
  period: string;
  students: number;
  totalProblems: number;
  averageScore: number;
  completionRate: number;
  insights: string[];
  recommendations: string[];
  status: "COMPLETED" | "IN_PROGRESS" | "PENDING";
  createdAt: string;
}
