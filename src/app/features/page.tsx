import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Brain, CheckCircle, FileText, Shield, Target, Users } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: Brain,
    title: 'AI 기반 문제 생성',
    description: '인공지능이 학습자의 수준에 맞는 맞춤형 문제를 자동으로 생성합니다.',
    benefits: ['개인화된 난이도', '다양한 문제 유형', '실시간 적응'],
  },
  {
    icon: BarChart3,
    title: '실시간 학습 분석',
    description: '학습자의 진도와 성과를 실시간으로 분석하여 인사이트를 제공합니다.',
    benefits: ['성과 추적', '약점 분석', '개선 제안'],
  },
  {
    icon: Users,
    title: '선생님-학생 연결',
    description: '선생님과 학생을 효율적으로 연결하여 개별 맞춤 학습을 지원합니다.',
    benefits: ['개별 상담', '진도 관리', '소통 도구'],
  },
  {
    icon: FileText,
    title: '자동 리포트 생성',
    description: 'AI가 학습 데이터를 분석하여 상세한 학습 리포트를 자동 생성합니다.',
    benefits: ['주간/월간 리포트', '성과 분석', '학부모 공유'],
  },
  {
    icon: Target,
    title: '목표 기반 학습',
    description: '학습자의 목표에 맞춘 학습 계획을 수립하고 추적합니다.',
    benefits: ['맞춤 학습 계획', '목표 설정', '진도 관리'],
  },
  {
    icon: Shield,
    title: '안전한 학습 환경',
    description: '학습자의 개인정보를 보호하고 안전한 온라인 학습 환경을 제공합니다.',
    benefits: ['개인정보 보호', '안전한 플랫폼', '부모 모니터링'],
  },
];

const stats = [
  { label: '활성 사용자', value: '10,000+' },
  { label: '생성된 문제', value: '50,000+' },
  { label: '완료된 학습', value: '100,000+' },
  { label: '만족도', value: '98%' },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <Badge className="mb-4" variant="secondary">
              EduBridge 기능
            </Badge>
            <h1 className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
              AI 기반 교육 플랫폼의
              <br />
              <span className="text-blue-600">혁신적인 기능들</span>
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-lg text-gray-600">
              인공지능과 교육의 만남으로 새로운 학습 경험을 제공합니다. 개인화된 학습부터 실시간
              분석까지, 모든 것을 EduBridge에서 경험하세요.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/signup">무료로 시작하기</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/demo">데모 체험하기</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">핵심 기능</h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                EduBridge의 강력한 기능들로 더 효과적인 학습을 경험하세요.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <Card key={index} className="h-full transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                      <feature.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
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
              AI 기반 교육의 혁신을 경험하고, 더 나은 학습 결과를 얻어보세요.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/signup">무료 계정 만들기</Link>
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











