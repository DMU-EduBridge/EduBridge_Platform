'use client';

import { Button } from '@/components/ui/button';
import { LogOut, Settings } from 'lucide-react';
import { Session } from 'next-auth';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { memo, useMemo } from 'react';
import { getAdminNav, getStudentNav, getTeacherNav } from './nav';

interface SidebarProps {
  session: Session;
  sidebarOpen: boolean;
  onClose: () => void;
}

export const Sidebar = memo(function Sidebar({ session, sidebarOpen, onClose }: SidebarProps) {
  const handleLogout = async () => {
    if (window.confirm('정말 로그아웃하시겠습니까?')) {
      try {
        // authService.logout() 호출
        const { authService } = await import('@/services/auth');
        await authService.logout();

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

  const studentNav = useMemo(() => getStudentNav(), []);
  const teacherNav = useMemo(() => getTeacherNav(), []);
  const adminNav = useMemo(() => getAdminNav(), []);

  return (
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
        <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
          ×
        </Button>
      </div>

      <nav className="mt-6 flex-1 px-3">
        <div className="space-y-1">
          {/* 학생 메뉴 */}
          {role === 'STUDENT' && (
            <>
              {studentNav.map((item) => (
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

          {/* 선생님 메뉴 */}
          {role === 'TEACHER' && (
            <>
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

          {/* 관리자 메뉴 */}
          {role === 'ADMIN' && (
            <>
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
        </div>
      </nav>

      <div className="border-t border-gray-200 p-4">
        <div className="mb-3 flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
            <span className="text-sm font-medium text-gray-700">
              {session?.user?.name?.charAt(0) ||
                (role === 'STUDENT' ? '학' : role === 'TEACHER' ? '선' : '관')}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">
              {session?.user?.name ||
                (role === 'STUDENT' ? '학생' : role === 'TEACHER' ? '선생님' : '관리자')}
            </p>
            <p className="truncate text-xs text-gray-500">
              {session?.user?.email || 'user@example.com'}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          로그아웃
        </Button>
      </div>
    </div>
  );
});
