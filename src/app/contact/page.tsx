import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, MapPin, MessageSquare, Phone, Send } from 'lucide-react';
import Link from 'next/link';

const contactInfo = [
  {
    icon: Mail,
    title: '이메일',
    description: '언제든지 문의해주세요',
    contact: 'contact@edubridge.ai',
  },
  {
    icon: Phone,
    title: '전화',
    description: '평일 9시-18시',
    contact: '02-1234-5678',
  },
  {
    icon: MapPin,
    title: '주소',
    description: '서울특별시 강남구',
    contact: '테헤란로 123, 456호',
  },
  {
    icon: MessageSquare,
    title: '카카오톡',
    description: '실시간 상담',
    contact: '@EduBridge',
  },
];

const faqs = [
  {
    question: 'EduBridge는 어떤 서비스인가요?',
    answer:
      'EduBridge는 AI 기반 개인화 학습 플랫폼으로, 학습자의 수준에 맞는 맞춤형 문제를 생성하고 학습 성과를 분석해주는 서비스입니다.',
  },
  {
    question: '무료로 사용할 수 있나요?',
    answer:
      '네, 기본 기능은 무료로 사용하실 수 있습니다. 월 50개의 문제 생성과 기본 학습 분석 기능을 제공합니다.',
  },
  {
    question: '교육기관에서 사용하려면 어떻게 해야 하나요?',
    answer: '교육기관 전용 플랜을 제공합니다. 별도 문의를 통해 맞춤형 솔루션을 상담해드립니다.',
  },
  {
    question: '기술 지원은 어떻게 받을 수 있나요?',
    answer:
      '이메일, 전화, 카카오톡을 통해 기술 지원을 받으실 수 있습니다. 프리미엄 사용자는 우선 지원을 제공합니다.',
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <Badge className="mb-4" variant="secondary">
              문의하기
            </Badge>
            <h1 className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
              언제든지
              <br />
              <span className="text-blue-600">문의해주세요</span>
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-lg text-gray-600">
              EduBridge에 대한 궁금한 점이나 제안사항이 있으시면 언제든지 연락주세요. 빠른 시간 내에
              답변드리겠습니다.
            </p>
          </div>
        </section>

        {/* Contact Info */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">연락처 정보</h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                다양한 방법으로 연락하실 수 있습니다.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {contactInfo.map((info, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                      <info.icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{info.title}</CardTitle>
                    <CardDescription>{info.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold text-blue-600">{info.contact}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">문의하기</h2>
              <p className="text-lg text-gray-600">
                아래 양식을 작성해주시면 빠른 시간 내에 답변드리겠습니다.
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>문의 양식</CardTitle>
                <CardDescription>모든 필드는 필수 입력사항입니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">이름 *</Label>
                    <Input id="name" placeholder="홍길동" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일 *</Label>
                    <Input id="email" type="email" placeholder="example@email.com" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">제목 *</Label>
                  <Input id="subject" placeholder="문의 제목을 입력해주세요" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">문의 유형 *</Label>
                  <select
                    id="category"
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    required
                  >
                    <option value="">문의 유형을 선택해주세요</option>
                    <option value="general">일반 문의</option>
                    <option value="technical">기술 지원</option>
                    <option value="billing">결제 문의</option>
                    <option value="partnership">파트너십</option>
                    <option value="feedback">피드백</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">메시지 *</Label>
                  <textarea
                    id="message"
                    rows={6}
                    className="w-full rounded-md border border-gray-300 px-3 py-2"
                    placeholder="문의 내용을 자세히 작성해주세요"
                    required
                  />
                </div>
                <Button className="w-full" size="lg">
                  <Send className="mr-2 h-4 w-4" />
                  문의 보내기
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">자주 묻는 질문</h2>
              <p className="text-lg text-gray-600">자주 문의하시는 내용들을 확인해보세요.</p>
            </div>

            <div className="space-y-6 p-6">
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
              EduBridge와 함께 AI 기반 개인화 학습을 경험해보세요.
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
                <Link href="/demo">데모 체험하기</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
