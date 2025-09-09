"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  FileText,
  Calendar,
  Settings,
  LogOut,
  Bell,
  Search,
  User,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      // 모든 NextAuth 쿠키를 명시적으로 삭제
      document.cookie = "next-auth.session-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "next-auth.callback-url=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "next-auth.csrf-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // NextAuth signOut 실행
      await signOut({
        callbackUrl: "/login",
        redirect: true,
      });
    } catch (error) {
      console.error("Logout error:", error);
      // 오류가 발생해도 로그인 페이지로 이동
      window.location.href = "/login";
    }
  };

  const navigation = [
    { name: "대시보드", href: "/dashboard", icon: LayoutDashboard },
    { name: "학습 관리", href: "/projects", icon: FolderOpen },
    { name: "문제 관리", href: "/problems", icon: FileText },
    { name: "학생 관리", href: "/students", icon: Users },
    { name: "분석 리포트", href: "/reports", icon: Calendar },
    { name: "프로필", href: "/profile", icon: User },
    { name: "설정", href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 사이드바 */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:flex lg:flex-col lg:h-full`}
      >
        <div className="flex justify-between items-center px-6 h-16 border-b border-gray-200">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex justify-center items-center w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
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

        <nav className="flex-1 px-3 mt-6">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <item.icon className="mr-3 w-5 h-5" />
                {item.name}
              </Link>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center mb-3 space-x-3">
            <div className="flex justify-center items-center w-8 h-8 bg-gray-300 rounded-full">
              <span className="text-sm font-medium text-gray-700">
                {session?.user?.name?.charAt(0) || "선"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session?.user?.name || "선생님"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session?.user?.email || "teacher@example.com"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="justify-start w-full" onClick={handleLogout}>
            <LogOut className="mr-2 w-4 h-4" />
            로그아웃
          </Button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex flex-col flex-1 lg:ml-0 h-screen">
        {/* 상단 헤더 */}
        <header className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm h-16">
          <div className="flex justify-between items-center px-4 h-full sm:px-6 lg:px-8">
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
                <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="학습자료, 문제, 학생 검색..."
                  className="py-2 pr-4 pl-10 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button variant="ghost" size="sm">
                <Bell className="w-5 h-5" />
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
