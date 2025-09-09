import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/core/auth';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { QuickActions } from '@/components/dashboard/quick-actions';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">안녕하세요, {session.user.name}님!</h1>
        <p className="mt-2 text-gray-600">
          오늘의 학습 활동을 확인하고 학생들의 성과를 관리해보세요.
        </p>
      </div>

      <Suspense fallback={<div className="h-32 animate-pulse rounded-lg bg-gray-200"></div>}>
        <StatsCards />
      </Suspense>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-gray-200"></div>}>
          <RecentActivity />
        </Suspense>
        <QuickActions />
      </div>
    </div>
  );
}
