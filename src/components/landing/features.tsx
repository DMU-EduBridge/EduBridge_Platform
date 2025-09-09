import { Brain, Users, BookOpen, BarChart3, MessageCircle, Target } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI 학습 튜터',
    description:
      '학생별 맞춤형 학습 자료와 문제를 제공하고, 실시간 피드백으로 개인화된 학습 경험을 제공합니다.',
  },
  {
    icon: Users,
    title: '선생님-학생 연결',
    description:
      'AI가 학습 데이터를 분석하여 선생님에게 학생별 상세 리포트와 맞춤형 문제를 추천합니다.',
  },
  {
    icon: BookOpen,
    title: '스마트 학습 관리',
    description: '학습 진도, 정답률, 약점 영역을 실시간으로 추적하고 개선 방안을 제시합니다.',
  },
  {
    icon: MessageCircle,
    title: 'AI 진로 상담',
    description: '학생의 성향과 성과를 분석하여 맞춤형 진로 상담과 대학/전공 추천을 제공합니다.',
  },
  {
    icon: BarChart3,
    title: '학습 성과 분석',
    description: '학생별 학습 패턴과 성과를 분석하여 효율적인 학습 방법을 제안합니다.',
  },
  {
    icon: Target,
    title: '맞춤형 문제 추천',
    description:
      'AI가 학생의 약점과 학습 목표를 분석하여 최적의 문제를 추천하고 적응형 학습을 지원합니다.',
  },
];

export function Features() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            교육의 모든 과정을 한 곳에서
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-600">
            AI 기술로 학습부터 진로 상담까지, 교육의 전 과정을 효율적으로 지원합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-200 bg-white p-8 transition-shadow duration-300 hover:shadow-lg"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <feature.icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900">{feature.title}</h3>
              <p className="leading-relaxed text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
