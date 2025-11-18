import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Brain, BookOpen, BarChart3, MessageCircle } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* 메인 헤드라인 */}
          <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-6xl">
            AI로 연결되는
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              스마트 학습 플랫폼
            </span>
          </h1>

          {/* 서브헤드라인 */}
          <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-gray-600">
            AI 기반 문제 생성, 학습 로그 분석, 리포트 자동 생성으로 교육의 모든 과정을 효율적으로 지원합니다.
          </p>

          {/* CTA 버튼들 */}
          <div className="mb-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="px-8 py-4 text-lg" asChild>
              <Link href="/signup">
                무료로 시작하기
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-4 text-lg" asChild>
              <Link href="/login">로그인</Link>
            </Button>
          </div>

          {/* 핵심 기능 아이콘 */}
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">AI 문제 생성</h3>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">스마트 학습</h3>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">학습 리포트</h3>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                <MessageCircle className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="mb-2 text-lg font-bold text-gray-900">AI 도우미</h3>
            </div>
          </div>
        </div>
      </div>

      {/* 배경 장식 */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-full overflow-hidden">
        <div className="absolute left-10 top-20 h-72 w-72 animate-pulse rounded-full bg-blue-200 opacity-70 mix-blend-multiply blur-xl filter"></div>
        <div className="animation-delay-2000 absolute right-10 top-40 h-72 w-72 animate-pulse rounded-full bg-purple-200 opacity-70 mix-blend-multiply blur-xl filter"></div>
        <div className="animation-delay-4000 absolute -bottom-8 left-20 h-72 w-72 animate-pulse rounded-full bg-pink-200 opacity-70 mix-blend-multiply blur-xl filter"></div>
      </div>
    </section>
  );
}
