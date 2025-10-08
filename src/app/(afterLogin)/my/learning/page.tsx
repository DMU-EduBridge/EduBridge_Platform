import { authOptions } from '@/lib/core/auth';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import dynamic from 'next/dynamic';
import { redirect } from 'next/navigation';

const MyLearningClient = dynamic(() => import('./my-learning-client'), { ssr: false });

export const metadata: Metadata = {
  title: '나의 학습 - EduBridge',
  description: '개인 학습 진행 상황과 성과를 확인할 수 있는 페이지',
  robots: 'noindex, nofollow', // 로그인 필요 페이지
};

export default async function MyLearningPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== 'STUDENT') {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6 p-6">
      <MyLearningClient />
    </div>
  );
}
