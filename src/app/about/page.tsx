import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, CheckCircle, Globe, Heart, Lightbulb, Target } from 'lucide-react';
import Link from 'next/link';

const team = [
  {
    name: '김교육',
    role: 'CEO & 창립자',
    description: '교육 기술 분야 15년 경험, AI 기반 교육 솔루션 전문가',
    image: '/api/placeholder/150/150',
  },
  {
    name: '이개발',
    role: 'CTO',
    description: 'AI/ML 엔지니어링 10년 경험, 교육용 AI 알고리즘 개발',
    image: '/api/placeholder/150/150',
  },
  {
    name: '박디자인',
    role: 'UX/UI 디자이너',
    description: '교육 플랫폼 UX 디자인 8년 경험, 사용자 중심 설계',
    image: '/api/placeholder/150/150',
  },
  {
    name: '최마케팅',
    role: '마케팅 디렉터',
    description: '교육 시장 마케팅 12년 경험, EdTech 브랜드 구축',
    image: '/api/placeholder/150/150',
  },
];

const values = [
  {
    icon: Heart,
    title: '학습자 중심',
    description: '모든 학습자가 성공할 수 있도록 개인화된 학습 경험을 제공합니다.',
  },
  {
    icon: Lightbulb,
    title: '혁신',
    description: '최신 AI 기술을 활용하여 교육의 새로운 가능성을 열어갑니다.',
  },
  {
    icon: Globe,
    title: '접근성',
    description: '언제 어디서나 누구나 고품질 교육을 받을 수 있도록 합니다.',
  },
  {
    icon: Target,
    title: '성과 중심',
    description: '학습자의 실제 성과 향상에 집중하여 가치 있는 결과를 제공합니다.',
  },
];

const milestones = [
  {
    year: '2023',
    title: 'EduBridge 설립',
    description: 'AI 기반 교육 플랫폼 개발 시작',
  },
  {
    year: '2024 Q1',
    title: '베타 버전 출시',
    description: '100명의 초기 사용자와 함께 베타 테스트 진행',
  },
  {
    year: '2024 Q2',
    title: '정식 서비스 런칭',
    description: 'AI 문제 생성 및 학습 분석 기능 완성',
  },
  {
    year: '2024 Q3',
    title: '10,000명 돌파',
    description: '활성 사용자 10,000명 달성',
  },
  {
    year: '2024 Q4',
    title: '교육기관 파트너십',
    description: '주요 교육기관과의 파트너십 체결',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <Badge className="mb-4" variant="secondary">
              EduBridge 소개
            </Badge>
            <h1 className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
              AI와 교육의 만남으로
              <br />
              <span className="text-blue-600">새로운 학습 경험</span>을 만들어갑니다
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-lg text-gray-600">
              EduBridge는 인공지능 기술을 활용하여 모든 학습자가 자신만의 맞춤형 학습 경험을 할 수
              있도록 돕는 혁신적인 교육 플랫폼입니다.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/signup">함께 시작하기</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/contact">문의하기</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl">우리의 미션</h2>
                <p className="mb-6 text-lg text-gray-600">
                  EduBridge는 모든 학습자가 자신의 잠재력을 최대한 발휘할 수 있도록 AI 기반의
                  개인화된 학습 환경을 제공합니다. 우리는 교육의 접근성을 높이고, 학습 효과를
                  극대화하며, 교육자와 학습자 모두에게 가치 있는 도구를 제공하는 것을 목표로 합니다.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">개인화된 학습 경험 제공</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">AI 기반 맞춤형 문제 생성</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">실시간 학습 분석 및 피드백</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="flex h-80 w-80 items-center justify-center rounded-full bg-gradient-to-r from-blue-400 to-purple-500">
                  <Brain className="h-32 w-32 text-white" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">우리의 가치</h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                EduBridge가 추구하는 핵심 가치들을 소개합니다.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                      <value.icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{value.title}</CardTitle>
                    <CardDescription className="text-base">{value.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">우리 팀</h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                EduBridge를 만들어가는 열정적인 팀원들을 소개합니다.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {team.map((member, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-gray-200"></div>
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    <CardDescription className="font-semibold text-blue-600">
                      {member.role}
                    </CardDescription>
                    <CardDescription className="text-sm">{member.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">우리의 여정</h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                EduBridge의 성장 과정을 확인하세요.
              </p>
            </div>

            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
                      {milestone.year}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{milestone.title}</h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-blue-600 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">EduBridge의 성과</h2>
              <p className="text-lg text-blue-100">지금까지의 놀라운 성과를 확인하세요.</p>
            </div>

            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-white">10,000+</div>
                <div className="text-blue-100">활성 사용자</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white">50,000+</div>
                <div className="text-blue-100">생성된 문제</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white">100,000+</div>
                <div className="text-blue-100">완료된 학습</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white">98%</div>
                <div className="text-blue-100">사용자 만족도</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">함께 성장해요</h2>
            <p className="mb-8 text-lg text-gray-600">
              EduBridge와 함께 교육의 미래를 만들어가세요.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/signup">지금 시작하기</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
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
