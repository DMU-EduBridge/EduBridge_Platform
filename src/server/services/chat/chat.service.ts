import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ChatSessionData {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: {
    id: string;
    content: string;
    role: 'USER' | 'ASSISTANT' | 'SYSTEM';
    createdAt: Date;
  }[];
}

export interface ChatStats {
  totalChats: number;
  totalMessages: number;
  averageMessagesPerChat: number;
  mostActiveDay: string;
}

export const chatService = {
  // 사용자의 모든 채팅 세션 조회
  async getUserChatSessions(userId: string): Promise<ChatSessionData[]> {
    try {
      const sessions = await prisma.chatSession.findMany({
        where: { userId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              content: true,
              role: true,
              createdAt: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      return sessions.map((session) => ({
        id: session.id,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        messages: session.messages,
      }));
    } catch (error) {
      console.error('채팅 세션 조회 실패:', error);
      return [];
    }
  },

  // 특정 채팅 세션 조회
  async getChatSession(sessionId: string, userId: string): Promise<ChatSessionData | null> {
    try {
      const session = await prisma.chatSession.findFirst({
        where: { id: sessionId, userId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              content: true,
              role: true,
              createdAt: true,
            },
          },
        },
      });

      if (!session) return null;

      return {
        id: session.id,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        messages: session.messages,
      };
    } catch (error) {
      console.error('채팅 세션 조회 실패:', error);
      return null;
    }
  },

  // 새 채팅 세션 생성
  async createChatSession(userId: string, title?: string): Promise<ChatSessionData> {
    try {
      const session = await prisma.chatSession.create({
        data: {
          userId,
          title: title || '새 대화',
        },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            select: {
              id: true,
              content: true,
              role: true,
              createdAt: true,
            },
          },
        },
      });

      return {
        id: session.id,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        messages: session.messages,
      };
    } catch (error) {
      console.error('채팅 세션 생성 실패:', error);
      throw error;
    }
  },

  // 채팅 메시지 추가
  async addMessage(sessionId: string, content: string, role: 'USER' | 'ASSISTANT'): Promise<void> {
    try {
      await prisma.chatMessage.create({
        data: {
          sessionId,
          content,
          role,
        },
      });

      // 세션 업데이트 시간 갱신
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { updatedAt: new Date() },
      });
    } catch (error) {
      console.error('메시지 추가 실패:', error);
      throw error;
    }
  },

  // 채팅 세션 삭제
  async deleteChatSession(sessionId: string, userId: string): Promise<boolean> {
    try {
      const result = await prisma.chatSession.deleteMany({
        where: { id: sessionId, userId },
      });
      return result.count > 0;
    } catch (error) {
      console.error('채팅 세션 삭제 실패:', error);
      return false;
    }
  },

  // 채팅 통계 조회
  async getChatStats(userId: string): Promise<ChatStats> {
    try {
      const [totalChats, totalMessages, sessions] = await Promise.all([
        prisma.chatSession.count({ where: { userId } }),
        prisma.chatMessage.count({
          where: { session: { userId } },
        }),
        prisma.chatSession.findMany({
          where: { userId },
          select: { createdAt: true },
        }),
      ]);

      const averageMessagesPerChat = totalChats > 0 ? totalMessages / totalChats : 0;

      // 가장 활발한 날 계산
      const dayCounts = sessions.reduce(
        (acc, session) => {
          const day = session.createdAt.toISOString().split('T')[0];
          if (day) {
            acc[day] = (acc[day] || 0) + 1;
          }
          return acc;
        },
        {} as Record<string, number>,
      );

      const mostActiveDay = Object.entries(dayCounts).reduce(
        (max, [day, count]) => (count > max.count ? { day, count } : max),
        { day: '', count: 0 },
      ).day;

      return {
        totalChats,
        totalMessages,
        averageMessagesPerChat: Math.round(averageMessagesPerChat * 10) / 10,
        mostActiveDay,
      };
    } catch (error) {
      console.error('채팅 통계 조회 실패:', error);
      return {
        totalChats: 0,
        totalMessages: 0,
        averageMessagesPerChat: 0,
        mostActiveDay: '',
      };
    }
  },
};
