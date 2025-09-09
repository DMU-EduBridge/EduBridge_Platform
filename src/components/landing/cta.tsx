import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Mail } from 'lucide-react';

export function CTA() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="mb-6 text-3xl font-bold text-gray-900 md:text-4xl">
          지금 바로 AI 학습을 시작하세요
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
          AI 튜터와 함께 개인화된 학습을 시작하고, 효율적인 교육으로 혁신적인 성과를 만들어가세요.
        </p>

        <div className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="px-8 py-4 text-lg" asChild>
            <Link href="/signup">
              무료 계정 만들기
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="px-8 py-4 text-lg" asChild>
            <Link href="/contact">
              <Mail className="mr-2 h-5 w-5" />
              문의하기
            </Link>
          </Button>
        </div>

        <div className="rounded-lg bg-gray-50 p-6">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">🎉 지금 가입하면 특별 혜택</h3>
          <ul className="space-y-1 text-gray-600">
            <li>• 무료 AI 튜터 서비스 3개월</li>
            <li>• 개인화된 학습 분석 리포트</li>
            <li>• 우선 고객 지원 서비스</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
