import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  BookOpen,
  ChevronRight,
  FileText,
  HelpCircle,
  Lightbulb,
  MessageSquare,
  Play,
  Search,
  Settings,
  Video,
} from 'lucide-react';
import Link from 'next/link';

const helpCategories = [
  {
    icon: BookOpen,
    title: '시작하기',
    description: 'EduBridge 사용을 위한 기본 가이드',
    articles: [
      '계정 생성 및 설정',
      '첫 번째 문제 풀기',
      '학습 대시보드 이해하기',
      '프로필 설정하기',
    ],
  },
  {
    icon: Settings,
    title: '기능 사용법',
    description: '주요 기능들의 사용 방법',
    articles: ['AI 문제 생성하기', '학습 리포트 확인하기', '진도 관리하기', '학생 관리 (선생님용)'],
  },
  {
    icon: HelpCircle,
    title: '문제 해결',
    description: '자주 발생하는 문제들의 해결 방법',
    articles: ['로그인 문제 해결', '문제 생성 오류', '리포트가 생성되지 않을 때', '결제 관련 문의'],
  },
  {
    icon: Lightbulb,
    title: '팁과 요령',
    description: 'EduBridge를 더 효과적으로 사용하는 방법',
    articles: [
      '효과적인 학습 계획 세우기',
      'AI 분석 결과 활용하기',
      '학생과의 소통 팁',
      '성과 향상을 위한 전략',
    ],
  },
];

const popularArticles = [
  {
    title: 'EduBridge 첫 사용 가이드',
    description: '처음 사용하시는 분들을 위한 완전 가이드',
    category: '시작하기',
    readTime: '5분',
  },
  {
    title: 'AI 문제 생성 기능 사용법',
    description: 'AI가 생성하는 맞춤형 문제 활용 방법',
    category: '기능 사용법',
    readTime: '3분',
  },
  {
    title: '학습 리포트 해석하기',
    description: '생성된 리포트를 통해 학습 성과 분석하기',
    category: '기능 사용법',
    readTime: '4분',
  },
  {
    title: '계정 설정 및 개인정보 관리',
    description: '계정 보안과 개인정보 설정 방법',
    category: '시작하기',
    readTime: '2분',
  },
];

const videoTutorials = [
  {
    title: 'EduBridge 소개 영상',
    description: 'EduBridge의 주요 기능들을 소개합니다',
    duration: '2:30',
    thumbnail: '/api/placeholder/300/200',
  },
  {
    title: 'AI 문제 생성하기',
    description: 'AI를 활용한 맞춤형 문제 생성 과정',
    duration: '4:15',
    thumbnail: '/api/placeholder/300/200',
  },
  {
    title: '학습 리포트 확인하기',
    description: '생성된 학습 리포트를 확인하고 분석하는 방법',
    duration: '3:45',
    thumbnail: '/api/placeholder/300/200',
  },
  {
    title: '선생님용 학생 관리',
    description: '선생님을 위한 학생 관리 기능 사용법',
    duration: '5:20',
    thumbnail: '/api/placeholder/300/200',
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <Badge className="mb-4" variant="secondary">
              도움말
            </Badge>
            <h1 className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
              도움이 필요하신가요?
              <br />
              <span className="text-blue-600">여기서 찾아보세요</span>
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-lg text-gray-600">
              EduBridge 사용에 대한 모든 질문과 답변을 한 곳에서 찾아보세요. 빠른 해결을 위한
              가이드와 튜토리얼을 제공합니다.
            </p>

            {/* Search Bar */}
            <div className="mx-auto max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="궁금한 내용을 검색해보세요..."
                  className="py-3 pl-10 pr-4 text-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Help Categories */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">도움말 카테고리</h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                원하는 주제를 선택하여 관련 도움말을 확인하세요.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {helpCategories.map((category, index) => (
                <Card key={index} className="h-full">
                  <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                      <category.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {category.articles.map((article, articleIndex) => (
                        <li
                          key={articleIndex}
                          className="flex items-center gap-2 text-sm text-gray-600"
                        >
                          <ChevronRight className="h-3 w-3" />
                          {article}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Articles */}
        <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">인기 도움말</h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                많은 사용자들이 찾는 도움말들을 확인하세요.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {popularArticles.map((article, index) => (
                <Card key={index} className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{article.title}</CardTitle>
                        <CardDescription className="mt-2">{article.description}</CardDescription>
                      </div>
                      <Badge variant="secondary">{article.category}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">읽는 시간: {article.readTime}</span>
                      <Button variant="ghost" size="sm">
                        <FileText className="mr-2 h-4 w-4" />
                        읽기
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Video Tutorials */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">동영상 튜토리얼</h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                시각적으로 쉽게 이해할 수 있는 동영상 가이드를 제공합니다.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {videoTutorials.map((video, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="relative">
                    <div className="flex h-48 items-center justify-center bg-gray-200">
                      <Play className="h-12 w-12 text-gray-400" />
                    </div>
                    <Badge className="absolute right-2 top-2 bg-black/70 text-white">
                      {video.duration}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{video.title}</CardTitle>
                    <CardDescription>{video.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      <Video className="mr-2 h-4 w-4" />
                      재생하기
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Support */}
        <section className="bg-blue-600 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              여전히 도움이 필요하신가요?
            </h2>
            <p className="mb-8 text-lg text-blue-100">
              원하는 답변을 찾지 못하셨다면 언제든지 문의해주세요.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/contact">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  문의하기
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600"
                asChild
              >
                <Link href="/demo">
                  <Play className="mr-2 h-4 w-4" />
                  데모 보기
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
