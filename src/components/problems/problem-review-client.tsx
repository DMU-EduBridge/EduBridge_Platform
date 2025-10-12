'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getProblemDifficultyConfig, getProblemTypeConfig } from '@/types/domain/problem';
import { ArrowLeft, BookOpen, CheckCircle, RotateCcw, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo } from 'react';

export interface ProblemReviewViewModel {
  id: string;
  title: string;
  description: string | null;
  type: string;
  options: string[];
  correctAnswer: string;
  explanation: string | null;
  hints: string[];
  subject: string;
  difficulty: string;
  userAnswer: string | null;
  isCorrect: boolean;
  attemptedAt: Date | null;
}

interface ProblemReviewClientProps {
  problem: ProblemReviewViewModel;
}

const ProblemReviewClient = memo(function ProblemReviewClient({
  problem,
}: ProblemReviewClientProps) {
  const router = useRouter();

  const difficultyConfig = getProblemDifficultyConfig(problem.difficulty);
  const typeConfig = getProblemTypeConfig(problem.type);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* 헤더 */}
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          뒤로가기
        </Button>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">오답 체크</h1>
        </div>
      </div>

      {/* 문제 정보 */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{problem.title}</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">{problem.subject}</Badge>
              <Badge className={difficultyConfig.color}>{difficultyConfig.label}</Badge>
              <Badge variant="secondary">{typeConfig.label}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            {problem.description && <p className="mb-4 text-gray-700">{problem.description}</p>}

            {/* 객관식 옵션 표시 */}
            {problem.type === 'MULTIPLE_CHOICE' && problem.options.length > 0 && (
              <div className="mb-4 space-y-2">
                <h4 className="font-medium text-gray-900">선택지:</h4>
                <div className="grid gap-2">
                  {problem.options.map((option, index) => {
                    const correctAnswerIndex = problem.options.findIndex(
                      (opt) => opt === problem.correctAnswer,
                    );
                    const userAnswerIndex = problem.options.findIndex(
                      (opt) => opt === problem.userAnswer,
                    );
                    const isCorrectAnswer = index === correctAnswerIndex;
                    const isUserAnswer = index === userAnswerIndex;

                    return (
                      <div
                        key={index}
                        className={`rounded-lg border p-3 ${
                          isCorrectAnswer
                            ? 'border-green-200 bg-green-50 text-green-800'
                            : isUserAnswer && !problem.isCorrect
                              ? 'border-red-200 bg-red-50 text-red-800'
                              : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <span className="font-medium">{String.fromCharCode(65 + index)}.</span>{' '}
                        {option}
                        {isCorrectAnswer && (
                          <CheckCircle className="ml-2 inline h-4 w-4 text-green-600" />
                        )}
                        {isUserAnswer && !problem.isCorrect && (
                          <XCircle className="ml-2 inline h-4 w-4 text-red-600" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 답안 결과 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {problem.isCorrect ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            답안 결과
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 font-medium text-gray-900">정답:</h4>
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <span className="font-medium text-green-800">{problem.correctAnswer}</span>
              </div>
            </div>

            {problem.userAnswer && (
              <div>
                <h4 className="mb-2 font-medium text-gray-900">내 답안:</h4>
                <div
                  className={`rounded-lg border p-3 ${
                    problem.isCorrect
                      ? 'border-green-200 bg-green-50 text-green-800'
                      : 'border-red-200 bg-red-50 text-red-800'
                  }`}
                >
                  <span className="font-medium">{problem.userAnswer}</span>
                </div>
              </div>
            )}

            {problem.attemptedAt && (
              <div className="text-sm text-gray-500">
                제출 시간: {new Date(problem.attemptedAt).toLocaleString('ko-KR')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 해설 */}
      {problem.explanation && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>해설</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-gray-700">{problem.explanation}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 힌트 */}
      {problem.hints.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>힌트</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {problem.hints.map((hint, index) => (
                <div key={index} className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <span className="text-blue-800">{hint}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 액션 버튼 */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={() => router.push(`/problems/${problem.id}`)}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          다시 풀기
        </Button>
        <Button variant="outline" onClick={() => router.push('/my/learning')}>
          학습 목록으로
        </Button>
      </div>
    </div>
  );
});

export default ProblemReviewClient;
