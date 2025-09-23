import { BarChart3, BookOpen, Plus, Users } from 'lucide-react';
import Link from 'next/link';

const quickActions = [
  {
    title: '새 학습 자료 추가',
    description: '학생들을 위한 새로운 학습 자료를 업로드하세요',
    href: '/learning-materials',
    icon: Plus,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    title: '문제 생성',
    description: 'AI 도움으로 맞춤형 문제를 생성하세요',
    href: '/problems/new',
    icon: BookOpen,
    color: 'bg-green-100 text-green-600',
  },
  {
    title: '학생 관리',
    description: '학생들의 학습 진도를 확인하고 관리하세요',
    href: '/students',
    icon: Users,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    title: '분석 리포트',
    description: 'AI가 생성한 학습 분석 리포트를 확인하세요',
    href: '/reports',
    icon: BarChart3,
    color: 'bg-orange-100 text-orange-600',
  },
];

export function QuickActions() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900">빠른 작업</h3>
        <p className="mt-1 text-sm text-gray-600">자주 사용하는 기능에 빠르게 접근하세요</p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <div className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-all hover:border-blue-300 hover:shadow-sm">
                <div className="flex items-start space-x-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color}`}
                  >
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{action.title}</h4>
                    <p className="mt-1 text-xs text-gray-600">{action.description}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
