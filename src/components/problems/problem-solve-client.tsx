'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProblems } from '@/hooks/problems';
import { useState } from 'react';

export type ProblemSolveViewModel = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  options: string[];
  correctAnswer: string;
  explanation: string | null;
  hints: string[];
};

export default function ProblemSolveClient({ problem }: { problem: ProblemSolveViewModel }) {
  const [selected, setSelected] = useState('');
  const [result, setResult] = useState<null | {
    correct: boolean;
    message: string;
  }>(null);
  const [submitted, setSubmitted] = useState(false);

  const { solve, attempt } = useProblems();
  const solutionQuery = solve(problem.id, submitted);
  const attemptMutation = attempt(problem.id);

  const isMultiple = problem.type === 'MULTIPLE_CHOICE';
  const isShort = problem.type === 'SHORT_ANSWER';

  function onSubmit() {
    const trimmed = selected.trim();
    if (!trimmed || attemptMutation.isPending) return;

    attemptMutation.mutate(
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
                : '오류가 발생했습니다. 다시 시도해주세요.';
          setResult({
            correct: false,
            message: msg,
          });
        },
      },
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">{problem.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {problem.description && <p className="mb-6 text-gray-700">{problem.description}</p>}

          {/* 객관식 문제 */}
          {isMultiple && problem.options.length > 0 && (
            <div className="space-y-3">
              <Label className="text-lg font-medium">선택하세요:</Label>
              <div className="grid gap-3">
                {problem.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex cursor-pointer items-center rounded-lg border p-4 transition-colors ${
                      selected === option
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="answer"
                      value={option}
                      checked={selected === option}
                      onChange={(e) => setSelected(e.target.value)}
                      className="mr-3"
                    />
                    <span className="font-medium">
                      {String.fromCharCode(65 + index)}. {option}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 단답형 문제 */}
          {isShort && (
            <div className="space-y-3">
              <Label htmlFor="answer" className="text-lg font-medium">
                답을 입력하세요:
              </Label>
              <Input
                id="answer"
                type="text"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                placeholder="답을 입력하세요"
                className="text-lg"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSubmit();
                  }
                }}
              />
            </div>
          )}

          {/* 제출 버튼 */}
          <div className="mt-6 flex justify-center">
            <Button
              onClick={onSubmit}
              disabled={!selected.trim() || attemptMutation.isPending}
              size="lg"
              className="px-8"
            >
              {attemptMutation.isPending ? '제출 중...' : '제출'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 결과 표시 */}
      {result && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div
              className={`rounded-lg p-4 text-center ${
                result.correct ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}
            >
              <p className="text-lg font-medium">{result.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 해설 표시 */}
      {submitted && solutionQuery.data && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>해설</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-gray-700">{solutionQuery.data.explanation}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 힌트 표시 */}
      {problem.hints.length > 0 && (
        <Card>
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
    </div>
  );
}
