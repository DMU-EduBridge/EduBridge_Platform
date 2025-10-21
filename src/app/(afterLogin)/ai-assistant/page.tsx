import { authOptions } from '@/lib/core/auth';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { AIAssistantDetailClient } from './ai-assistant-detail-client';

export const metadata: Metadata = {
  title: 'AI 어시스턴트 - EduBridge',
  description: 'AI와 대화하며 학습을 도와받으세요',
  robots: 'noindex, nofollow',
};

export default async function AIAssistantPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return <AIAssistantDetailClient session={session} />;
}
