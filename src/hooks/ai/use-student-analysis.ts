import { aiLLMService } from '@/services/ai-llm';
import { useMutation } from '@tanstack/react-query';

export function useStudentAnalysis() {
  const analyze = useMutation({
    mutationFn: (userId: string) => aiLLMService.analyzeStudentPerformance(userId),
  });

  return { analyze };
}
