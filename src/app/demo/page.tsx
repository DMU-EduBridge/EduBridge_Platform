'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Clock,
  Brain,
  Users,
  BookOpen,
  TrendingUp,
  MessageCircle,
  Award,
} from 'lucide-react';

const demoScenarios = [
  {
    id: 1,
    title: 'AI 학습 튜터 체험',
    description: 'AI가 개인화된 학습 자료를 제공하고 실시간 피드백을 주는 과정을 체험해보세요',
    duration: '5분',
    features: ['개인화된 문제 추천', '실시간 피드백', '학습 진도 분석'],
    icon: Brain,
  },
  {
    id: 2,
    title: '선생님 대시보드 체험',
    description: '학생들의 학습 현황을 한눈에 파악하고 개별 상담을 진행하는 과정을 체험해보세요',
    duration: '3분',
    features: ['학생 진도 모니터링', '성과 분석 리포트', '개별 상담 도구'],
    icon: Users,
  },
  {
    id: 3,
    title: '문제 생성 및 관리',
    description: 'AI 도움으로 맞춤형 문제를 생성하고 학생들에게 배포하는 과정을 체험해보세요',
    duration: '4분',
    features: ['AI 문제 생성', '난이도 자동 조절', '학생별 맞춤 문제'],
    icon: BookOpen,
  },
];

const demoSteps = [
  {
    step: 1,
    title: '학생 로그인',
    description: '학생 계정으로 로그인하여 학습 환경에 접속합니다',
    completed: true,
  },
  {
    step: 2,
    title: 'AI 튜터와 상호작용',
    description: 'AI 튜터가 개인화된 학습 자료를 추천하고 학습을 도와줍니다',
    completed: true,
  },
  {
    step: 3,
    title: '문제 풀이 및 피드백',
    description: '추천받은 문제를 풀고 AI가 실시간으로 피드백을 제공합니다',
    completed: false,
  },
  {
    step: 4,
    title: '진도 확인 및 분석',
    description: '학습 진도와 성과를 확인하고 다음 학습 계획을 세웁니다',
    completed: false,
  },
];

export default function DemoPage() {
  const [currentScenario, setCurrentScenario] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [, setCurrentStep] = useState(0);

  const startDemo = () => {
    setIsPlaying(true);
    // 실제로는 애니메이션이나 인터랙티브 데모 실행
  };

  const pauseDemo = () => {
    setIsPlaying(false);
  };

  const resetDemo = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 헤더 */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <span className="text-sm font-bold text-white">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900">EduBridge</span>
            </Link>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/login">로그인</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">회원가입</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* 메인 헤더 */}
        <div className="mb-12 text-center">
          <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
            EduBridge AI 플랫폼
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              데모 체험
            </span>
          </h1>
          <p className="mx-auto max-w-3xl text-xl text-gray-600">
            실제 사용자처럼 플랫폼의 모든 기능을 체험해보고, AI가 어떻게 교육을 혁신하는지 직접
            확인해보세요.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* 데모 시나리오 선택 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>데모 시나리오</CardTitle>
                <CardDescription>체험하고 싶은 기능을 선택하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {demoScenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className={`cursor-pointer rounded-lg border p-4 transition-all ${
                      currentScenario === scenario.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setCurrentScenario(scenario.id)}
                  >
                    <div className="flex items-start gap-3">
                      <scenario.icon className="mt-1 h-6 w-6 text-blue-600" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{scenario.title}</h3>
                        <p className="mt-1 text-sm text-gray-600">{scenario.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="mr-1 h-3 w-3" />
                            {scenario.duration}
                          </Badge>
                        </div>
                        <div className="mt-2">
                          {scenario.features.map((feature, index) => (
                            <span key={index} className="text-xs text-gray-500">
                              {feature}
                              {index < scenario.features.length - 1 && ' • '}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* 데모 실행 영역 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {demoScenarios.find((s) => s.id === currentScenario)?.title}
                    </CardTitle>
                    <CardDescription>
                      {demoScenarios.find((s) => s.id === currentScenario)?.description}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={isPlaying ? pauseDemo : startDemo}
                      variant={isPlaying ? 'outline' : 'default'}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="mr-2 h-4 w-4" />
                          일시정지
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          시작
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={resetDemo}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      다시 시작
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* 데모 화면 시뮬레이션 */}
                <div className="flex min-h-[400px] items-center justify-center rounded-lg bg-gray-50 p-8">
                  {isPlaying ? (
                    <div className="text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                        <Play className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-gray-900">데모 실행 중...</h3>
                      <p className="text-gray-600">실제 플랫폼 환경에서 기능을 체험하고 있습니다</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
                        <Play className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold text-gray-900">
                        데모를 시작하세요
                      </h3>
                      <p className="text-gray-600">
                        왼쪽에서 시나리오를 선택하고 데모를 시작해보세요
                      </p>
                    </div>
                  )}
                </div>

                {/* 진행 단계 */}
                <div className="mt-6">
                  <h4 className="mb-4 font-semibold text-gray-900">진행 단계</h4>
                  <div className="space-y-3">
                    {demoSteps.map((step) => (
                      <div key={step.step} className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            step.completed
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {step.completed ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <span className="text-sm font-medium">{step.step}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h5
                            className={`font-medium ${
                              step.completed ? 'text-gray-900' : 'text-gray-500'
                            }`}
                          >
                            {step.title}
                          </h5>
                          <p
                            className={`text-sm ${
                              step.completed ? 'text-gray-600' : 'text-gray-400'
                            }`}
                          >
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 기능 하이라이트 */}
        <div className="mt-16">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
            체험할 수 있는 주요 기능
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="text-center">
              <CardContent className="p-6">
                <Brain className="mx-auto mb-4 h-12 w-12 text-blue-600" />
                <h3 className="mb-2 font-semibold text-gray-900">AI 학습 튜터</h3>
                <p className="text-sm text-gray-600">개인화된 학습 자료와 실시간 피드백</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <TrendingUp className="mx-auto mb-4 h-12 w-12 text-green-600" />
                <h3 className="mb-2 font-semibold text-gray-900">성과 분석</h3>
                <p className="text-sm text-gray-600">학습 진도와 성과를 실시간으로 분석</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <MessageCircle className="mx-auto mb-4 h-12 w-12 text-purple-600" />
                <h3 className="mb-2 font-semibold text-gray-900">진로 상담</h3>
                <p className="text-sm text-gray-600">AI 기반 개인 맞춤형 진로 상담</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Award className="mx-auto mb-4 h-12 w-12 text-orange-600" />
                <h3 className="mb-2 font-semibold text-gray-900">성취 관리</h3>
                <p className="text-sm text-gray-600">학습 목표 달성과 성취도 관리</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-12">
              <h2 className="mb-4 text-3xl font-bold">지금 바로 시작하세요!</h2>
              <p className="mb-8 text-xl opacity-90">
                데모 체험 후 실제 플랫폼에서 AI 교육의 혁신을 경험해보세요
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/signup">무료로 시작하기</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                  asChild
                >
                  <Link href="/login">로그인하기</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
