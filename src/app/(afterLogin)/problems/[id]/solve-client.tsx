'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProblems } from '@/hooks/problems';
import { useState } from 'react';

export type ProblemViewModel = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  options: string[];
  correctAnswer: string;
  explanation: string | null;
  hints: string[];
};

export default function SolveClient({ problem }: { problem: ProblemViewModel }) {
  const [selected, setSelected] = useState('');
  const [result, setResult] = useState<null | { correct: boolean; message: string }>(null);
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
                : e?.response?.status === 409
                  ? '사용자 정보가 유효하지 않습니다.'
                  : '제출 실패';
          setResult({ correct: false, message: msg });
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{problem.title}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>문제</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {problem.description && (
            <p className="whitespace-pre-wrap text-gray-700">{problem.description}</p>
          )}

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
                />
                <p id="answer-help" className="sr-only">
                  Enter 키를 눌러 답안을 제출할 수 있습니다.
                </p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button onClick={onSubmit} disabled={!selected.trim() || attemptMutation.isPending}>
                {attemptMutation.isPending ? '제출 중...' : '제출'}
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
    </div>
  );
}
