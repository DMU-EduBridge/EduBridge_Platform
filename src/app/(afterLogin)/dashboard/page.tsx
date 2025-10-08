import { authOptions } from '@/lib/core/auth';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardClient } from './dashboard-client';

export const metadata: Metadata = {
  title: '대시보드 - EduBridge',
  description: '학습 현황과 활동을 한눈에 확인할 수 있는 대시보드',
  robots: 'noindex, nofollow', // 로그인 필요 페이지
};

// 서버에서 실제 대시보드 개요 데이터를 가져오는 함수(하이브리드: 초기 데이터만 SSR)
async function getDashboardData() {
  try {
    const cookie = headers().get('cookie') || '';
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/dashboard/overview`, {
      headers: { cookie: cookie },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch (error) {
    console.error('대시보드 데이터 로드 실패:', error);
    return null;
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const dashboardData = await getDashboardData();

  return <DashboardClient session={session} initialData={dashboardData} />;
}
