import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle,
  Code,
  Database,
  ExternalLink,
  FileText,
  Key,
  Lock,
  Play,
  Settings,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

const apiEndpoints = [
  {
    method: 'GET',
    path: '/api/problems',
    description: '문제 목록 조회',
    category: '문제 관리',
  },
  {
    method: 'POST',
    path: '/api/problems',
    description: '새 문제 생성',
    category: '문제 관리',
  },
  {
    method: 'GET',
    path: '/api/reports',
    description: '리포트 목록 조회',
    category: '리포트',
  },
  {
    method: 'POST',
    path: '/api/reports',
    description: '리포트 생성',
    category: '리포트',
  },
  {
    method: 'GET',
    path: '/api/students',
    description: '학생 목록 조회',
    category: '학생 관리',
  },
  {
    method: 'POST',
    path: '/api/students',
    description: '학생 등록',
    category: '학생 관리',
  },
];

const features = [
  {
    title: 'RESTful API',
    description: '표준 REST API를 통해 모든 기능에 접근할 수 있습니다.',
    icon: Code,
  },
  {
    title: '실시간 웹훅',
    description: '이벤트 발생 시 실시간으로 알림을 받을 수 있습니다.',
    icon: Zap,
  },
  {
    title: 'OAuth 2.0 인증',
    description: '안전한 OAuth 2.0 인증으로 API에 접근합니다.',
    icon: Lock,
  },
  {
    title: '상세한 문서',
    description: '완전한 API 문서와 예제 코드를 제공합니다.',
    icon: FileText,
  },
];

const sdks = [
  {
    name: 'JavaScript/Node.js',
    description: 'Node.js 및 브라우저 환경에서 사용 가능',
    language: 'javascript',
  },
  {
    name: 'Python',
    description: 'Python 애플리케이션에서 쉽게 사용',
    language: 'python',
  },
  {
    name: 'PHP',
    description: 'PHP 웹 애플리케이션 통합',
    language: 'php',
  },
  {
    name: 'Java',
    description: 'Java 애플리케이션용 SDK',
    language: 'java',
  },
];

const getMethodColor = (method: string) => {
  switch (method) {
    case 'GET':
      return 'bg-green-100 text-green-800';
    case 'POST':
      return 'bg-blue-100 text-blue-800';
    case 'PUT':
      return 'bg-yellow-100 text-yellow-800';
    case 'DELETE':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function APIPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <Badge className="mb-4" variant="secondary">
              API 문서
            </Badge>
            <h1 className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
              EduBridge
              <br />
              <span className="text-blue-600">API</span>
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-lg text-gray-600">
              EduBridge의 강력한 API를 통해 모든 기능을 프로그래밍 방식으로 접근하고 통합할 수
              있습니다.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/api/docs">
                  <FileText className="mr-2 h-4 w-4" />
                  API 문서 보기
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/signup">
                  <Key className="mr-2 h-4 w-4" />
                  API 키 발급
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* API Features */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">API 특징</h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                EduBridge API의 주요 특징들을 확인하세요.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                      <feature.icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* API Endpoints */}
        <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
                주요 API 엔드포인트
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                자주 사용되는 API 엔드포인트들을 확인하세요.
              </p>
            </div>

            <div className="space-y-4">
              {apiEndpoints.map((endpoint, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Badge className={getMethodColor(endpoint.method)}>{endpoint.method}</Badge>
                        <code className="font-mono text-lg text-gray-900">{endpoint.path}</code>
                        <Badge variant="outline">{endpoint.category}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{endpoint.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button variant="outline" asChild>
                <Link href="/api/docs">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  전체 API 문서 보기
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* SDKs */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
                SDK 및 라이브러리
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                다양한 프로그래밍 언어를 위한 SDK를 제공합니다.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {sdks.map((sdk, index) => (
                <Card key={index} className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">{sdk.name}</CardTitle>
                    <CardDescription>{sdk.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        공식 지원
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        완전한 타입 지원
                      </div>
                      <Button className="mt-4 w-full" size="sm" variant="outline">
                        <Code className="mr-2 h-4 w-4" />
                        설치 가이드
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Getting Started */}
        <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">시작하기</h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                몇 가지 간단한 단계로 EduBridge API를 사용할 수 있습니다.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <span className="text-lg font-bold text-blue-600">1</span>
                  </div>
                  <CardTitle>API 키 발급</CardTitle>
                  <CardDescription>계정을 생성하고 API 키를 발급받으세요.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <Key className="mr-2 h-4 w-4" />
                    API 키 발급
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <span className="text-lg font-bold text-blue-600">2</span>
                  </div>
                  <CardTitle>SDK 설치</CardTitle>
                  <CardDescription>사용하는 언어에 맞는 SDK를 설치하세요.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    SDK 설치
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <span className="text-lg font-bold text-blue-600">3</span>
                  </div>
                  <CardTitle>첫 API 호출</CardTitle>
                  <CardDescription>간단한 API 호출로 시작해보세요.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <Play className="mr-2 h-4 w-4" />
                    예제 실행
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">API로 시작하세요</h2>
            <p className="mb-8 text-lg text-blue-100">
              EduBridge API를 통해 강력한 교육 애플리케이션을 만들어보세요.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/signup">
                  <Key className="mr-2 h-4 w-4" />
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
                  <Database className="mr-2 h-4 w-4" />
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




