import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail } from "lucide-react";

export function CTA() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          지금 바로 AI 학습을 시작하세요
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          AI 튜터와 함께 개인화된 학습을 시작하고, 효율적인 교육으로 혁신적인 성과를 만들어가세요.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button size="lg" className="text-lg px-8 py-4" asChild>
            <Link href="/signup">
              무료 계정 만들기
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8 py-4" asChild>
            <Link href="/contact">
              <Mail className="mr-2 w-5 h-5" />
              문의하기
            </Link>
          </Button>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">🎉 지금 가입하면 특별 혜택</h3>
          <ul className="text-gray-600 space-y-1">
            <li>• 무료 AI 튜터 서비스 3개월</li>
            <li>• 개인화된 학습 분석 리포트</li>
            <li>• 우선 고객 지원 서비스</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
