import { authOptions } from '@/lib/core/auth';
import { chatService } from '@/server/services/chat/chat.service';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { AIAssistantDetailClient } from './ai-assistant-detail-client';

export const metadata: Metadata = {
  title: 'AI 어시스턴트 - EduBridge',
  description: 'AI와 대화하며 학습을 도와받으세요',
  robots: 'noindex, nofollow',
};

// 서버에서 실제 채팅 데이터를 가져오는 함수
async function getAIAssistantData(userId: string) {
  try {
    const [sessions, stats] = await Promise.all([
      chatService.getUserChatSessions(userId),
      chatService.getChatStats(userId),
    ]);

    return {
      sessions,
      stats,
      subjects: ['영어', '수학', '역사', '화학', '물리', '생물', '국어', '사회'],
      messageTypes: ['translation', 'explanation', 'question', 'general'],
    };
  } catch (error) {
    console.error('AI 어시스턴트 데이터 로드 실패:', error);
    return {
      sessions: [],
      stats: {
        totalChats: 0,
        totalMessages: 0,
        averageMessagesPerChat: 0,
        mostActiveDay: '',
      },
      subjects: ['영어', '수학', '역사', '화학', '물리', '생물', '국어', '사회'],
      messageTypes: ['translation', 'explanation', 'question', 'general'],
    };
  }
}

export default async function AIAssistantPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const aiAssistantData = await getAIAssistantData(session.user.id);

  return <AIAssistantDetailClient session={session} initialData={aiAssistantData} />;
}
