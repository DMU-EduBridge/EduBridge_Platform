import { Brain, BookOpen, BarChart3, MessageCircle } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI 문제 생성',
    description:
      '교과서 내용을 기반으로 AI가 자동으로 학습 문제를 생성합니다. 벡터 검색으로 관련 내용을 찾아 맥락에 맞는 문제를 만들어냅니다.',
  },
  {
    icon: BookOpen,
    title: '문제 풀이 및 로그 수집',
    description:
      '학생들의 문제 풀이 과정을 실시간으로 추적합니다. 정답률, 소요 시간, 시도 횟수 등 상세한 학습 데이터를 수집합니다.',
  },
  {
    icon: BarChart3,
    title: '학습 리포트 생성',
    description:
      '수집된 학습 로그를 AI가 분석하여 학생별 맞춤 리포트를 자동 생성합니다. 약점 분석과 개선 방안을 제시합니다.',
  },
  {
    icon: MessageCircle,
    title: '챗봇 학습 도우미',
    description:
      'AI 챗봇이 학습 과정에서 궁금한 점을 실시간으로 답변해줍니다. 학습 자료를 기반으로 정확한 정보를 제공합니다.',
  },
];

export function Features() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            시연 핵심 기능
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-600">
            AI 기술로 학습의 전 과정을 자동화하고 효율적으로 관리합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
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
