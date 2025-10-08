import { ChatRequestSchema } from '@/lib/validation/schemas';
import { z } from 'zod';

export class AiAssistantService {
  async getChatExamples(userId: string) {
    // 실제 데이터베이스에서 가져올 최근 대화 예시 (현재는 시뮬레이션)
    const chatExamples = [
      {
        id: '1',
        prompt: '교과서 영어 문제를 해석해줘',
        response: 'Hello, my name is lily',
        date: '9월 20일',
        messageType: 'translation' as const,
        subject: '영어',
      },
      {
        id: '2',
        prompt: '확률과 통계 기출 문제 풀이 좀 해줄래?',
        response: '확률과 통계 순열 부분 문제의 답을 알려줘.',
        date: '9월 26일',
        messageType: 'explanation' as const,
        subject: '수학',
      },
    ];

    return chatExamples;
  }

  async processChatRequest(userId: string, data: z.infer<typeof ChatRequestSchema>) {
    const { question, messageType, subject } = data;

    // 실제 AI 서비스와 연동할 부분 (현재는 시뮬레이션)
    let response = '';

    switch (messageType) {
      case 'translation':
        response = '영어 번역 결과: ' + question;
        break;
      case 'explanation':
        response = '문제 해설: ' + question + '에 대한 상세한 설명입니다.';
        break;
      case 'question':
        response = '질문에 대한 답변: ' + question + '에 대해 답변드리겠습니다.';
        break;
      default:
        response = 'AI 어시스턴트가 도와드리겠습니다: ' + question;
    }

    // 실제 데이터베이스에 저장할 대화 데이터
    const chatMessage = {
      id: Date.now().toString(),
      prompt: question,
      response,
      date: new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }),
      messageType,
      subject,
      createdAt: new Date().toISOString(),
    };

    return chatMessage;
  }
}

export const aiAssistantService = new AiAssistantService();
