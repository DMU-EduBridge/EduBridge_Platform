import { MessageCreateSchema, MessageUpdateSchema } from '@/lib/validation/schemas';
import { z } from 'zod';

export class MessagesService {
  async getMessages(_userId: string) {
    // 실제 데이터베이스에서 가져올 데이터 (현재는 시뮬레이션)
    const messages = [
      {
        id: '1',
        sender: '김학생',
        senderId: 'student_kim',
        message: '너 이거 다 풀었어?? 나 좀 알려주라 ㅜㅜ',
        hasNotification: true,
        notificationCount: 1,
        isRead: false,
        messageType: 'question' as const,
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
        messageType: 'reminder' as const,
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
        messageType: 'reminder' as const,
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
        messageType: 'general' as const,
        createdAt: '2024-01-20T11:45:00Z',
        updatedAt: '2024-01-20T11:45:00Z',
      },
    ];

    return messages;
  }

  async createMessage(
    userId: string,
    data: z.infer<typeof MessageCreateSchema>,
    senderName: string,
  ) {
    const { recipientId: _recipientId, message, messageType } = data;

    // 실제 데이터베이스에 저장할 데이터
    const newMessage = {
      id: Date.now().toString(),
      sender: senderName,
      senderId: userId,
      message,
      hasNotification: true,
      notificationCount: 1,
      isRead: false,
      messageType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return newMessage;
  }

  async updateMessage(_userId: string, data: z.infer<typeof MessageUpdateSchema>) {
    const { id, isRead } = data;

    // 실제 데이터베이스에서 업데이트할 데이터
    const updatedMessage = {
      id,
      sender: '업데이트된 발신자',
      senderId: 'updated_sender',
      message: '업데이트된 메시지',
      hasNotification: !isRead,
      notificationCount: isRead ? 0 : 1,
      isRead,
      messageType: 'general' as const,
      createdAt: '2024-01-20T09:00:00Z',
      updatedAt: new Date().toISOString(),
    };

    return updatedMessage;
  }
}

export const messagesService = new MessagesService();
