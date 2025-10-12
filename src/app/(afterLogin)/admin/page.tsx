import { AIProblemSyncCard } from '@/components/ai/problem-sync-card';
import { AIServiceMonitorCard } from '@/components/ai/service-monitor-card';
import { Card } from '@/components/ui/card';
import { authOptions } from '@/lib/core/auth';
import { BarChart3, Settings, Shield, Users } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const adminStats = [
    {
      title: '전체 사용자',
      value: '156',
      change: '+12',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: '활성 교사',
      value: '23',
      change: '+3',
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: '활성 학생',
      value: '133',
      change: '+9',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: '시스템 상태',
      value: '정상',
      change: '99.9%',
      icon: BarChart3,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
  ];

  const quickActions = [
    { title: '사용자 관리', href: '/admin/users', icon: Users },
    { title: '시스템 설정', href: '/admin/settings', icon: Settings },
    { title: '전체 리포트', href: '/reports', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
        <p className="mt-2 text-gray-600">시스템 전체 현황을 확인하고 관리 기능에 접근하세요.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {adminStats.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="mt-1 text-sm text-gray-500">{stat.change}</p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bgColor}`}
              >
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 빠른 실행 */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">관리 기능</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {quickActions.map((action) => (
            <a
              key={action.title}
              href={action.href}
              className="flex items-center rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
            >
              <action.icon className="mr-3 h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">{action.title}</span>
            </a>
          ))}
        </div>
      </Card>

      {/* AI 서비스 모니터링 */}
      <div className="mb-6">
        <AIServiceMonitorCard />
      </div>

      {/* AI 서버 문제 동기화 */}
      <div className="mb-6">
        <AIProblemSyncCard />
      </div>

      {/* 최근 활동 */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">최근 시스템 활동</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">새 학생 계정 생성</p>
                <p className="text-xs text-gray-500">김학생님이 가입했습니다</p>
              </div>
            </div>
            <span className="text-xs text-gray-500">2시간 전</span>
          </div>
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <Shield className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">교사 권한 승인</p>
                <p className="text-xs text-gray-500">이선생님의 권한이 승인되었습니다</p>
              </div>
            </div>
            <span className="text-xs text-gray-500">5시간 전</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">시스템 백업 완료</p>
                <p className="text-xs text-gray-500">일일 백업이 성공적으로 완료되었습니다</p>
              </div>
            </div>
            <span className="text-xs text-gray-500">1일 전</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
