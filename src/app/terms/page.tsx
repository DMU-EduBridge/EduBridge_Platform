import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, FileText, Scale, Shield, Users } from 'lucide-react';
import Link from 'next/link';

const termsSections = [
  {
    title: '서비스 이용',
    icon: Users,
    content: [
      'EduBridge 서비스는 교육 목적으로만 사용되어야 합니다.',
      '사용자는 본인의 계정 정보를 안전하게 관리할 책임이 있습니다.',
      '서비스 이용 시 관련 법규를 준수해야 합니다.',
      '부적절한 콘텐츠나 행위는 금지됩니다.',
    ],
  },
  {
    title: '계정 관리',
    icon: Shield,
    content: [
      '계정 생성 시 정확한 정보를 제공해야 합니다.',
      '비밀번호는 안전하게 관리하고 정기적으로 변경해야 합니다.',
      '계정 도용이나 무단 사용 시 즉시 신고해야 합니다.',
      '회원 탈퇴 시 개인정보는 정책에 따라 처리됩니다.',
    ],
  },
  {
    title: '지적재산권',
    icon: FileText,
    content: [
      'EduBridge의 모든 콘텐츠는 저작권으로 보호됩니다.',
      '사용자가 생성한 콘텐츠의 저작권은 사용자에게 있습니다.',
      '서비스 내 콘텐츠를 무단 복제하거나 배포할 수 없습니다.',
      '제3자의 지적재산권을 침해해서는 안 됩니다.',
    ],
  },
  {
    title: '면책조항',
    icon: Scale,
    content: [
      '서비스 이용으로 인한 손해에 대해 제한적 책임을 집니다.',
      '사용자의 부주의로 인한 손해는 면책됩니다.',
      '제3자 서비스와의 연동으로 인한 문제는 면책됩니다.',
      '천재지변 등 불가항력적 사유로 인한 서비스 중단은 면책됩니다.',
    ],
  },
];

const userObligations = [
  {
    title: '준수사항',
    items: [
      '서비스 이용약관 및 개인정보처리방침 준수',
      '타인의 권리 존중 및 존중',
      '건전한 학습 환경 조성',
      '부적절한 콘텐츠 업로드 금지',
    ],
  },
  {
    title: '금지사항',
    items: [
      '다른 사용자의 계정 도용',
      '악성 프로그램이나 바이러스 유포',
      '서비스 시스템 해킹 시도',
      '상업적 목적의 무단 사용',
    ],
  },
];

const serviceChanges = [
  {
    type: '서비스 업데이트',
    description: '기능 개선 및 새로운 기능 추가',
    notice: '사전 공지 후 업데이트',
  },
  {
    type: '서비스 중단',
    description: '정기 점검 또는 긴급 상황',
    notice: '가능한 한 사전 공지',
  },
  {
    type: '약관 변경',
    description: '법적 요구사항 또는 서비스 개선',
    notice: '30일 전 공지 후 시행',
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <Badge className="mb-4" variant="secondary">
              이용약관
            </Badge>
            <h1 className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
              서비스
              <br />
              <span className="text-blue-600">이용약관</span>
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-lg text-gray-600">
              EduBridge 서비스 이용에 관한 약관입니다. 서비스 이용 전 반드시 확인해주세요.
            </p>
            <div className="text-sm text-gray-500">최종 업데이트: 2024년 1월 15일</div>
          </div>
        </section>

        {/* Terms Overview */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">약관 개요</h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                EduBridge 서비스 이용에 관한 주요 약관 내용을 안내합니다.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {termsSections.map((section, index) => (
                <Card key={index} className="h-full">
                  <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                      <section.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {section.content.map((item, itemIndex) => (
                        <li
                          key={itemIndex}
                          className="flex items-start gap-2 text-sm text-gray-600"
                        >
                          <CheckCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-green-500" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* User Obligations */}
        <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">사용자 의무</h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                서비스 이용 시 사용자가 준수해야 할 의무사항입니다.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {userObligations.map((obligation, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-xl">{obligation.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {obligation.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2">
                          {obligation.title === '금지사항' ? (
                            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                          ) : (
                            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                          )}
                          <span className="text-sm text-gray-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Service Changes */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
                서비스 변경 및 중단
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                서비스 변경, 중단, 약관 수정에 관한 정책을 안내합니다.
              </p>
            </div>

            <div className="space-y-6">
              {serviceChanges.map((change, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{change.type}</CardTitle>
                      <Badge variant="outline">{change.notice}</Badge>
                    </div>
                    <CardDescription>{change.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Important Notices */}
        <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">중요 안내사항</h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                서비스 이용 시 반드시 확인해야 할 중요 사항들입니다.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <CheckCircle className="h-5 w-5" />
                    이용 전 확인사항
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li>• 본 약관을 충분히 읽고 이해했는지 확인</li>
                    <li>• 개인정보처리방침 내용 숙지</li>
                    <li>• 서비스 이용 목적과 범위 확인</li>
                    <li>• 계정 정보의 정확성 확인</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-900">
                    <AlertTriangle className="h-5 w-5" />
                    주의사항
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-orange-800">
                    <li>• 약관 위반 시 서비스 이용 제한 가능</li>
                    <li>• 부적절한 사용으로 인한 법적 책임</li>
                    <li>• 계정 도용 시 즉시 신고 필요</li>
                    <li>• 서비스 변경 시 사전 공지 확인</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">약관 관련 문의</CardTitle>
                <CardDescription>
                  이용약관에 대한 문의사항이 있으시면 언제든지 연락주세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">법무팀</h4>
                      <p className="text-sm text-gray-600">legal@edubridge.ai</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">고객지원팀</h4>
                      <p className="text-sm text-gray-600">support@edubridge.ai</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">이용약관</h4>
                      <p className="text-sm text-gray-600">최종 업데이트: 2024.01.15</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">적용일자</h4>
                      <p className="text-sm text-gray-600">2024년 1월 15일부터 시행</p>
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
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">약관에 동의하시나요?</h2>
            <p className="mb-8 text-lg text-blue-100">
              이용약관에 동의하시면 EduBridge 서비스를 이용하실 수 있습니다.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/signup">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  동의하고 시작하기
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600"
                asChild
              >
                <Link href="/privacy">
                  <Shield className="mr-2 h-4 w-4" />
                  개인정보처리방침 보기
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







