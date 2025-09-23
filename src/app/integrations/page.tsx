import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle,
  Database,
  FileText,
  Mail,
  MessageSquare,
  Settings,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

const integrations = [
  {
    name: 'Google Classroom',
    description: 'Google Classroom과 연동하여 수업 관리와 과제 배포를 자동화합니다.',
    icon: BookOpen,
    category: '교육 플랫폼',
    features: ['수업 자동 동기화', '과제 자동 배포', '성적 통합 관리'],
    status: 'available',
  },
  {
    name: 'Microsoft Teams',
    description: 'Teams와 연동하여 온라인 수업과 협업을 지원합니다.',
    icon: Users,
    category: '협업 도구',
    features: ['화상 수업 연동', '채팅 통합', '파일 공유'],
    status: 'available',
  },
  {
    name: 'Zoom',
    description: 'Zoom과 연동하여 원활한 온라인 수업 환경을 제공합니다.',
    icon: MessageSquare,
    category: '화상 회의',
    features: ['자동 수업 생성', '참석자 관리', '녹화 연동'],
    status: 'available',
  },
  {
    name: 'Canvas LMS',
    description: 'Canvas 학습 관리 시스템과 완전 통합됩니다.',
    icon: Database,
    category: 'LMS',
    features: ['완전 통합', '데이터 동기화', 'SSO 지원'],
    status: 'available',
  },
  {
    name: 'Moodle',
    description: 'Moodle과 연동하여 기존 학습 환경을 확장합니다.',
    icon: Settings,
    category: 'LMS',
    features: ['플러그인 지원', 'API 연동', '사용자 동기화'],
    status: 'available',
  },
  {
    name: 'Slack',
    description: 'Slack과 연동하여 팀 커뮤니케이션을 강화합니다.',
    icon: Zap,
    category: '커뮤니케이션',
    features: ['알림 연동', '봇 지원', '워크스페이스 통합'],
    status: 'available',
  },
  {
    name: 'Outlook Calendar',
    description: 'Outlook 캘린더와 연동하여 일정 관리를 자동화합니다.',
    icon: Calendar,
    category: '일정 관리',
    features: ['일정 자동 동기화', '수업 알림', '과제 마감일 관리'],
    status: 'available',
  },
  {
    name: 'Gmail',
    description: 'Gmail과 연동하여 이메일 알림과 커뮤니케이션을 개선합니다.',
    icon: Mail,
    category: '이메일',
    features: ['자동 이메일 발송', '템플릿 지원', '읽음 확인'],
    status: 'available',
  },
];

const categories = [
  { name: '교육 플랫폼', count: 2, color: 'bg-blue-100 text-blue-800' },
  { name: 'LMS', count: 2, color: 'bg-green-100 text-green-800' },
  { name: '협업 도구', count: 2, color: 'bg-purple-100 text-purple-800' },
  { name: '화상 회의', count: 1, color: 'bg-orange-100 text-orange-800' },
  { name: '커뮤니케이션', count: 1, color: 'bg-pink-100 text-pink-800' },
];

const benefits = [
  {
    title: '원클릭 연동',
    description: '복잡한 설정 없이 간단한 클릭으로 연동을 시작할 수 있습니다.',
    icon: Zap,
  },
  {
    title: '실시간 동기화',
    description: '모든 데이터가 실시간으로 동기화되어 항상 최신 상태를 유지합니다.',
    icon: Database,
  },
  {
    title: '보안 보장',
    description: '엔터프라이즈급 보안으로 모든 연동이 안전하게 보호됩니다.',
    icon: Settings,
  },
];

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <Badge className="mb-4" variant="secondary">
              연동 서비스
            </Badge>
            <h1 className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
              EduBridge와
              <br />
              <span className="text-blue-600">연동하기</span>
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-lg text-gray-600">
              EduBridge는 다양한 교육 도구와 플랫폼과 연동하여 더욱 통합된 학습 환경을 제공합니다.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/signup">연동 시작하기</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/contact">맞춤 연동 문의</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">연동 카테고리</h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                다양한 카테고리의 도구들과 연동할 수 있습니다.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              {categories.map((category, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <Badge className={`mb-2 ${category.color}`}>{category.name}</Badge>
                    <p className="text-2xl font-bold text-gray-900">{category.count}</p>
                    <p className="text-sm text-gray-600">개 연동</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Integrations Grid */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
                사용 가능한 연동
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                인기 있는 교육 도구들과의 연동을 지원합니다.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {integrations.map((integration, index) => (
                <Card key={index} className="h-full transition-shadow hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                          <integration.icon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {integration.category}
                          </Badge>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800">사용 가능</Badge>
                    </div>
                    <CardDescription className="mt-3">{integration.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-900">주요 기능:</h4>
                      <ul className="space-y-1">
                        {integration.features.map((feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className="flex items-center gap-2 text-sm text-gray-600"
                          >
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button className="mt-4 w-full" size="sm">
                        연동하기
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">연동의 장점</h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                EduBridge 연동으로 얻을 수 있는 혜택들을 확인하세요.
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

        {/* API Documentation */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
                개발자를 위한 API
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                RESTful API를 통해 EduBridge와 직접 연동할 수 있습니다.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    API 문서
                  </CardTitle>
                  <CardDescription>완전한 API 문서와 예제 코드를 제공합니다.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• RESTful API 엔드포인트</li>
                    <li>• 인증 및 권한 관리</li>
                    <li>• 실시간 웹훅 지원</li>
                    <li>• SDK 및 예제 코드</li>
                  </ul>
                  <Button className="mt-4 w-full" variant="outline">
                    API 문서 보기
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-600" />
                    맞춤 연동
                  </CardTitle>
                  <CardDescription>
                    특별한 요구사항이 있으시면 맞춤 연동을 지원합니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• 전담 개발자 지원</li>
                    <li>• 맞춤형 API 개발</li>
                    <li>• 테스트 및 검증</li>
                    <li>• 지속적인 유지보수</li>
                  </ul>
                  <Button className="mt-4 w-full" variant="outline">
                    맞춤 연동 문의
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              지금 연동을 시작하세요
            </h2>
            <p className="mb-8 text-lg text-blue-100">
              EduBridge와 함께 더욱 통합된 학습 환경을 만들어보세요.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/signup">
                  <Zap className="mr-2 h-4 w-4" />
                  무료로 시작하기
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600"
                asChild
              >
                <Link href="/contact">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  문의하기
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}




