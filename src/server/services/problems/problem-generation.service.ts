import { ProblemGenerationSchema } from '@/lib/validation/schemas';
import { z } from 'zod';

export class ProblemGenerationService {
  async generateProblems(_userId: string, data: z.infer<typeof ProblemGenerationSchema>) {
    // 실제 LLM 서비스와 연동해야 함
    // 현재는 시뮬레이션 데이터
    const { subject, difficulty, count } = data;

    const questions = Array.from({ length: count }, (_, i) => ({
      id: `generated_${Date.now()}_${i}`,
      title: `${subject} ${difficulty} 문제 ${i + 1}`,
      content: `${subject} 과목의 ${difficulty} 난이도 문제입니다.`,
      type: 'MULTIPLE_CHOICE' as const,
      difficulty,
      subject,
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 'A',
      explanation: '정답 해설입니다.',
      qualityScore: 0.8,
      isValid: true,
    }));

    return {
      questions,
      totalGenerated: count,
      successRate: 1.0,
      processingTime: 2000,
    };
  }
}

export const problemGenerationService = new ProblemGenerationService();
