'use client';

import { Button } from '@/components/ui/button';
import {
  Bell,
  Calendar,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  Shield,
  User,
  Users,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      // 모든 NextAuth 쿠키를 명시적으로 삭제
      document.cookie = 'next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'next-auth.callback-url=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'next-auth.csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

      // NextAuth signOut 실행
      await signOut({
        callbackUrl: '/login',
        redirect: true,
      });
    } catch (error) {
      console.error('Logout error:', error);
      // 오류가 발생해도 로그인 페이지로 이동
      window.location.href = '/login';
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

  const baseNav = [
    { name: '대시보드', href: '/dashboard', icon: LayoutDashboard },
    { name: '문제', href: '/problems', icon: FileText },
    { name: '프로필', href: '/profile', icon: User },
  ];

  const teacherNav = [
    { name: '학습 관리', href: '/projects', icon: FolderOpen },
    { name: '학생 관리', href: '/students', icon: Users },
    { name: '분석 리포트', href: '/reports', icon: Calendar },
  ];

  const adminNav = [
    { name: '관리자 대시보드', href: '/admin', icon: Shield },
    { name: '사용자 관리', href: '/admin/users', icon: Users },
    { name: '시스템 설정', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 사이드바 */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:static lg:inset-0 lg:flex lg:h-full lg:translate-x-0 lg:flex-col`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
              <span className="text-sm font-bold text-white">E</span>
            </div>
            <span className="text-xl font-bold text-gray-900">EduBridge</span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            ×
          </Button>
        </div>

        <nav className="mt-6 flex-1 px-3">
          <div className="space-y-1">
            {/* 기본 메뉴 */}
            {baseNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}

            {/* 교사/관리자 공통 메뉴 */}
            {(role === 'TEACHER' || role === 'ADMIN') && (
              <>
                <div className="my-4 border-t border-gray-200"></div>
                {teacherNav.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </>
            )}

            {/* 관리자 전용 메뉴 */}
            {role === 'ADMIN' && (
              <>
                <div className="my-4 border-t border-gray-200"></div>
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    관리자 기능
                  </p>
                </div>
                {adminNav.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </>
            )}

            {/* 교사 전용 설정 메뉴 */}
            {role === 'TEACHER' && (
              <>
                <div className="my-4 border-t border-gray-200"></div>
                <Link
                  href="/settings"
                  className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
                >
                  <Settings className="mr-3 h-5 w-5" />
                  설정
                </Link>
              </>
            )}
          </div>
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="mb-3 flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
              <span className="text-sm font-medium text-gray-700">
                {session?.user?.name?.charAt(0) || '선'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">
                {session?.user?.name || '선생님'}
              </p>
              <p className="truncate text-xs text-gray-500">
                {session?.user?.email || 'teacher@example.com'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            로그아웃
          </Button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex h-screen flex-1 flex-col lg:ml-0">
        {/* 상단 헤더 */}
        <header className="h-16 flex-shrink-0 border-b border-gray-200 bg-white shadow-sm">
          <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              ☰
            </Button>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="text"
                  placeholder="학습자료, 문제, 학생 검색..."
                  className="rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

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
