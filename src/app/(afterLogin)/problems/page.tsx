import { ProblemsClient } from '@/components/problems';
import { authOptions } from '@/lib/core/auth';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: '문제 관리 - EduBridge',
  description: '학습 문제를 생성하고 관리하여 학생들의 학습을 도와주세요.',
  robots: 'noindex, nofollow', // 로그인 필요 페이지
};

export default async function ProblemsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // 학생은 문제 관리 페이지에 접근할 수 없음
  if (session.user.role === 'STUDENT') {
    redirect('/my/learning');
  }

  return (
    <div className="space-y-6 p-6">
      <ProblemsClient />
    </div>
  );
}
