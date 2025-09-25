import { logger } from '@/lib/monitoring';

export interface ChatbotMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatbotRequest {
  conversationId?: string;
  messages: ChatbotMessage[];
  subject?: string;
  gradeLevel?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatbotResponse {
  conversationId: string;
  message: ChatbotMessage;
  usage?: {
    tokensPrompt?: number;
    tokensCompletion?: number;
    tokensTotal?: number;
    costUsd?: number;
  };
}

/**
 * 챗봇 서비스
 * - 현재는 더미 응답을 반환합니다.
 * - 추후 LLM 클라이언트(OpenAI/Gemini)로 교체 가능하도록 인터페이스 고정
 */
export class ChatbotService {
  async chat(request: ChatbotRequest): Promise<ChatbotResponse> {
    // TODO: LLM 어댑터 연동 (OpenAI/Gemini). 현재는 에코 형태의 더미 응답
    const lastUserMessage = [...request.messages].reverse().find((m) => m.role === 'user');
    const content = lastUserMessage?.content || '무엇을 도와드릴까요?';

    const response: ChatbotResponse = {
      conversationId: request.conversationId || `conv_${Date.now()}`,
      message: {
        role: 'assistant',
        content: `요청을 잘 받았어요. 질문: ${content}`,
      },
      usage: {
        tokensPrompt: 0,
        tokensCompletion: 0,
        tokensTotal: 0,
        costUsd: 0,
      },
    };

    logger.info('chatbot_response', { conversationId: response.conversationId });
    return response;
  }
}

export const chatbotService = new ChatbotService();
