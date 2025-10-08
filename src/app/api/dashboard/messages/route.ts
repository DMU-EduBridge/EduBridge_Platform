import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

interface Message {
  id: string;
  sender: string;
  senderId: string;
  message: string;
  hasNotification: boolean;
  notificationCount?: number;
  isRead: boolean;
  messageType: 'question' | 'announcement' | 'reminder' | 'general';
  createdAt: string;
  updatedAt: string;
}

const MessageCreateSchema = z.object({
  recipientId: z.string(),
  message: z.string().min(1, '메시지 내용을 입력해주세요'),
  messageType: z.enum(['question', 'announcement', 'reminder', 'general']).default('general'),
});

const MessageUpdateSchema = z.object({
  id: z.string(),
  isRead: z.boolean(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // 실제 데이터베이스에서 가져올 데이터 (현재는 시뮬레이션)
    const messages: Message[] = [
      {
        id: '1',
        sender: '김학생',
        senderId: 'student_kim',
        message: '너 이거 다 풀었어?? 나 좀 알려주라 ㅜㅜ',
        hasNotification: true,
        notificationCount: 1,
        isRead: false,
        messageType: 'question',
        createdAt: '2024-01-20T14:30:00Z',
        updatedAt: '2024-01-20T14:30:00Z',
      },
      {
        id: '2',
        sender: '수학 김땡땡 선생님',
        senderId: 'teacher_math_kim',
        message: '오늘 모의고사 점수 알려주세요~~',
        hasNotification: false,
        isRead: true,
        messageType: 'reminder',
        createdAt: '2024-01-20T13:15:00Z',
        updatedAt: '2024-01-20T13:15:00Z',
      },
      {
        id: '3',
        sender: '영어 리아나 선생님',
        senderId: 'teacher_english_riana',
        message: '오답노트 고쳐주세요 !!!',
        hasNotification: false,
        isRead: true,
        messageType: 'reminder',
        createdAt: '2024-01-20T12:00:00Z',
        updatedAt: '2024-01-20T12:00:00Z',
      },
      {
        id: '4',
        sender: '신학생',
        senderId: 'student_new',
        message: '나 오늘 모의고사 점수 등록해야 하는데 하기 싫어 ㅜㅜ',
        hasNotification: false,
        isRead: true,
        messageType: 'general',
        createdAt: '2024-01-20T11:45:00Z',
        updatedAt: '2024-01-20T11:45:00Z',
      },
    ];

    logger.info('메시지 조회 성공', { userId: session.user.id, count: messages.length });

    return NextResponse.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    logger.error('메시지 조회 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '메시지 조회에 실패했습니다.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = MessageCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const { recipientId, message, messageType } = parsed.data;

    // 실제 데이터베이스에 저장할 데이터
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: session.user.name || '익명',
      senderId: session.user.id,
      message,
      hasNotification: true,
      notificationCount: 1,
      isRead: false,
      messageType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    logger.info('메시지 생성 성공', {
      userId: session.user.id,
      messageId: newMessage.id,
      recipientId,
    });

    return NextResponse.json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    logger.error('메시지 생성 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '메시지 생성에 실패했습니다.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = MessageUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const { id, isRead } = parsed.data;

    // 실제 데이터베이스에서 업데이트할 데이터
    const updatedMessage: Message = {
      id,
      sender: '업데이트된 발신자',
      senderId: 'updated_sender',
      message: '업데이트된 메시지',
      hasNotification: !isRead,
      notificationCount: isRead ? 0 : 1,
      isRead,
      messageType: 'general',
      createdAt: '2024-01-20T09:00:00Z',
      updatedAt: new Date().toISOString(),
    };

    logger.info('메시지 업데이트 성공', { userId: session.user.id, messageId: id, isRead });

    return NextResponse.json({
      success: true,
      data: updatedMessage,
    });
  } catch (error) {
    logger.error('메시지 업데이트 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '메시지 업데이트에 실패했습니다.' }, { status: 500 });
  }
}
