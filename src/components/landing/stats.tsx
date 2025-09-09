import { TrendingUp, Clock, Users, Award } from 'lucide-react';

const stats = [
  {
    icon: TrendingUp,
    value: '98%',
    label: '학습 성취율',
    description: 'AI 튜터의 개인화된 학습으로 높은 성취율을 달성',
  },
  {
    icon: Clock,
    value: '30%',
    label: '학습 시간 단축',
    description: '효율적인 학습 경로로 학습 시간을 크게 단축',
  },
  {
    icon: Users,
    value: '2,500+',
    label: '활성 학습자',
    description: '전국 학교의 선생님과 학생들이 플랫폼을 이용 중',
  },
  {
    icon: Award,
    value: '15,000+',
    label: '학습 문제',
    description: '다양한 과목과 난이도의 맞춤형 문제 제공',
  },
];

export function Stats() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">검증된 교육 성과</h2>
          <p className="mx-auto max-w-3xl text-xl text-blue-100">
            실제 사용자들의 피드백과 데이터로 입증된 플랫폼의 교육 효과를 확인하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                <stat.icon className="h-8 w-8 text-white" />
              </div>
              <div className="mb-2 text-4xl font-bold">{stat.value}</div>
              <div className="mb-2 text-xl font-semibold">{stat.label}</div>
              <p className="text-sm leading-relaxed text-blue-100">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
