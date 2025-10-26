import { problemFactory } from '@/lib/patterns/factory-pattern';
import { ProblemGenerationSchema } from '@/lib/validation/schemas';
import { z } from 'zod';

export class ProblemGenerationService {
  async generateProblems(_userId: string, data: z.infer<typeof ProblemGenerationSchema>) {
    // 실제 LLM 서비스와 연동해야 함
    // 현재는 시뮬레이션 데이터
    const { subject, difficulty, count } = data;

    const llmProblems = Array.from({ length: count }, (_, i) => ({
      question: `${subject} ${difficulty} 문제 ${i + 1}`,
      content: `${subject} 과목의 ${difficulty} 난이도 문제입니다.`,
      type: 'MULTIPLE_CHOICE' as const,
      difficulty,
      subject,
      options: ['A', 'B', 'C', 'D'],
      correct_answer: 0,
      explanation: '정답 해설입니다.',
      hint: '힌트입니다.',
    }));

    // Factory Pattern을 사용하여 문제 생성
    const problems = problemFactory.createBatch(
      llmProblems.map((llmData) => problemFactory.createFromLLM(llmData)),
    );

    return {
      problems,
      totalGenerated: count,
      successRate: 1.0,
      processingTime: 2000,
    };
  }
}

export const problemGenerationService = new ProblemGenerationService();
