import { aiQuestionGenerationService } from '@/services/ai-question-generation';
import { QuestionGenerationRequest } from '@/types/ai-question-generation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useAIQuestionGeneration() {
  const queryClient = useQueryClient();

  const generateQuestions = useMutation({
    mutationFn: (request: QuestionGenerationRequest) =>
      aiQuestionGenerationService.generateQuestions(request),
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`${data.data.length}개의 문제가 생성되었습니다.`);
      } else {
        toast.error('문제 생성 실패', {
          description: data.error || '알 수 없는 오류가 발생했습니다.',
        });
      }
    },
    onError: (error: any) => {
      toast.error('문제 생성 실패', {
        description: error.message || 'AI 문제 생성 중 오류가 발생했습니다.',
      });
    },
  });

  const saveQuestions = useMutation({
    mutationFn: ({ questions, createdBy }: { questions: any[]; createdBy: string }) =>
      aiQuestionGenerationService.saveGeneratedQuestions(questions, createdBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems'] });
      toast.success('생성된 문제가 저장되었습니다.');
    },
    onError: (error: any) => {
      toast.error('문제 저장 실패', {
        description: error.message || '문제 저장 중 오류가 발생했습니다.',
      });
    },
  });

  return {
    generateQuestions,
    saveQuestions,
  };
}
