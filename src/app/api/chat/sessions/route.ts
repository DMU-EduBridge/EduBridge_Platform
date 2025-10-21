import { authOptions } from '@/lib/core/auth';
import { chatService } from '@/server/services/chat/chat.service';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sessions = await chatService.getUserChatSessions(session.user.id);
    return NextResponse.json({ success: true, data: { sessions } });
  } catch (error) {
    console.error('채팅 세션 조회 실패:', error);
    return NextResponse.json({ success: false, error: '채팅 세션 조회 실패' }, { status: 500 });
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title } = body;
    const newSession = await chatService.createChatSession(session.user.id, title || '새 대화');
    return NextResponse.json({ success: true, data: { session: newSession } });
  } catch (error) {
    console.error('채팅 세션 생성 실패:', error);
    return NextResponse.json({ success: false, error: '채팅 세션 생성 실패' }, { status: 500 });
  }
}
