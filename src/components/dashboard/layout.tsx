'use client';

import { Session } from 'next-auth';
import { useState } from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  session: Session;
}

export function DashboardLayout({ children, session }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    if (window.confirm('정말 로그아웃하시겠습니까?')) {
      try {
        // authService.logout() 호출
        // const { authService } = await import('@/services/auth');
        // await authService.logout();

        // NextAuth signOut으로 리다이렉트
        await signOut({
          callbackUrl: '/login',
          redirect: true,
        });
      } catch (error) {
        console.error('Logout error:', error);
        // 오류가 발생해도 로그인 페이지로 이동
        window.location.href = '/login';
      }
    }
  };

  const role = useMemo(() => session?.user?.role, [session?.user?.role]);

  // 로딩 중이면 로딩 표시
  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">로딩 중...</div>
      </div>
    );
  }

  const studentNav = getStudentNav();
  const teacherNav = getTeacherNav();
  const adminNav = getAdminNav();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 사이드바 */}
      <Sidebar session={session} sidebarOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* 메인 콘텐츠 */}
      <div className="flex h-screen flex-1 flex-col lg:ml-0">
        {/* 상단 헤더 */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* 페이지 콘텐츠 */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {/* 모바일 오버레이 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
