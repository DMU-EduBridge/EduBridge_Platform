'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  getProblemDifficultyConfig,
  getProblemStatusConfig,
  getProblemTypeConfig,
} from '@/types/domain/problem';
import { ArrowLeft, BarChart3, Edit, Eye, Settings, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo, useState } from 'react';

interface ProblemManageViewModel {
  id: string;
  title: string;
  description: string | null;
  content: string;
  type: string;
  difficulty: string;
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
  reviewStatus: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProblemStats {
  totalAttempts: number;
  correctAttempts: number;
  correctRate: number;
  // 전체 시스템 통계
  totalProblems?: number;
  activeProblems?: number;
  systemTotalAttempts?: number;
  systemCorrectRate?: number;
}

interface ProblemManageClientProps {
  problem: ProblemManageViewModel;
  stats: ProblemStats;
}

const ProblemManageClient = memo(function ProblemManageClient({
  problem,
  stats,
}: ProblemManageClientProps) {
  const router = useRouter();
  const [showPreview, setShowPreview] = useState(false);

  const difficultyConfig = getProblemDifficultyConfig(problem.difficulty);
  const statusConfig = getProblemStatusConfig(problem.isActive ? 'ACTIVE' : 'DRAFT');
  const typeConfig = getProblemTypeConfig(problem.type);

  const getReviewStatusColor = (status: string): string => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'NEEDS_REVISION':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReviewStatusLabel = (status: string): string => {
    switch (status) {
      case 'APPROVED':
        return '승인됨';
      case 'PENDING':
        return '검토 대기';
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
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            뒤로가기
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{problem.title}</h1>
            <p className="text-gray-600">문제 관리 및 통계</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
            <Eye className="mr-2 h-4 w-4" />
            미리보기
          </Button>
          <Button size="sm">
            <Edit className="mr-2 h-4 w-4" />
            편집
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* 메인 콘텐츠 */}
        <div className="space-y-6 lg:col-span-2">
          {/* 문제 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                문제 정보
                <div className="flex gap-2">
                  <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                  <Badge className={difficultyConfig.color}>{difficultyConfig.label}</Badge>
                  <Badge variant="secondary">{typeConfig.label}</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">과목</h4>
                <p className="text-gray-600">{problem.subject}</p>
              </div>

              {problem.description && (
                <div>
                  <h4 className="font-medium text-gray-900">설명</h4>
                  <p className="text-gray-600">{problem.description}</p>
                </div>
              )}

              <div>
                <h4 className="font-medium text-gray-900">문제 내용</h4>
                <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-gray-700">{problem.content}</p>
                </div>
              </div>

              {/* 객관식 옵션 */}
              {problem.type === 'MULTIPLE_CHOICE' && problem.options.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900">선택지</h4>
                  <div className="mt-2 space-y-2">
                    {problem.options.map((option, index) => {
                      const correctAnswerIndex = problem.options.findIndex(
                        (opt) => opt === problem.correctAnswer,
                      );
                      const isCorrectAnswer = index === correctAnswerIndex;

                      return (
                        <div
                          key={index}
                          className={`rounded-lg border p-3 ${
                            isCorrectAnswer
                              ? 'border-green-200 bg-green-50'
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <span className="font-medium">{String.fromCharCode(65 + index)}.</span>{' '}
                          {option}
                          {isCorrectAnswer && (
                            <Badge className="ml-2 bg-green-100 text-green-800">정답</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 정답 */}
              <div>
                <h4 className="font-medium text-gray-900">정답</h4>
                <div className="mt-2 rounded-lg border border-green-200 bg-green-50 p-3">
                  <span className="font-medium text-green-800">{problem.correctAnswer}</span>
                </div>
              </div>

              {/* 해설 */}
              {problem.explanation && (
                <div>
                  <h4 className="font-medium text-gray-900">해설</h4>
                  <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <p className="text-blue-800">{problem.explanation}</p>
                  </div>
                </div>
              )}

              {/* 힌트 */}
              {problem.hints.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900">힌트</h4>
                  <div className="mt-2 space-y-2">
                    {problem.hints.map((hint, index) => (
                      <div
                        key={index}
                        className="rounded-lg border border-yellow-200 bg-yellow-50 p-3"
                      >
                        <span className="text-yellow-800">{hint}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 태그 */}
              {problem.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900">태그</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {problem.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 사이드바 */}
        <div className="space-y-6 p-6">
          {/* 전체 시스템 통계 */}
          {(stats.totalProblems !== undefined || stats.activeProblems !== undefined) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  전체 시스템 통계
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.totalProblems !== undefined && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">총 문제수</span>
                    </div>
                    <span className="font-semibold">{stats.totalProblems}</span>
                  </div>
                )}
                {stats.activeProblems !== undefined && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">활성 문제</span>
                    </div>
                    <span className="font-semibold">{stats.activeProblems}</span>
                  </div>
                )}
                {stats.systemTotalAttempts !== undefined && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">총 시도수</span>
                    </div>
                    <span className="font-semibold">{stats.systemTotalAttempts}</span>
                  </div>
                )}
                {stats.systemCorrectRate !== undefined && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">평균 정답률</span>
                    </div>
                    <span className="font-semibold">{stats.systemCorrectRate}%</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 개별 문제 통계 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />이 문제 통계
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">총 시도</span>
                </div>
                <span className="font-semibold">{stats.totalAttempts}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">정답률</span>
                </div>
                <span className="font-semibold">{stats.correctRate}%</span>
              </div>
            </CardContent>
          </Card>

          {/* 문제 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">점수</span>
                <span className="font-semibold">{problem.points}점</span>
              </div>
              {problem.timeLimit && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">제한 시간</span>
                  <span className="font-semibold">{problem.timeLimit}분</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">AI 생성</span>
                <Badge
                  className={
                    problem.isAIGenerated
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }
                >
                  {problem.isAIGenerated ? '예' : '아니오'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">검토 상태</span>
                <Badge className={getReviewStatusColor(problem.reviewStatus)}>
                  {getReviewStatusLabel(problem.reviewStatus)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* 메타 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>메타 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <div>생성일: {new Date(problem.createdAt).toLocaleDateString()}</div>
              <div>수정일: {new Date(problem.updatedAt).toLocaleDateString()}</div>
              {problem.gradeLevel && <div>학년: {problem.gradeLevel}</div>}
              {problem.unit && <div>단원: {problem.unit}</div>}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 미리보기 모달 */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>문제 미리보기</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* 문제 제목 */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{problem.title}</h2>
              {problem.description && <p className="mt-2 text-gray-600">{problem.description}</p>}
            </div>

            {/* 문제 내용 */}
            <div className="prose max-w-none">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="whitespace-pre-wrap text-gray-800">{problem.content}</p>
              </div>
            </div>

            {/* 객관식 옵션 */}
            {problem.type === 'MULTIPLE_CHOICE' && problem.options.length > 0 && (
              <div>
                <h4 className="mb-3 font-medium text-gray-900">선택지</h4>
                <div className="space-y-2">
                  {problem.options.map((option, index) => {
                    const correctAnswerIndex = problem.options.findIndex(
                      (opt) => opt === problem.correctAnswer,
                    );
                    const isCorrectAnswer = index === correctAnswerIndex;

                    return (
                      <div
                        key={index}
                        className={`rounded-lg border p-3 ${
                          isCorrectAnswer
                            ? 'border-green-200 bg-green-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <span className="font-medium">{String.fromCharCode(65 + index)}.</span>{' '}
                        {option}
                        {isCorrectAnswer && (
                          <Badge className="ml-2 bg-green-100 text-green-800">정답</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 해설 */}
            {problem.explanation && (
              <div>
                <h4 className="mb-3 font-medium text-gray-900">해설</h4>
                <div className="rounded-lg bg-blue-50 p-4">
                  <p className="whitespace-pre-wrap text-gray-800">{problem.explanation}</p>
                </div>
              </div>
            )}

            {/* 힌트 */}
            {problem.hints.length > 0 && (
              <div>
                <h4 className="mb-3 font-medium text-gray-900">힌트</h4>
                <div className="space-y-2">
                  {problem.hints.map((hint, index) => (
                    <div key={index} className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <span className="text-blue-800">{hint}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 문제 정보 */}
            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div>
                <span className="text-sm text-gray-500">과목:</span>
                <span className="ml-2 font-medium">{problem.subject}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">난이도:</span>
                <span className="ml-2 font-medium">{difficultyConfig.label}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">유형:</span>
                <span className="ml-2 font-medium">{typeConfig.label}</span>
              </div>
              <div>
                <span className="text-sm text-gray-500">점수:</span>
                <span className="ml-2 font-medium">{problem.points}점</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

export default ProblemManageClient;
