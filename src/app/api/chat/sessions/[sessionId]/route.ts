import { authOptions } from '@/lib/core/auth';
import { chatService } from '@/server/services/chat/chat.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// 특정 채팅 세션 조회
export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } },
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const chatSession = await chatService.getChatSession(params.sessionId, session.user.id);

    if (!chatSession) {
      return NextResponse.json(
        { success: false, error: '채팅 세션을 찾을 수 없습니다' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: chatSession,
    });
  } catch (error) {
    console.error('채팅 세션 조회 실패:', error);
    return NextResponse.json({ success: false, error: '채팅 세션 조회 실패' }, { status: 500 });
  }
}

// 채팅 세션 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: { sessionId: string } },
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const deleted = await chatService.deleteChatSession(params.sessionId, session.user.id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: '채팅 세션을 찾을 수 없습니다' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: '채팅 세션이 삭제되었습니다',
    });
  } catch (error) {
    console.error('채팅 세션 삭제 실패:', error);
    return NextResponse.json({ success: false, error: '채팅 세션 삭제 실패' }, { status: 500 });
  }
}
