import { TrendingUp, Clock, Users, Award } from "lucide-react";

const stats = [
  {
    icon: TrendingUp,
    value: "98%",
    label: "학습 성취율",
    description: "AI 튜터의 개인화된 학습으로 높은 성취율을 달성",
  },
  {
    icon: Clock,
    value: "30%",
    label: "학습 시간 단축",
    description: "효율적인 학습 경로로 학습 시간을 크게 단축",
  },
  {
    icon: Users,
    value: "2,500+",
    label: "활성 학습자",
    description: "전국 학교의 선생님과 학생들이 플랫폼을 이용 중",
  },
  {
    icon: Award,
    value: "15,000+",
    label: "학습 문제",
    description: "다양한 과목과 난이도의 맞춤형 문제 제공",
  },
];

export function Stats() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">검증된 교육 성과</h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            실제 사용자들의 피드백과 데이터로 입증된 플랫폼의 교육 효과를 확인하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mx-auto mb-6">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold mb-2">{stat.value}</div>
              <div className="text-xl font-semibold mb-2">{stat.label}</div>
              <p className="text-blue-100 text-sm leading-relaxed">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
