import { authOptions } from '@/lib/core/auth';
import { chatService } from '@/server/services/chat/chat.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// 채팅 세션 목록 조회
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await chatService.getUserChatSessions(session.user.id);
    const stats = await chatService.getChatStats(session.user.id);

    return NextResponse.json({
      success: true,
      data: {
        sessions,
        stats,
      },
    });
  } catch (error) {
    console.error('채팅 세션 조회 실패:', error);
    return NextResponse.json({ success: false, error: '채팅 세션 조회 실패' }, { status: 500 });
  }
}

// 새 채팅 세션 생성
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { title } = body;

    const newSession = await chatService.createChatSession(session.user.id, title);

    return NextResponse.json({
      success: true,
      data: newSession,
    });
  } catch (error) {
    console.error('채팅 세션 생성 실패:', error);
    return NextResponse.json({ success: false, error: '채팅 세션 생성 실패' }, { status: 500 });
  }
}
