import { UpdateProblemSchema } from '@/lib/validation/schemas';
import { z } from 'zod';

export class ProblemDetailService {
  async getProblemById(problemId: string) {
    // 실제 Prisma 쿼리로 대체해야 함
    // 현재는 시뮬레이션 데이터
    const problem = {
      id: problemId,
      title: '샘플 문제',
      description: '문제 설명',
      content: '문제 내용',
      type: 'MULTIPLE_CHOICE' as const,
      difficulty: 'MEDIUM' as const,
      subject: '수학',
      correctAnswer: 'A',
      explanation: '해설',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return problem;
  }

  async updateProblem(problemId: string, data: z.infer<typeof UpdateProblemSchema>) {
    // 실제 Prisma 업데이트로 대체해야 함
    const updatedProblem = {
      id: problemId,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return updatedProblem;
  }

  async deleteProblem(_problemId: string) {
    // 실제 Prisma 삭제로 대체해야 함
    return { success: true, message: 'Problem deleted successfully' };
  }
}

export const problemDetailService = new ProblemDetailService();
