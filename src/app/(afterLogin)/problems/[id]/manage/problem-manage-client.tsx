'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProblemDifficulty, ProblemType, ReviewStatus } from '@prisma/client';
import { ArrowLeft, BarChart3, Edit, Eye, Settings, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo } from 'react';

interface ProblemManageClientProps {
  problem: {
    id: string;
    title: string;
    description: string | null;
    content: string;
    type: ProblemType;
    difficulty: ProblemDifficulty;
    subject: string;
    gradeLevel: string | null;
    unit: string | null;
    options: string[];
    correctAnswer: string;
    explanation: string | null;
    hints: string[];
    tags: string[];
    points: number;
    timeLimit: number | null;
    isActive: boolean;
    isAIGenerated: boolean;
    reviewStatus: ReviewStatus;
    createdAt: Date;
    updatedAt: Date;
  };
  stats: {
    totalAttempts: number;
    correctAttempts: number;
    correctRate: number;
  };
  userRole: string;
}

const ProblemManageClient = memo(function ProblemManageClient({
  problem,
  stats,
  userRole,
}: ProblemManageClientProps) {
  const router = useRouter();

  const getDifficultyColor = (difficulty: ProblemDifficulty): string => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-100 text-green-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'HARD':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: ProblemType): string => {
    switch (type) {
      case 'MULTIPLE_CHOICE':
        return '객관식';
      case 'SHORT_ANSWER':
        return '단답형';
      case 'ESSAY':
        return '서술형';
      case 'TRUE_FALSE':
        return '참/거짓';
      default:
        return type;
    }
  };

  const getReviewStatusColor = (status: ReviewStatus): string => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'NEEDS_REVISION':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReviewStatusLabel = (status: ReviewStatus): string => {
    switch (status) {
      case 'PENDING':
        return '검토 대기';
      case 'APPROVED':
        return '승인됨';
      case 'REJECTED':
        return '거부됨';
      case 'NEEDS_REVISION':
        return '수정 필요';
      default:
        return status;
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/problems')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            문제 목록으로
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{problem.title}</h1>
            <p className="text-gray-600">문제 관리</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            수정
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            설정
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 문제 정보 */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>문제 정보</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline">{problem.subject}</Badge>
                  <Badge className={getDifficultyColor(problem.difficulty)}>
                    {problem.difficulty}
                  </Badge>
                  <Badge variant="secondary">{getTypeLabel(problem.type)}</Badge>
                  <Badge className={getReviewStatusColor(problem.reviewStatus)}>
                    {getReviewStatusLabel(problem.reviewStatus)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {problem.description && (
                <div>
                  <h4 className="mb-2 font-medium text-gray-900">문제 설명</h4>
                  <p className="text-gray-700">{problem.description}</p>
                </div>
              )}

              <div>
                <h4 className="mb-2 font-medium text-gray-900">문제 내용</h4>
                <div className="rounded-lg border bg-gray-50 p-4">
                  <p className="whitespace-pre-wrap text-gray-700">{problem.content}</p>
                </div>
              </div>

              {problem.type === 'MULTIPLE_CHOICE' && problem.options.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium text-gray-900">선택지</h4>
                  <div className="space-y-2">
                    {problem.options.map((option, index) => (
                      <div
                        key={index}
                        className={`rounded-lg border p-3 ${
                          option === problem.correctAnswer
                            ? 'border-green-200 bg-green-50 text-green-800'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <span className="font-medium">{String.fromCharCode(65 + index)}.</span>{' '}
                        {option}
                        {option === problem.correctAnswer && (
                          <Badge className="ml-2 bg-green-100 text-green-800">정답</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="mb-2 font-medium text-gray-900">정답</h4>
                <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                  <span className="font-medium text-green-800">{problem.correctAnswer}</span>
                </div>
              </div>

              {problem.explanation && (
                <div>
                  <h4 className="mb-2 font-medium text-gray-900">해설</h4>
                  <div className="rounded-lg border bg-blue-50 p-3">
                    <p className="text-blue-800">{problem.explanation}</p>
                  </div>
                </div>
              )}

              {problem.hints.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium text-gray-900">힌트</h4>
                  <div className="space-y-2">
                    {problem.hints.map((hint, index) => (
                      <div key={index} className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                        <span className="text-blue-800">{hint}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 통계 및 메타데이터 */}
        <div className="space-y-6">
          {/* 통계 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                문제 통계
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.correctRate}%</div>
                <div className="text-sm text-gray-600">정답률</div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold">{stats.totalAttempts}</div>
                  <div className="text-sm text-gray-600">총 시도</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-green-600">
                    {stats.correctAttempts}
                  </div>
                  <div className="text-sm text-gray-600">정답</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 메타데이터 */}
          <Card>
            <CardHeader>
              <CardTitle>메타데이터</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">과목</span>
                <span className="font-medium">{problem.subject}</span>
              </div>
              {problem.gradeLevel && (
                <div className="flex justify-between">
                  <span className="text-gray-600">학년</span>
                  <span className="font-medium">{problem.gradeLevel}</span>
                </div>
              )}
              {problem.unit && (
                <div className="flex justify-between">
                  <span className="text-gray-600">단원</span>
                  <span className="font-medium">{problem.unit}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">점수</span>
                <span className="font-medium">{problem.points}점</span>
              </div>
              {problem.timeLimit && (
                <div className="flex justify-between">
                  <span className="text-gray-600">제한시간</span>
                  <span className="font-medium">{problem.timeLimit}분</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">상태</span>
                <Badge variant={problem.isActive ? 'default' : 'secondary'}>
                  {problem.isActive ? '활성' : '비활성'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">AI 생성</span>
                <Badge variant={problem.isAIGenerated ? 'default' : 'outline'}>
                  {problem.isAIGenerated ? 'AI 생성' : '수동 생성'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">생성일</span>
                <span className="text-sm text-gray-500">
                  {new Date(problem.createdAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">수정일</span>
                <span className="text-sm text-gray-500">
                  {new Date(problem.updatedAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 액션 버튼 */}
          <Card>
            <CardHeader>
              <CardTitle>액션</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                미리보기
              </Button>
              <Button className="w-full" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                학생 답안 보기
              </Button>
              <Button className="w-full" variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                상세 통계
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
});

export default ProblemManageClient;
