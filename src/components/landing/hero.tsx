import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Brain, Zap } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* 메인 헤드라인 */}
          <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-6xl">
            AI로 연결되는
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              교육의 미래
            </span>
          </h1>

          {/* 서브헤드라인 */}
          <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-gray-600">
            선생님과 학생을 AI가 스마트하게 연결하고, 개인화된 학습 경험과 진로 상담을 통해 혁신적인
            교육 성과를 만들어가세요.
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
              <Link href="/demo">데모 체험하기</Link>
            </Button>
          </div>

          {/* 통계 */}
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-gray-900">2,500+</h3>
              <p className="text-gray-600">활성 학습자</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <Brain className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-gray-900">15,000+</h3>
              <p className="text-gray-600">학습 문제</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-gray-900">98%</h3>
              <p className="text-gray-600">학습 만족도</p>
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
