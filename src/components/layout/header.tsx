'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogIn } from 'lucide-react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden items-center space-x-8 md:flex">
            <Link href="/features" className="text-gray-700 transition-colors hover:text-blue-600">
              기능
            </Link>
            <Link
              href="/how-it-works"
              className="text-gray-700 transition-colors hover:text-blue-600"
            >
              작동 방식
            </Link>
            <Link href="/pricing" className="text-gray-700 transition-colors hover:text-blue-600">
              요금제
            </Link>
            <Link href="/about" className="text-gray-700 transition-colors hover:text-blue-600">
              소개
            </Link>
          </nav>

          {/* 액션 버튼들 */}
          <div className="hidden items-center space-x-4 md:flex">
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

          {/* 모바일 메뉴 버튼 */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="border-t border-gray-200 py-4 md:hidden">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/features"
                className="text-gray-700 transition-colors hover:text-blue-600"
              >
                기능
              </Link>
              <Link
                href="/how-it-works"
                className="text-gray-700 transition-colors hover:text-blue-600"
              >
                작동 방식
              </Link>
              <Link href="/pricing" className="text-gray-700 transition-colors hover:text-blue-600">
                요금제
              </Link>
              <Link href="/about" className="text-gray-700 transition-colors hover:text-blue-600">
                소개
              </Link>
              <div className="space-y-2 border-t border-gray-200 pt-4">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    로그인
                  </Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/signup">
                    <User className="mr-2 h-4 w-4" />
                    시작하기
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
