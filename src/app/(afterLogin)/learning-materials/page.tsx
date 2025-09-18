import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { authOptions } from '@/lib/core/auth';
import { BookOpen, MoreHorizontal, Plus, Search } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: '학습자료 관리 - EduBridge',
  description: '교육 자료를 생성하고 관리할 수 있는 학습자료 관리 페이지',
  robots: 'noindex, nofollow', // 로그인 필요 페이지
};

export default async function LearningMaterialsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.user.role === 'STUDENT') {
    redirect('/problems');
  }

  // 임시 데이터 (실제로는 API에서 가져와야 함)
  const materials = [
    {
      id: '1',
      title: '수학 기초 - 이차방정식',
      description: '이차방정식의 기본 개념과 풀이 방법을 학습합니다.',
      subject: '수학',
      difficulty: 'MEDIUM',
      estimatedTime: 30,
      status: 'PUBLISHED',
      createdAt: '2024-01-15',
      problemsCount: 5,
    },
    {
      id: '2',
      title: '과학 실험 - 광합성',
      description: '식물의 광합성 과정을 실험을 통해 이해합니다.',
      subject: '과학',
      difficulty: 'HARD',
      estimatedTime: 45,
      status: 'PUBLISHED',
      createdAt: '2024-01-16',
      problemsCount: 8,
    },
    {
      id: '3',
      title: '국어 문법 - 조사와 어미',
      description: '한국어의 조사와 어미에 대한 기본 문법을 학습합니다.',
      subject: '국어',
      difficulty: 'EASY',
      estimatedTime: 20,
      status: 'DRAFT',
      createdAt: '2024-01-17',
      problemsCount: 3,
    },
    {
      id: '4',
      title: '영어 문법 - 시제',
      description: '영어의 다양한 시제와 사용법을 학습합니다.',
      subject: '영어',
      difficulty: 'MEDIUM',
      estimatedTime: 35,
      status: 'PUBLISHED',
      createdAt: '2024-01-18',
      problemsCount: 6,
    },
  ];

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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800';
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return '발행됨';
      case 'DRAFT':
        return '초안';
      case 'ARCHIVED':
        return '보관됨';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">학습 자료 관리</h1>
          <p className="mt-2 text-gray-600">학생들을 위한 학습 자료를 생성하고 관리하세요.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />새 자료 생성
        </Button>
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">전체 자료</p>
              <p className="text-2xl font-bold text-gray-900">{materials.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">발행된 자료</p>
              <p className="text-2xl font-bold text-gray-900">
                {materials.filter((m) => m.status === 'PUBLISHED').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
              <BookOpen className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">초안</p>
              <p className="text-2xl font-bold text-gray-900">
                {materials.filter((m) => m.status === 'DRAFT').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 문제 수</p>
              <p className="text-2xl font-bold text-gray-900">
                {materials.reduce((sum, m) => sum + m.problemsCount, 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">학습 자료 목록</h3>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="자료 검색..."
                className="rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm"
              />
            </div>
            <select className="rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="">모든 과목</option>
              <option value="수학">수학</option>
              <option value="과학">과학</option>
              <option value="국어">국어</option>
              <option value="영어">영어</option>
            </select>
            <select className="rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="">모든 난이도</option>
              <option value="EASY">쉬움</option>
              <option value="MEDIUM">보통</option>
              <option value="HARD">어려움</option>
              <option value="EXPERT">전문가</option>
            </select>
            <select className="rounded-md border border-gray-300 px-3 py-2 text-sm">
              <option value="">모든 상태</option>
              <option value="PUBLISHED">발행됨</option>
              <option value="DRAFT">초안</option>
              <option value="ARCHIVED">보관됨</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {materials.map((material) => (
            <div
              key={material.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
            >
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-lg font-medium text-gray-900">{material.title}</h4>
                  <p className="text-sm text-gray-600">{material.description}</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <Badge className={getDifficultyBadgeColor(material.difficulty)}>
                      {getDifficultyText(material.difficulty)}
                    </Badge>
                    <Badge className={getStatusBadgeColor(material.status)}>
                      {getStatusText(material.status)}
                    </Badge>
                    <span className="text-xs text-gray-500">{material.subject}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">{material.estimatedTime}분</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">{material.problemsCount}개 문제</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  편집
                </Button>
                <Button variant="ghost" size="sm">
                  미리보기
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
