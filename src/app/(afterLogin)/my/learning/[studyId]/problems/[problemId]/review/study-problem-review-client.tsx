'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProblemDifficulty, ProblemType } from '@prisma/client';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  FileText,
  MessageSquare,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { memo } from 'react';

interface ProblemViewModel {
  id: string;
  title: string;
  description: string | null;
  type: ProblemType;
  options: string[];
  correctAnswer: string;
  explanation: string | null;
  hints: string[];
  subject: string;
  difficulty: ProblemDifficulty;
}

interface StudyProblemReviewClientProps {
  studyId: string;
  problem: ProblemViewModel;
  userAnswer: string | null;
  isCorrect: boolean;
  attemptedAt: Date | null;
}

const StudyProblemReviewClient = memo(function StudyProblemReviewClient({
  studyId,
  problem,
  userAnswer,
  isCorrect,
  attemptedAt,
}: StudyProblemReviewClientProps) {
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

  return (
    <div className="container">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push(`/my/learning/${encodeURIComponent(studyId)}/problems`)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <p className="text-sm text-gray-500">{studyId} 단원</p>
            <h1 className="text-2xl font-bold text-gray-900">오답체크</h1>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-xl font-semibold text-gray-900">{problem.title}</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">{problem.subject}</Badge>
              <Badge className={getDifficultyColor(problem.difficulty)}>{problem.difficulty}</Badge>
              <Badge variant="secondary">{getTypeLabel(problem.type)}</Badge>
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
                  {problem.options.map((option, index) => (
                    <div
                      key={index}
                      className={`rounded-lg border p-3 ${
                        option === problem.correctAnswer
                          ? 'border-green-200 bg-green-50 text-green-800'
                          : option === userAnswer && !isCorrect
                            ? 'border-red-200 bg-red-50 text-red-800'
                            : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <span className="font-medium">{String.fromCharCode(65 + index)}.</span>{' '}
                      {option}
                      {option === problem.correctAnswer && (
                        <CheckCircle className="ml-2 inline h-4 w-4 text-green-600" />
                      )}
                      {option === userAnswer && !isCorrect && (
                        <XCircle className="ml-2 inline h-4 w-4 text-red-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h4 className="mb-2 font-medium text-gray-900">정답:</h4>
                <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                  <span className="font-medium text-green-800">{problem.correctAnswer}</span>
                </div>
              </div>

              {userAnswer && (
                <div>
                  <h4 className="mb-2 font-medium text-gray-900">내 답안:</h4>
                  <div
                    className={`rounded-lg border p-3 ${
                      isCorrect
                        ? 'border-green-200 bg-green-50 text-green-800'
                        : 'border-red-200 bg-red-50 text-red-800'
                    }`}
                  >
                    <span className="font-medium">{userAnswer}</span>
                  </div>
                </div>
              )}

              {attemptedAt && (
                <div className="text-sm text-gray-500">
                  최근 시도일: {new Date(attemptedAt).toLocaleString()}
                </div>
              )}

              {problem.explanation && (
                <div>
                  <h4 className="mb-2 font-medium text-gray-900">해설:</h4>
                  <div className="rounded-lg border bg-blue-50 p-3">
                    <p className="text-blue-800">{problem.explanation}</p>
                  </div>
                </div>
              )}

              {problem.hints.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium text-gray-900">힌트:</h4>
                  <div className="space-y-2">
                    {problem.hints.map((hint, index) => (
                      <div key={index} className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                        <span className="text-blue-800">{hint}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 액션 버튼 */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={() =>
            router.push(`/my/learning/${encodeURIComponent(studyId)}/problems/${problem.id}`)
          }
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          다시 풀기
        </Button>
        <Button variant="outline" onClick={() => router.push('/my/incorrect-answers')}>
          <FileText className="mr-2 h-4 w-4" />
          오답 노트
        </Button>
        <Button variant="outline" onClick={() => router.push('/ai-assistant')}>
          <MessageSquare className="mr-2 h-4 w-4" />
          AI 도움받기
        </Button>
        <Button variant="outline" onClick={() => router.push('/my/learning')}>
          <BookOpen className="mr-2 h-4 w-4" />
          학습 목록으로
        </Button>
      </div>
    </div>
  );
});

export default StudyProblemReviewClient;
