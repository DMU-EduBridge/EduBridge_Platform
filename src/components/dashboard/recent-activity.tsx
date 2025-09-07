import { Clock, User, BookOpen, MessageCircle } from "lucide-react";

const activities = [
  {
    id: 1,
    type: "learning",
    title: "새로운 학습 자료가 추가되었습니다",
    description: '김학생님이 "수학 기초" 학습 자료를 완료했습니다.',
    time: "2시간 전",
    icon: BookOpen,
  },
  {
    id: 2,
    type: "problem",
    title: "문제 풀이 완료",
    description: "박학생님이 수학 문제 5개를 모두 정답으로 풀었습니다.",
    time: "4시간 전",
    icon: Clock,
  },
  {
    id: 3,
    type: "counseling",
    title: "진로 상담 요청",
    description: "이학생님이 AI 진로 상담을 요청했습니다.",
    time: "1일 전",
    icon: MessageCircle,
  },
  {
    id: 4,
    type: "report",
    title: "학습 분석 리포트 생성",
    description: "주간 학습 분석 리포트가 자동으로 생성되었습니다.",
    time: "2일 전",
    icon: User,
  },
];

export function RecentActivity() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">최근 활동</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full">
                <activity.icon className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            모든 활동 보기 →
          </button>
        </div>
      </div>
    </div>
  );
}
