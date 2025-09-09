export interface LMSProblem {
  id: string;
  title: string;
  subject: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
  type: "MULTIPLE_CHOICE" | "SHORT_ANSWER" | "ESSAY" | "CODING" | "MATH";
  questions: number;
  attempts: number;
  successRate: number;
  createdAt: string;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
}
