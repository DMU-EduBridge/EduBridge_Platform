'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProblemDifficulty, ProblemType } from '@prisma/client';
import { ArrowLeft, CheckCircle, Clock, Play, RotateCcw } from 'lucide-react';
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

interface StudyProblemsClientProps {
  studyId: string;
  problems: ProblemWithAttempt[];
  userId: string;
}

const StudyProblemsClient = memo(function StudyProblemsClient({
  studyId,
  problems,
  userId,
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
    <div className="container mx-auto max-w-6xl px-4 py-8">
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
            <h1 className="text-2xl font-bold text-gray-900">{studyId}</h1>
            <p className="text-gray-600">단원별 문제 풀이</p>
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

      {/* 문제 목록 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {problems.map((problem) => (
          <Card key={problem.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="line-clamp-2 text-lg">{problem.title}</CardTitle>
                {getStatusBadge(problem)}
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{problem.subject}</Badge>
                <Badge className={getDifficultyColor(problem.difficulty)}>
                  {problem.difficulty}
                </Badge>
                <Badge variant="secondary">{getTypeLabel(problem.type)}</Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              {problem.description && (
                <p className="mb-4 line-clamp-2 text-sm text-gray-600">{problem.description}</p>
              )}

              <div className="mb-4 flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {problem.timeLimit ? `${problem.timeLimit}분` : '제한없음'}
                </div>
                <div>{problem.points}점</div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    router.push(
                      `/my/learning/${encodeURIComponent(studyId)}/problems/${problem.id}`,
                    )
                  }
                  className="flex-1"
                  size="sm"
                >
                  <Play className="mr-1 h-4 w-4" />
                  {problem.attempt ? '다시 풀기' : '문제 풀기'}
                </Button>

                {problem.attempt && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      router.push(
                        `/my/learning/${encodeURIComponent(studyId)}/problems/${problem.id}/review`,
                      )
                    }
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
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
