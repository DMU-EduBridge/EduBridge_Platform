import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface ChatExample {
  id: string;
  prompt: string;
  response: string;
  date: string;
  messageType: 'question' | 'translation' | 'explanation' | 'general';
  subject?: string;
}

interface ChatExamplesResponse {
  success: boolean;
  data: ChatExample[];
}

interface ChatRequest {
  question: string;
  messageType?: 'question' | 'translation' | 'explanation' | 'general';
  subject?: string;
}

/**
 * AI 어시스턴트 최근 대화 예시를 가져오는 훅
 */
export function useAIChatExamples() {
  return useQuery<ChatExamplesResponse>({
    queryKey: ['dashboard', 'ai-assistant', 'examples'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/ai-assistant');

      if (!response.ok) {
        throw new Error('AI 대화 예시를 가져오는데 실패했습니다.');
      }

      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10분
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * AI 어시스턴트 대화 예시 데이터를 가져오는 훅 (데이터만 반환)
 */
export function useAIChatExamplesData() {
  const { data, ...rest } = useAIChatExamples();

  return {
    ...rest,
    chatExamples: data?.data || [],
  };
}

/**
 * AI 어시스턴트에게 질문을 보내는 훅
 */
export function useAIChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chatData: ChatRequest) => {
      const response = await fetch('/api/dashboard/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatData),
      });

      if (!response.ok) {
        throw new Error('AI 질문 처리에 실패했습니다.');
      }

      return response.json();
    },
    onSuccess: () => {
      // AI 대화 예시 캐시 무효화 (새로운 대화가 추가됨)
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'ai-assistant', 'examples'] });
    },
  });
}
