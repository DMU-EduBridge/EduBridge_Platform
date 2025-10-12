import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Clock, Database, RefreshCw, Server, Zap } from 'lucide-react';
import Link from 'next/link';

const services = [
  {
    name: '웹 애플리케이션',
    status: 'operational',
    description: '메인 웹사이트 및 사용자 인터페이스',
    uptime: '99.9%',
    responseTime: '120ms',
  },
  {
    name: 'AI 문제 생성 API',
    status: 'operational',
    description: 'AI 기반 맞춤형 문제 생성 서비스',
    uptime: '99.8%',
    responseTime: '850ms',
  },
  {
    name: '학습 분석 엔진',
    status: 'operational',
    description: '학습 데이터 분석 및 리포트 생성',
    uptime: '99.7%',
    responseTime: '450ms',
  },
  {
    name: '사용자 인증',
    status: 'operational',
    description: '로그인 및 계정 관리 시스템',
    uptime: '99.9%',
    responseTime: '95ms',
  },
  {
    name: '데이터베이스',
    status: 'operational',
    description: '사용자 데이터 및 학습 기록 저장',
    uptime: '99.95%',
    responseTime: '25ms',
  },
  {
    name: '파일 저장소',
    status: 'operational',
    description: '학습 자료 및 리포트 파일 저장',
    uptime: '99.9%',
    responseTime: '180ms',
  },
];

const incidents = [
  {
    id: 'INC-2024-001',
    title: 'AI 문제 생성 지연',
    status: 'resolved',
    severity: 'minor',
    description: 'AI 문제 생성 API 응답 시간이 일시적으로 증가했습니다.',
    startTime: '2024-01-15 14:30',
    endTime: '2024-01-15 15:45',
    duration: '1시간 15분',
  },
  {
    id: 'INC-2024-002',
    title: '데이터베이스 연결 불안정',
    status: 'resolved',
    severity: 'major',
    description: '데이터베이스 연결이 일시적으로 불안정했습니다.',
    startTime: '2024-01-10 09:15',
    endTime: '2024-01-10 11:30',
    duration: '2시간 15분',
  },
];

const maintenance = [
  {
    title: '정기 시스템 업데이트',
    description: '성능 개선 및 보안 업데이트',
    scheduledTime: '2024-01-20 02:00 - 04:00 KST',
    status: 'scheduled',
  },
  {
    title: 'AI 모델 업그레이드',
    description: '더 정확한 문제 생성을 위한 AI 모델 업데이트',
    scheduledTime: '2024-01-25 01:00 - 03:00 KST',
    status: 'scheduled',
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'operational':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'degraded':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'outage':
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'operational':
      return 'bg-green-100 text-green-800';
    case 'degraded':
      return 'bg-yellow-100 text-yellow-800';
    case 'outage':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'operational':
      return '정상 운영';
    case 'degraded':
      return '성능 저하';
    case 'outage':
      return '서비스 중단';
    default:
      return '알 수 없음';
  }
};

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl text-center">
            <Badge className="mb-4" variant="secondary">
              서비스 상태
            </Badge>
            <h1 className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
              EduBridge
              <br />
              <span className="text-blue-600">서비스 상태</span>
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-lg text-gray-600">
              EduBridge의 모든 서비스 상태를 실시간으로 확인하세요. 서비스 중단이나 성능 이슈가 있을
              경우 여기서 확인할 수 있습니다.
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="text-lg font-semibold text-green-600">모든 시스템 정상 운영 중</span>
            </div>
          </div>
        </section>

        {/* Overall Status */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
                전체 서비스 상태
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                EduBridge의 모든 핵심 서비스 상태를 확인하세요.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(service.status)}
                        <div>
                          <CardTitle className="text-lg">{service.name}</CardTitle>
                          <CardDescription>{service.description}</CardDescription>
                        </div>
                      </div>
                      <Badge className={getStatusColor(service.status)}>
                        {getStatusLabel(service.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">가동률:</span>
                        <span className="font-semibold">{service.uptime}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">응답 시간:</span>
                        <span className="font-semibold">{service.responseTime}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Incidents */}
        <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">최근 사고 내역</h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                최근 발생한 서비스 중단 및 성능 이슈 내역입니다.
              </p>
            </div>

            <div className="space-y-6 p-6">
              {incidents.map((incident, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="mb-2 flex items-center gap-3">
                          <Badge variant="outline">{incident.id}</Badge>
                          <Badge className={getStatusColor(incident.status)}>
                            {incident.status === 'resolved' ? '해결됨' : '진행 중'}
                          </Badge>
                          <Badge variant="secondary">
                            {incident.severity === 'major' ? '심각' : '경미'}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl">{incident.title}</CardTitle>
                        <CardDescription className="mt-2">{incident.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <span className="text-sm font-medium text-gray-600">시작 시간:</span>
                        <p className="text-sm">{incident.startTime}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">종료 시간:</span>
                        <p className="text-sm">{incident.endTime}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">지속 시간:</span>
                        <p className="text-sm">{incident.duration}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Scheduled Maintenance */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">예정된 점검</h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                향후 예정된 시스템 점검 및 업데이트 일정입니다.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {maintenance.map((item, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <Badge variant="outline">예정됨</Badge>
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-600">예정 시간:</span>
                        <p className="text-sm">{item.scheduledTime}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* System Metrics */}
        <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">시스템 지표</h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                실시간 시스템 성능 지표를 확인하세요.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-4">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <Server className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl">99.9%</CardTitle>
                  <CardDescription>전체 가동률</CardDescription>
                </CardHeader>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                    <Zap className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl">120ms</CardTitle>
                  <CardDescription>평균 응답 시간</CardDescription>
                </CardHeader>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                    <Database className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-2xl">25ms</CardTitle>
                  <CardDescription>DB 응답 시간</CardDescription>
                </CardHeader>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                    <RefreshCw className="h-8 w-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-2xl">0</CardTitle>
                  <CardDescription>진행 중인 사고</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-600 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl">문제를 발견하셨나요?</h2>
            <p className="mb-8 text-lg text-blue-100">
              서비스 문제를 발견하셨거나 추가 정보가 필요하시면 언제든지 문의해주세요.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/contact">문의하기</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                새로고침
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
