import { authOptions } from '@/lib/core/auth';
import { chatService } from '@/server/services/chat/chat.service';
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

    // 실제 LLM 서버 호출
    const fastApiUrl =
      process.env.NEXT_PUBLIC_FASTAPI_URL?.replace(/\/$/, '') || 'http://localhost:8000';
    const upstreamUrl = `${fastApiUrl}/chat/message`;

    const requestBody = {
      user_id: session.user.id,
      user_message: message,
      history,
    };

    console.log('LLM 서버로 전송하는 데이터:', JSON.stringify(requestBody, null, 2));

    const res = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': session.user.id,
      },
      body: JSON.stringify(requestBody),
    });

    let aiMessage = '죄송합니다. 응답을 생성할 수 없습니다.';

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      aiMessage = data.ai_response || aiMessage;
    } else {
      const errorText = await res.text().catch(() => '');
      console.error('LLM 서버 응답 실패:', {
        status: res.status,
        statusText: res.statusText,
        error: errorText,
        url: upstreamUrl,
        requestBody: requestBody,
      });
    }

    // AI 응답을 데이터베이스에 저장
    await chatService.addMessage(params.sessionId, aiMessage, 'ASSISTANT');

    return NextResponse.json({
      success: true,
      data: {
        userMessage: message,
        aiResponse: aiMessage,
      },
    });
  } catch (error) {
    console.error('채팅 메시지 처리 실패:', error);
    return NextResponse.json({ success: false, error: '메시지 전송 실패' }, { status: 500 });
  }
}
