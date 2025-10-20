import { aiLLMService } from '@/services/ai-llm';
import { useMutation } from '@tanstack/react-query';

export function useChatMessage() {
  const send = useMutation({
    mutationFn: (params: { userId: string; userMessage: string; history?: any[] }) =>
      aiLLMService.chatMessage(params),
  });

  return { send };
}
