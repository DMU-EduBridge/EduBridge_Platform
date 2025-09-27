'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProblemDifficulty, ProblemType } from '@prisma/client';
import { ArrowLeft, CheckCircle, Play, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo } from 'react';

interface ProblemWithAttempt {
  id: string;
  title: string;
  description: string | null;
  type: ProblemType;
  difficulty: ProblemDifficulty;
  subject: string;
  points: number;
  timeLimit: number | null;
  attempt?: {
    isCorrect: boolean;
    attemptedAt: Date;
  };
}

interface LearningMaterial {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  difficulty: string;
}

interface StudyProblemsClientProps {
  studyId: string;
  learningMaterial: LearningMaterial;
  problems: ProblemWithAttempt[];
}

const StudyProblemsClient = memo(function StudyProblemsClient({
  studyId,
  learningMaterial,
  problems,
}: StudyProblemsClientProps) {
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

  const getStatusBadge = (problem: ProblemWithAttempt) => {
    if (!problem.attempt) {
      return <Badge variant="outline">미시도</Badge>;
    }

    return problem.attempt.isCorrect ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="mr-1 h-3 w-3" />
        정답
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">
        <RotateCcw className="mr-1 h-3 w-3" />
        오답
      </Badge>
    );
  };

  const completedCount = problems.filter((p) => p.attempt?.isCorrect).length;
  const totalCount = problems.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="container mx-auto w-full">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/my/learning')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            학습 목록으로
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{learningMaterial.title}</h1>
            <p className="text-gray-600">{learningMaterial.description || '학습 자료 문제 풀이'}</p>
            <div className="mt-2 flex gap-2">
              <Badge variant="outline">{learningMaterial.subject}</Badge>
              <Badge variant="secondary">{learningMaterial.difficulty}</Badge>
            </div>
          </div>
        </div>

        {/* 진행률 표시 */}
        <div className="text-right">
          <div className="text-sm text-gray-600">진행률</div>
          <div className="text-2xl font-bold text-blue-600">{progressPercentage}%</div>
          <div className="text-sm text-gray-500">
            {completedCount}/{totalCount} 완료
          </div>
        </div>
      </div>

      {/* 진행률 바 */}
      <div className="mb-8">
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* 문제 풀기 시작 안내 */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="mb-4 text-xl font-semibold text-gray-900">
              {learningMaterial.title} 문제 풀기
            </h3>
            <p className="mb-6 text-gray-600">
              총 <span className="font-semibold text-blue-600">{totalCount}개</span>의 문제를
              순서대로 풀어보세요.
              <br />각 문제를 풀고 정답을 확인한 후 다음 문제로 넘어갑니다.
            </p>

            <div className="mb-6 flex justify-center">
              <div className="rounded-lg bg-blue-50 p-4">
                <div className="text-sm text-blue-800">
                  <div className="mb-2 font-semibold">학습 진행 상황</div>
                  <div className="text-lg">
                    완료: <span className="font-bold text-blue-600">{completedCount}</span> /{' '}
                    {totalCount}
                  </div>
                  <div className="text-sm text-blue-600">진행률: {progressPercentage}%</div>
                </div>
              </div>
            </div>

            <Button
              onClick={() => {
                console.log('문제 풀기 시작 버튼 클릭됨');
                console.log('studyId:', studyId);
                console.log('problems.length:', problems.length);

                if (problems.length > 0 && problems[0]) {
                  console.log('첫 번째 문제로 직접 이동:', problems[0].id);
                  router.push(`/my/learning/${studyId}/problems/${problems[0].id}`);
                } else {
                  console.log('문제가 없습니다');
                }
              }}
              size="lg"
              className="px-8 py-3 text-lg"
            >
              <Play className="mr-2 h-5 w-5" />
              {completedCount > 0 ? '학습 계속하기' : '문제 풀기 시작'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 문제 목록 (간단한 미리보기) */}
      <div className="mb-6">
        <h4 className="mb-4 text-lg font-semibold text-gray-900">문제 목록</h4>
        <div className="space-y-2">
          {problems.map((problem, index) => (
            <div
              key={problem.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{problem.title}</div>
                  <div className="flex gap-2 text-sm text-gray-500">
                    <Badge variant="outline" className="text-xs">
                      {problem.subject}
                    </Badge>
                    <Badge className={`text-xs ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {getTypeLabel(problem.type)}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(problem)}
                <div className="text-sm text-gray-500">{problem.points}점</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {problems.length === 0 && (
        <div className="py-12 text-center">
          <div className="mb-4 text-gray-500">이 단원에는 아직 문제가 없습니다.</div>
          <Button onClick={() => router.push('/my/learning')}>다른 단원 선택하기</Button>
        </div>
      )}
    </div>
  );
});

export default StudyProblemsClient;
