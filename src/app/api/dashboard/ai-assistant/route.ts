import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

interface ChatMessage {
  id: string;
  prompt: string;
  response: string;
  date: string;
  messageType: 'question' | 'translation' | 'explanation' | 'general';
  subject?: string;
  createdAt: string;
}

interface ChatExample {
  id: string;
  prompt: string;
  response: string;
  date: string;
  messageType: 'question' | 'translation' | 'explanation' | 'general';
  subject?: string;
}

const ChatRequestSchema = z.object({
  question: z.string().min(1, '질문을 입력해주세요'),
  messageType: z.enum(['question', 'translation', 'explanation', 'general']).default('question'),
  subject: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // 실제 데이터베이스에서 가져올 최근 대화 예시 (현재는 시뮬레이션)
    const chatExamples: ChatExample[] = [
      {
        id: '1',
        prompt: '교과서 영어 문제를 해석해줘',
        response: 'Hello, my name is lily',
        date: '9월 20일',
        messageType: 'translation',
        subject: '영어',
      },
      {
        id: '2',
        prompt: '확률과 통계 기출 문제 풀이 좀 해줄래?',
        response: '확률과 통계 순열 부분 문제의 답을 알려줘.',
        date: '9월 26일',
        messageType: 'explanation',
        subject: '수학',
      },
    ];

    logger.info('AI 어시스턴트 대화 예시 조회 성공', { userId: session.user.id });

    return NextResponse.json({
      success: true,
      data: chatExamples,
    });
  } catch (error) {
    logger.error('AI 어시스턴트 대화 예시 조회 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: 'AI 어시스턴트 대화 예시 조회에 실패했습니다.' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = ChatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const { question, messageType, subject } = parsed.data;

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
    const chatMessage: ChatMessage = {
      id: Date.now().toString(),
      prompt: question,
      response,
      date: new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' }),
      messageType,
      subject,
      createdAt: new Date().toISOString(),
    };

    logger.info('AI 어시스턴트 질문 처리 성공', {
      userId: session.user.id,
      messageId: chatMessage.id,
      messageType,
      subject,
    });

    return NextResponse.json({
      success: true,
      data: chatMessage,
    });
  } catch (error) {
    logger.error('AI 어시스턴트 질문 처리 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'AI 어시스턴트 질문 처리에 실패했습니다.' }, { status: 500 });
  }
}
