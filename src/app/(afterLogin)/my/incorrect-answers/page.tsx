import { authOptions } from '@/lib/core/auth';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { IncorrectAnswersDetailClient } from './incorrect-answers-detail-client';

export const metadata: Metadata = {
  title: '오답 노트 - EduBridge',
  description: '틀린 문제들을 다시 풀어보고 복습하세요',
  robots: 'noindex, nofollow',
};

// 항상 최신 DB 상태를 반영하도록 캐시 비활성화
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function IncorrectAnswersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return <IncorrectAnswersDetailClient session={session} />;
}
