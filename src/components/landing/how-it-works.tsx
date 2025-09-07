import { UserPlus, Brain, BookOpen, BarChart3 } from "lucide-react";

const steps = [
  {
    step: 1,
    icon: UserPlus,
    title: "계정 생성",
    description: "선생님은 클래스를 만들고, 학생들은 가입하여 학습을 시작합니다.",
  },
  {
    step: 2,
    icon: Brain,
    title: "AI 학습 튜터",
    description: "AI가 학생의 학습 패턴을 분석하고 맞춤형 학습 자료와 문제를 제공합니다.",
  },
  {
    step: 3,
    icon: BookOpen,
    title: "개인화된 학습",
    description: "학생별 약점과 강점을 파악하여 최적의 학습 경로를 제시합니다.",
  },
  {
    step: 4,
    icon: BarChart3,
    title: "성과 분석 및 상담",
    description:
      "학습 성과를 분석하여 선생님에게 리포트를 제공하고 학생에게 진로 상담을 제공합니다.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            간단한 4단계로 시작하세요
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            복잡한 교육 과정을 AI가 단순화하여 효율적이고 개인화된 학습 경험을 제공합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="relative">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mx-auto mb-6 text-xl font-bold">
                  {step.step}
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-white rounded-lg mx-auto mb-4 shadow-lg">
                  <step.icon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        {/* 연결선 */}
        <div className="hidden lg:block mt-8">
          <div className="flex justify-center items-center space-x-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center">
                <div className="w-16 h-0.5 bg-blue-200"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full mx-2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
