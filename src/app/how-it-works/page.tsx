import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle,
  FileText,
  MessageSquare,
  Target,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    step: '01',
    title: '계정 생성 및 설정',
    description: '선생님 또는 학생으로 계정을 생성하고 기본 정보를 설정합니다.',
    icon: Users,
    details: ['간단한 회원가입 과정', '역할별 맞춤 설정', '학습 목표 설정'],
  },
  {
    step: '02',
    title: 'AI 기반 문제 생성',
    description: '학습자의 수준과 목표에 맞는 맞춤형 문제를 AI가 자동 생성합니다.',
    icon: Brain,
    details: ['개인화된 난이도 조절', '다양한 문제 유형 지원', '실시간 적응형 생성'],
  },
  {
    step: '03',
    title: '학습 진행 및 추적',
    description: '생성된 문제를 풀면서 학습을 진행하고 실시간으로 진도를 추적합니다.',
    icon: BookOpen,
    details: ['실시간 진도 추적', '즉시 피드백 제공', '학습 패턴 분석'],
  },
  {
    step: '04',
    title: '성과 분석 및 리포트',
    description: 'AI가 학습 데이터를 분석하여 상세한 성과 리포트를 생성합니다.',
    icon: FileText,
    details: ['주간/월간 리포트 자동 생성', '약점 분석 및 개선 제안', '학부모 공유 기능'],
  },
];

const benefits = [
  {
    icon: Target,
    title: '개인화된 학습',
    description: '각 학습자의 수준과 목표에 맞는 맞춤형 학습 경험을 제공합니다.',
  },
  {
    icon: Zap,
    title: '즉시 피드백',
    description: '문제 풀이 후 즉시 정답과 해설을 제공하여 학습 효과를 극대화합니다.',
  },
  {
    icon: MessageSquare,
    title: '선생님과의 소통',
    description: '선생님과 학생 간의 원활한 소통을 통해 개별 맞춤 지도를 받을 수 있습니다.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <Badge className="mb-4" variant="secondary">
              작동 방식
            </Badge>
            <h1 className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
              EduBridge는
              <br />
              <span className="text-blue-600">이렇게 작동합니다</span>
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-lg text-gray-600">
              간단한 4단계로 AI 기반 개인화 학습을 시작하고, 더 나은 학습 결과를 경험하세요.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/signup">지금 시작하기</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/demo">데모 보기</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">4단계 학습 과정</h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                AI가 지원하는 간단하고 효과적인 학습 과정을 따라가세요.
              </p>
            </div>

            <div className="space-y-16">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center lg:flex-row lg:items-start lg:gap-12"
                >
                  <div className="mb-8 flex-shrink-0 lg:mb-0">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-white">
                      <step.icon className="h-10 w-10" />
                    </div>
                  </div>
                  <div className="flex-1 text-center lg:text-left">
                    <div className="mb-4 flex items-center justify-center gap-2 lg:justify-start">
                      <span className="text-sm font-semibold text-blue-600">STEP {step.step}</span>
                    </div>
                    <h3 className="mb-4 text-2xl font-bold text-gray-900">{step.title}</h3>
                    <p className="mb-6 text-lg text-gray-600">{step.description}</p>
                    <ul className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center gap-2 text-gray-700">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block">
                      <ArrowRight className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
                EduBridge의 장점
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                AI 기반 교육 플랫폼의 혁신적인 장점들을 확인하세요.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                      <benefit.icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                    <CardDescription className="text-base">{benefit.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">지금 시작해보세요</h2>
            <p className="mb-8 text-lg text-blue-100">
              4단계의 간단한 과정으로 AI 기반 개인화 학습을 경험하세요.
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

