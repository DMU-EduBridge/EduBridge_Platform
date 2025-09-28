import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Eye, Lock, Mail, Shield, User } from 'lucide-react';
import Link from 'next/link';

const privacyPrinciples = [
  {
    icon: Shield,
    title: '데이터 보호',
    description: '모든 개인정보는 최고 수준의 보안으로 보호됩니다.',
  },
  {
    icon: Eye,
    title: '투명성',
    description: '개인정보 수집 및 사용에 대해 명확하게 안내합니다.',
  },
  {
    icon: Lock,
    title: '암호화',
    description: '민감한 정보는 강력한 암호화 기술로 보호됩니다.',
  },
  {
    icon: User,
    title: '사용자 제어',
    description: '사용자가 자신의 개인정보를 직접 관리할 수 있습니다.',
  },
];

const dataTypes = [
  {
    category: '계정 정보',
    items: ['이름', '이메일 주소', '비밀번호', '역할 (선생님/학생)'],
    purpose: '계정 생성 및 관리, 서비스 제공',
  },
  {
    category: '학습 데이터',
    items: ['문제 풀이 기록', '학습 진도', '성과 분석', '학습 패턴'],
    purpose: '개인화된 학습 경험 제공, 성과 분석',
  },
  {
    category: '기술 정보',
    items: ['IP 주소', '브라우저 정보', '디바이스 정보', '접속 로그'],
    purpose: '서비스 최적화, 보안 강화',
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <Badge className="mb-4" variant="secondary">
              개인정보처리방침
            </Badge>
            <h1 className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
              개인정보
              <br />
              <span className="text-blue-600">처리방침</span>
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-lg text-gray-600">
              EduBridge는 사용자의 개인정보 보호를 최우선으로 생각합니다. 개인정보 수집, 사용,
              보호에 대한 정책을 명확히 안내합니다.
            </p>
            <div className="text-sm text-gray-500">최종 업데이트: 2024년 1월 15일</div>
          </div>
        </section>

        {/* Privacy Principles */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
                개인정보 보호 원칙
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                EduBridge가 개인정보 보호를 위해 준수하는 핵심 원칙들입니다.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {privacyPrinciples.map((principle, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                      <principle.icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{principle.title}</CardTitle>
                    <CardDescription className="text-base">{principle.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Data Collection */}
        <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
                수집하는 개인정보
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                EduBridge가 수집하는 개인정보의 종류와 목적을 안내합니다.
              </p>
            </div>

            <div className="space-y-8">
              {dataTypes.map((dataType, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-xl">{dataType.category}</CardTitle>
                    <CardDescription>{dataType.purpose}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="mb-2 font-semibold text-gray-900">수집 항목:</h4>
                        <ul className="space-y-1">
                          {dataType.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="text-sm text-gray-600">
                              • {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="mb-2 font-semibold text-gray-900">수집 목적:</h4>
                        <p className="text-sm text-gray-600">{dataType.purpose}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Data Usage */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
                개인정보 사용 및 보관
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                수집된 개인정보의 사용 방법과 보관 기간을 안내합니다.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-blue-600" />
                    사용 목적
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span className="text-sm">서비스 제공 및 계정 관리</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span className="text-sm">개인화된 학습 경험 제공</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span className="text-sm">학습 성과 분석 및 리포트 생성</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span className="text-sm">고객 지원 및 문의 응답</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span className="text-sm">서비스 개선 및 신기능 개발</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-blue-600" />
                    보관 기간
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span className="text-sm">계정 정보: 회원 탈퇴 시까지</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span className="text-sm">학습 데이터: 3년간 보관</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span className="text-sm">기술 정보: 1년간 보관</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span className="text-sm">문의 기록: 3년간 보관</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* User Rights */}
        <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">사용자 권리</h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                개인정보에 대한 사용자의 권리와 행사 방법을 안내합니다.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">열람 권리</CardTitle>
                  <CardDescription>자신의 개인정보 처리 현황을 확인할 수 있습니다.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full">
                    개인정보 열람 요청
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">정정·삭제 권리</CardTitle>
                  <CardDescription>
                    잘못된 개인정보를 정정하거나 삭제를 요청할 수 있습니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full">
                    정정·삭제 요청
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">처리정지 권리</CardTitle>
                  <CardDescription>개인정보 처리의 정지를 요청할 수 있습니다.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" size="sm" className="w-full">
                    처리정지 요청
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">개인정보 보호 책임자</CardTitle>
                <CardDescription>
                  개인정보 처리에 관한 문의사항이 있으시면 언제든지 연락주세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-semibold">개인정보 보호 책임자</p>
                        <p className="text-sm text-gray-600">김개인정보</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-semibold">이메일</p>
                        <p className="text-sm text-gray-600">privacy@edubridge.ai</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Database className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-semibold">개인정보 처리방침</p>
                        <p className="text-sm text-gray-600">최종 업데이트: 2024.01.15</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-semibold">보안 인증</p>
                        <p className="text-sm text-gray-600">ISO 27001 인증</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">
              개인정보 보호에 대한 문의
            </h2>
            <p className="mb-8 text-lg text-blue-100">
              개인정보 처리에 대한 궁금한 점이 있으시면 언제든지 문의해주세요.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/contact">
                  <Mail className="mr-2 h-4 w-4" />
                  문의하기
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600"
                asChild
              >
                <Link href="/terms">이용약관 보기</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}












