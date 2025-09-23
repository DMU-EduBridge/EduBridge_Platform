// 시도(Attempt) 관련 타입 정의
export interface Attempt {
  id: string;
  userId: string;
  problemId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent?: number;
  createdAt: Date;
}
