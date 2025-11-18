'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { User, LogIn } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* 로고 */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <span className="text-sm font-bold text-white">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900">EduBridge</span>
            </Link>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                로그인
              </Link>
            </Button>
            <Button asChild>
              <Link href="/signup">
                <User className="mr-2 h-4 w-4" />
                시작하기
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
