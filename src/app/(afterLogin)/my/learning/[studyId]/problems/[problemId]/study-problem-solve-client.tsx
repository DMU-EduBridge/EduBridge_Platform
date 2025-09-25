'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProblems } from '@/hooks/problems';
import { ProblemDifficulty, ProblemType } from '@prisma/client';
import { ArrowLeft, Clock, RotateCcw, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface StudyProblemSolveClientProps {
  studyId: string;
  problem: {
    id: string;
    title: string;
    description: string | null;
    content: string;
    type: ProblemType;
    difficulty: ProblemDifficulty;
    subject: string;
    options: string[];
    correctAnswer: string;
    explanation: string | null;
    hints: string[];
    points: number;
    timeLimit: number | null;
  };
  attempt?: {
    selected: string;
    isCorrect: boolean;
    createdAt: Date;
  };
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  userId: string;
}

export default function StudyProblemSolveClient({
  studyId,
  problem,
  attempt,
  progress,
  userId,
}: StudyProblemSolveClientProps) {
  const router = useRouter();
  const [selected, setSelected] = useState(attempt?.selected || '');
  const [result, setResult] = useState<null | { correct: boolean; message: string }>(null);
  const [submitted, setSubmitted] = useState(!!attempt);
  const { solve, attempt: attemptMutation } = useProblems();
  const solutionQuery = solve(problem.id, submitted);
  const attemptMutationHook = attemptMutation(problem.id);

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

  const isMultiple = problem.type === 'MULTIPLE_CHOICE';
  const isShort = problem.type === 'SHORT_ANSWER';

  function onSubmit() {
    const trimmed = selected.trim();
    if (!trimmed || attemptMutationHook.isPending) return;

    attemptMutationHook.mutate(
      { selected: trimmed },
      {
        onSuccess: (data) => {
          setResult({
            correct: data.correct,
            message: data.correct ? '정답입니다!' : '오답입니다.',
          });
          setSubmitted(true);
        },
        onError: (e: any) => {
          const msg =
            e?.response?.status === 429
              ? '요청이 너무 많습니다. 잠시 후 다시 시도하세요.'
              : e?.response?.status === 404
                ? '문제를 찾을 수 없습니다.'
                : e?.response?.status === 409
                  ? '사용자 정보가 유효하지 않습니다.'
                  : '제출 실패';
          setResult({ correct: false, message: msg });
        },
      },
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/my/learning/${encodeURIComponent(studyId)}/problems`)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            단원으로 돌아가기
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{problem.title}</h1>
            <p className="text-gray-600">{studyId}</p>
          </div>
        </div>

        {/* 단원 진행률 */}
        <div className="text-right">
          <div className="mb-1 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-600">단원 진행률</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{progress.percentage}%</div>
          <div className="text-sm text-gray-500">
            {progress.completed}/{progress.total} 완료
          </div>
        </div>
      </div>

      {/* 진행률 바 */}
      <div className="mb-6">
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* 문제 정보 */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>문제</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">{problem.subject}</Badge>
              <Badge className={getDifficultyColor(problem.difficulty)}>{problem.difficulty}</Badge>
              <Badge variant="secondary">{getTypeLabel(problem.type)}</Badge>
              <Badge variant="outline">{problem.points}점</Badge>
              {problem.timeLimit && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {problem.timeLimit}분
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {problem.description && (
            <p className="whitespace-pre-wrap text-gray-700">{problem.description}</p>
          )}

          <div className="rounded-lg border bg-gray-50 p-4">
            <p className="whitespace-pre-wrap text-gray-700">{problem.content}</p>
          </div>

          <div className="space-y-4">
            {isMultiple && (
              <fieldset className="space-y-2">
                <legend className="sr-only">답안 선택</legend>
                {problem.options.map((opt, idx) => (
                  <label key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="choice"
                      value={opt}
                      checked={selected === opt}
                      onChange={(e) => setSelected(e.target.value)}
                      aria-describedby={`option-${idx}`}
                      disabled={submitted}
                    />
                    <span id={`option-${idx}`}>{opt}</span>
                  </label>
                ))}
              </fieldset>
            )}

            {isShort && (
              <div className="max-w-md">
                <Label htmlFor="answer-input" className="sr-only">
                  정답 입력
                </Label>
                <Input
                  id="answer-input"
                  placeholder="정답을 입력하세요"
                  value={selected}
                  onChange={(e) => {
                    setSelected(e.target.value);
                    if (result) setResult(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      onSubmit();
                    }
                  }}
                  aria-describedby="answer-help"
                  disabled={submitted}
                />
                <p id="answer-help" className="sr-only">
                  Enter 키를 눌러 답안을 제출할 수 있습니다.
                </p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                onClick={onSubmit}
                disabled={!selected.trim() || attemptMutationHook.isPending || submitted}
              >
                {attemptMutationHook.isPending ? '제출 중...' : submitted ? '이미 제출됨' : '제출'}
              </Button>
              {result && (
                <span className={result.correct ? 'text-green-600' : 'text-red-600'}>
                  {result.message}
                </span>
              )}
            </div>

            {submitted && (
              <div className="space-y-3 border-t pt-4">
                {solutionQuery.isLoading && (
                  <div className="text-sm text-gray-500">해설 불러오는 중...</div>
                )}
                {solutionQuery.data && (
                  <>
                    <div className="rounded-md border p-4">
                      <div className="mb-1 text-sm text-gray-500">정답</div>
                      <div className="font-medium">{solutionQuery.data.correctAnswer}</div>
                    </div>
                    {solutionQuery.data.explanation || solutionQuery.data.hints.length > 0 ? (
                      <div className="space-y-2 rounded-md border p-4">
                        <div className="text-sm font-medium">해설</div>
                        {solutionQuery.data.explanation && (
                          <div className="whitespace-pre-wrap text-gray-700">
                            {solutionQuery.data.explanation}
                          </div>
                        )}
                        {solutionQuery.data.hints.length > 0 && (
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="font-medium">힌트</div>
                            {solutionQuery.data.hints.map((h: string, i: number) => (
                              <div key={i}>- {h}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-500">해설이 없습니다.</div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 액션 버튼 */}
      <div className="flex justify-center gap-4">
        {submitted && !attempt?.isCorrect && (
          <Button
            variant="outline"
            onClick={() =>
              router.push(
                `/my/learning/${encodeURIComponent(studyId)}/problems/${problem.id}/review`,
              )
            }
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            오답체크
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => router.push(`/my/learning/${encodeURIComponent(studyId)}/problems`)}
        >
          단원 목록으로
        </Button>
      </div>
    </div>
  );
}
