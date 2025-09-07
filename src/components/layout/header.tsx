"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogIn } from "lucide-react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900">EduBridge</span>
            </Link>
          </div>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/features" className="text-gray-700 hover:text-blue-600 transition-colors">
              기능
            </Link>
            <Link
              href="/how-it-works"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              작동 방식
            </Link>
            <Link href="/pricing" className="text-gray-700 hover:text-blue-600 transition-colors">
              요금제
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
              소개
            </Link>
          </nav>

          {/* 액션 버튼들 */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">
                <LogIn className="w-4 h-4 mr-2" />
                로그인
              </Link>
            </Button>
            <Button asChild>
              <Link href="/signup">
                <User className="w-4 h-4 mr-2" />
                시작하기
              </Link>
            </Button>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link
                href="/features"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                기능
              </Link>
              <Link
                href="/how-it-works"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                작동 방식
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-blue-600 transition-colors">
                요금제
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
                소개
              </Link>
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/login">
                    <LogIn className="w-4 h-4 mr-2" />
                    로그인
                  </Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/signup">
                    <User className="w-4 h-4 mr-2" />
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
