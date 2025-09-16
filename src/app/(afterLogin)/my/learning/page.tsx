import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { authOptions } from '@/lib/core/auth';
import { BookOpen, CheckCircle, Clock, Target, TrendingUp } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export default async function MyLearningPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== 'STUDENT') {
    redirect('/dashboard');
  }

  // 임시 데이터 (실제로는 API에서 가져와야 함)
  const learningData = {
    stats: {
      totalProblems: 45,
      completedProblems: 32,
      correctAnswers: 28,
      averageScore: 87,
      studyTime: 12.5,
    },
    recentActivity: [
      {
        id: '1',
        type: 'problem',
        title: '이차방정식의 해 구하기',
        subject: '수학',
        difficulty: 'MEDIUM',
        score: 85,
        timeSpent: 15,
        completedAt: '2024-01-20',
        status: 'COMPLETED',
      },
      {
        id: '2',
        type: 'problem',
        title: '광합성의 과정',
        subject: '과학',
        difficulty: 'HARD',
        score: 70,
        timeSpent: 25,
        completedAt: '2024-01-19',
        status: 'COMPLETED',
      },
      {
        id: '3',
        type: 'problem',
        title: '한국의 역사',
        subject: '사회',
        difficulty: 'EASY',
        score: 95,
        timeSpent: 8,
        completedAt: '2024-01-18',
        status: 'COMPLETED',
      },
    ],
    progressBySubject: [
      { subject: '수학', completed: 15, total: 20, percentage: 75 },
      { subject: '과학', completed: 8, total: 12, percentage: 67 },
      { subject: '국어', completed: 5, total: 8, percentage: 63 },
      { subject: '영어', completed: 4, total: 5, percentage: 80 },
    ],
  };

  const getDifficultyBadgeColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-100 text-green-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'HARD':
        return 'bg-red-100 text-red-800';
      case 'EXPERT':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return '쉬움';
      case 'MEDIUM':
        return '보통';
      case 'HARD':
        return '어려움';
      case 'EXPERT':
        return '전문가';
      default:
        return difficulty;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">나의 학습 현황</h1>
        <p className="mt-2 text-gray-600">학습 진행 상황과 성과를 확인하세요.</p>
      </div>

      {/* 학습 통계 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 문제</p>
              <p className="text-2xl font-bold text-gray-900">{learningData.stats.totalProblems}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">완료</p>
              <p className="text-2xl font-bold text-gray-900">
                {learningData.stats.completedProblems}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">정답률</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(
                  (learningData.stats.correctAnswers / learningData.stats.completedProblems) * 100,
                )}
                %
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">평균 점수</p>
              <p className="text-2xl font-bold text-gray-900">{learningData.stats.averageScore}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
              <Clock className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">학습 시간</p>
              <p className="text-2xl font-bold text-gray-900">{learningData.stats.studyTime}h</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 과목별 진행률 */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">과목별 진행률</h3>
          <div className="space-y-4">
            {learningData.progressBySubject.map((subject) => (
              <div key={subject.subject}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{subject.subject}</span>
                  <span className="text-sm text-gray-600">
                    {subject.completed}/{subject.total} ({subject.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{ width: `${subject.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 최근 학습 활동 */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">최근 학습 활동</h3>
          <div className="space-y-4">
            {learningData.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between border-b border-gray-100 pb-4"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                  <div className="mt-1 flex items-center space-x-2">
                    <Badge className={getDifficultyBadgeColor(activity.difficulty)}>
                      {getDifficultyText(activity.difficulty)}
                    </Badge>
                    <span className="text-xs text-gray-500">{activity.subject}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">{activity.timeSpent}분</span>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm font-medium text-gray-900">{activity.score}점</p>
                  <p className="text-xs text-gray-500">{activity.completedAt}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button variant="outline" className="w-full">
              모든 활동 보기
            </Button>
          </div>
        </Card>
      </div>

      {/* 학습 목표 및 권장사항 */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">학습 목표 및 권장사항</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-blue-50 p-4">
            <h4 className="font-medium text-blue-900">이번 주 목표</h4>
            <p className="text-sm text-blue-700">수학 문제 5개, 과학 문제 3개 완료하기</p>
            <div className="mt-2">
              <div className="h-2 w-full rounded-full bg-blue-200">
                <div className="h-2 w-3/4 rounded-full bg-blue-600" />
              </div>
              <p className="mt-1 text-xs text-blue-600">75% 완료</p>
            </div>
          </div>
          <div className="rounded-lg bg-green-50 p-4">
            <h4 className="font-medium text-green-900">AI 추천 학습</h4>
            <p className="text-sm text-green-700">
              과학 개념 이해도가 낮으니 관련 문제를 더 풀어보세요
            </p>
            <Button variant="outline" size="sm" className="mt-2">
              추천 문제 보기
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

