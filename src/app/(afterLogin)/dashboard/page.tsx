import { QuickActions } from '@/components/dashboard/quick-actions';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { StudentQuickActions } from '@/components/dashboard/student-quick-actions';
import { StudentStatsCards } from '@/components/dashboard/student-stats-cards';
import { CardLoading } from '@/components/ui/loading';
import { authOptions } from '@/lib/core/auth';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: '대시보드 - EduBridge',
  description: '학습 현황과 활동을 한눈에 확인할 수 있는 대시보드',
  robots: 'noindex, nofollow', // 로그인 필요 페이지
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const role = session.user.role;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">안녕하세요, {session.user.name}님!</h1>
        {role === 'STUDENT' ? (
          <p className="mt-2 text-gray-600">오늘의 학습 진행을 확인하고 문제 풀이를 이어가세요.</p>
        ) : (
          <p className="mt-2 text-gray-600">
            오늘의 학습 활동을 확인하고 학생들의 성과를 관리해보세요.
          </p>
        )}
      </div>

      {role === 'STUDENT' ? (
        <StudentStatsCards />
      ) : (
        <Suspense fallback={<CardLoading />}>
          <StatsCards />
        </Suspense>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {role === 'STUDENT' ? (
          <StudentQuickActions />
        ) : (
          <>
            <Suspense fallback={<CardLoading />}>
              <RecentActivity />
            </Suspense>
            <QuickActions />
          </>
        )}
      </div>
    </div>
  );
}
