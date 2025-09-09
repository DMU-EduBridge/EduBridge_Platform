import { UserPlus, Brain, BookOpen, BarChart3 } from 'lucide-react';

const steps = [
  {
    step: 1,
    icon: UserPlus,
    title: '계정 생성',
    description: '선생님은 클래스를 만들고, 학생들은 가입하여 학습을 시작합니다.',
  },
  {
    step: 2,
    icon: Brain,
    title: 'AI 학습 튜터',
    description: 'AI가 학생의 학습 패턴을 분석하고 맞춤형 학습 자료와 문제를 제공합니다.',
  },
  {
    step: 3,
    icon: BookOpen,
    title: '개인화된 학습',
    description: '학생별 약점과 강점을 파악하여 최적의 학습 경로를 제시합니다.',
  },
  {
    step: 4,
    icon: BarChart3,
    title: '성과 분석 및 상담',
    description:
      '학습 성과를 분석하여 선생님에게 리포트를 제공하고 학생에게 진로 상담을 제공합니다.',
  },
];

export function HowItWorks() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            간단한 4단계로 시작하세요
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-gray-600">
            복잡한 교육 과정을 AI가 단순화하여 효율적이고 개인화된 학습 경험을 제공합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="relative">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                  {step.step}
                </div>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-lg">
                  <step.icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900">{step.title}</h3>
              <p className="leading-relaxed text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>

        {/* 연결선 */}
        <div className="mt-8 hidden lg:block">
          <div className="flex items-center justify-center space-x-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center">
                <div className="h-0.5 w-16 bg-blue-200"></div>
                <div className="mx-2 h-2 w-2 rounded-full bg-blue-400"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
