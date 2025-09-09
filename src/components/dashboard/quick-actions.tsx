import Link from "next/link";
import { Plus, BookOpen, Users, BarChart3 } from "lucide-react";

const quickActions = [
  {
    title: "새 학습 자료 추가",
    description: "학생들을 위한 새로운 학습 자료를 업로드하세요",
    href: "/learning/new",
    icon: Plus,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "문제 생성",
    description: "AI 도움으로 맞춤형 문제를 생성하세요",
    href: "/problems/new",
    icon: BookOpen,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "학생 관리",
    description: "학생들의 학습 진도를 확인하고 관리하세요",
    href: "/students",
    icon: Users,
    color: "bg-purple-100 text-purple-600",
  },
  {
    title: "분석 리포트",
    description: "AI가 생성한 학습 분석 리포트를 확인하세요",
    href: "/reports",
    icon: BarChart3,
    color: "bg-orange-100 text-orange-600",
  },
];

export function QuickActions() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">빠른 작업</h3>
        <p className="text-sm text-gray-600 mt-1">자주 사용하는 기능에 빠르게 접근하세요</p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-start space-x-3">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-lg ${action.color}`}
                  >
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900">{action.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{action.description}</p>
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
