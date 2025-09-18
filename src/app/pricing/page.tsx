import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Star } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: '무료',
    price: '0',
    period: '월',
    description: '개인 학습자를 위한 기본 기능',
    features: ['월 50개 문제 생성', '기본 학습 분석', '주간 리포트', '이메일 지원'],
    limitations: ['제한된 AI 기능', '기본 리포트만 제공'],
    cta: '무료로 시작',
    popular: false,
  },
  {
    name: '프리미엄',
    price: '29,000',
    period: '월',
    description: '개인 학습자를 위한 고급 기능',
    features: [
      '무제한 문제 생성',
      '고급 AI 분석',
      '상세 학습 리포트',
      '우선 지원',
      '맞춤형 학습 계획',
      '진도 추적',
    ],
    limitations: [],
    cta: '프리미엄 시작',
    popular: true,
  },
  {
    name: '교육기관',
    price: '99,000',
    period: '월',
    description: '학교 및 교육기관을 위한 종합 솔루션',
    features: [
      '무제한 문제 생성',
      '고급 AI 분석',
      '상세 학습 리포트',
      '전담 지원',
      '맞춤형 학습 계획',
      '진도 추적',
      '학생 관리 도구',
      '학부모 포털',
      'API 연동',
      '맞춤 브랜딩',
    ],
    limitations: [],
    cta: '문의하기',
    popular: false,
  },
];

const faqs = [
  {
    question: '무료 플랜에서 얼마나 많은 문제를 생성할 수 있나요?',
    answer:
      '무료 플랜에서는 월 50개의 문제를 생성할 수 있습니다. 더 많은 문제가 필요하시면 프리미엄 플랜으로 업그레이드하세요.',
  },
  {
    question: '언제든지 플랜을 변경할 수 있나요?',
    answer:
      '네, 언제든지 플랜을 업그레이드하거나 다운그레이드할 수 있습니다. 변경사항은 다음 결제 주기부터 적용됩니다.',
  },
  {
    question: '환불 정책은 어떻게 되나요?',
    answer:
      '30일 무조건 환불 보장을 제공합니다. 만족하지 않으시면 언제든지 환불을 요청하실 수 있습니다.',
  },
  {
    question: '교육기관 플랜의 학생 수 제한이 있나요?',
    answer:
      '교육기관 플랜은 최대 1,000명의 학생을 지원합니다. 더 많은 학생이 필요하시면 별도로 문의해주세요.',
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <Badge className="mb-4" variant="secondary">
              요금제
            </Badge>
            <h1 className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
              모든 학습자를 위한
              <br />
              <span className="text-blue-600">맞춤형 요금제</span>
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-lg text-gray-600">
              개인 학습자부터 교육기관까지, 모든 니즈에 맞는 요금제를 제공합니다. 지금 시작하고 30일
              무료 체험을 경험하세요.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-3">
              {plans.map((plan, index) => (
                <Card
                  key={index}
                  className={`relative ${plan.popular ? 'border-blue-500 shadow-xl' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white">
                        <Star className="mr-1 h-3 w-3" />
                        인기
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="text-base">{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900">₩{plan.price}</span>
                      <span className="text-gray-600">/{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {plan.limitations.length > 0 && (
                      <div className="border-t pt-4">
                        <p className="mb-2 text-sm font-medium text-gray-700">제한사항:</p>
                        <ul className="space-y-1">
                          {plan.limitations.map((limitation, limitationIndex) => (
                            <li key={limitationIndex} className="text-sm text-gray-500">
                              • {limitation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <Button
                      className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                      variant={plan.popular ? 'default' : 'outline'}
                      asChild
                    >
                      <Link href={plan.name === '교육기관' ? '/contact' : '/signup'}>
                        {plan.cta}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Comparison */}
        <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">기능 비교</h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                각 플랜에서 제공하는 기능들을 비교해보세요.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="pb-4 text-left font-semibold text-gray-900">기능</th>
                    <th className="pb-4 text-center font-semibold text-gray-900">무료</th>
                    <th className="pb-4 text-center font-semibold text-gray-900">프리미엄</th>
                    <th className="pb-4 text-center font-semibold text-gray-900">교육기관</th>
                  </tr>
                </thead>
                <tbody className="space-y-4">
                  <tr className="border-b">
                    <td className="py-4 font-medium">월 문제 생성 수</td>
                    <td className="py-4 text-center">50개</td>
                    <td className="py-4 text-center">무제한</td>
                    <td className="py-4 text-center">무제한</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 font-medium">AI 분석</td>
                    <td className="py-4 text-center">기본</td>
                    <td className="py-4 text-center">고급</td>
                    <td className="py-4 text-center">고급</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 font-medium">학습 리포트</td>
                    <td className="py-4 text-center">주간</td>
                    <td className="py-4 text-center">상세</td>
                    <td className="py-4 text-center">상세</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 font-medium">학생 관리</td>
                    <td className="py-4 text-center">-</td>
                    <td className="py-4 text-center">-</td>
                    <td className="py-4 text-center">✓</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-4 font-medium">API 연동</td>
                    <td className="py-4 text-center">-</td>
                    <td className="py-4 text-center">-</td>
                    <td className="py-4 text-center">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">자주 묻는 질문</h2>
              <p className="text-lg text-gray-600">요금제에 대한 궁금한 점들을 확인하세요.</p>
            </div>

            <div className="space-y-8">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">지금 시작하세요</h2>
            <p className="mb-8 text-lg text-blue-100">
              30일 무료 체험으로 EduBridge의 모든 기능을 경험해보세요.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/signup">무료로 시작하기</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600"
                asChild
              >
                <Link href="/contact">문의하기</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
