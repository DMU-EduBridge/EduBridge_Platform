import { authOptions } from '@/lib/core/auth';
import { chatService } from '@/server/services/chat/chat.service';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET(
  _req: Request,
  { params }: { params: { sessionId: string } },
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sessionData = await chatService.getUserChatSessions(session.user.id);
    const targetSession = sessionData.find((s) => s.id === params.sessionId);

    if (!targetSession) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { session: targetSession } });
  } catch (error) {
    console.error('채팅 세션 조회 실패:', error);
    return NextResponse.json({ success: false, error: '채팅 세션 조회 실패' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { sessionId: string } },
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Ensure the user owns the session before deleting
    const sessionData = await chatService.getUserChatSessions(session.user.id);
    const targetSession = sessionData.find((s) => s.id === params.sessionId);

    if (!targetSession) {
      return NextResponse.json(
        { success: false, error: 'Session not found or unauthorized' },
        { status: 404 },
      );
    }

    await chatService.deleteChatSession(params.sessionId, session.user.id);
    return NextResponse.json({ success: true, data: null }, { status: 200 });
  } catch (error) {
    console.error('채팅 세션 삭제 실패:', error);
    return NextResponse.json({ success: false, error: '채팅 세션 삭제 실패' }, { status: 500 });
  }
}
