import { authOptions } from '@/lib/core/auth';
import { chatService } from '@/server/services/chat/chat.service';
import { aiLLMService } from '@/services/ai-llm';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// 채팅 메시지 전송 및 AI 응답 받기
export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } },
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ success: false, error: '메시지가 필요합니다' }, { status: 400 });
    }

    // 사용자 메시지를 데이터베이스에 저장
    await chatService.addMessage(params.sessionId, message, 'USER');

    // 이전 대화 기록을 불러와 LLM에 전달할 히스토리 구성
    const currentSession = await chatService.getChatSession(params.sessionId, session.user.id);
    const history = (currentSession?.messages ?? []).map((m) => ({
      role: m.role === 'USER' ? 'user' : 'assistant',
      content: m.content,
      createdAt: m.createdAt,
    }));

    // 프로덕션 모드에서는 실제 AI 서비스 사용
    try {
      const aiResponse = await aiLLMService.chatMessage({
        userId: session.user.id,
        userMessage: message,
        history,
      });

      const aiMessage = aiResponse.ai_response || '죄송합니다. 응답을 생성할 수 없습니다.';

      // AI 응답을 데이터베이스에 저장
      await chatService.addMessage(params.sessionId, aiMessage, 'ASSISTANT');

      return NextResponse.json({
        success: true,
        data: {
          userMessage: message,
          aiResponse: aiMessage,
        },
      });
    } catch (aiError) {
      console.error('AI 응답 생성 실패:', aiError);

      // AI 응답 실패 시 기본 응답 저장
      const fallbackMessage =
        '죄송합니다. 현재 AI 서비스에 문제가 있습니다. 잠시 후 다시 시도해주세요.';
      await chatService.addMessage(params.sessionId, fallbackMessage, 'ASSISTANT');

      return NextResponse.json({
        success: true,
        data: {
          userMessage: message,
          aiResponse: fallbackMessage,
        },
      });
    }
  } catch (error) {
    console.error('채팅 메시지 처리 실패:', error);
    return NextResponse.json({ success: false, error: '메시지 전송 실패' }, { status: 500 });
  }
}
