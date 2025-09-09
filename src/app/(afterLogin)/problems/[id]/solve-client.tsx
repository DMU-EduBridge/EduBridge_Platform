'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  const [tab, setTab] = useState<'solve' | 'solution'>('solve');
  const [selected, setSelected] = useState('');
  const [result, setResult] = useState<null | { correct: boolean; message: string }>(null);
  const [submitted, setSubmitted] = useState(false);
  const { solve, attempt } = useProblems();
  const solutionQuery = solve(problem.id, submitted);
  const attemptMutation = attempt(problem.id);

  const isMultiple = problem.type === 'MULTIPLE_CHOICE';
  const isShort = problem.type === 'SHORT_ANSWER';

  function onSubmit() {
    attemptMutation.mutate(
      { selected },
      {
        onSuccess: (data) => {
          setResult({
            correct: data.correct,
            message: data.correct ? '정답입니다!' : '오답입니다.',
          });
          setSubmitted(true);
          setTab('solution');
        },
        onError: (e: any) => {
          const msg =
            e?.response?.status === 429
              ? '요청이 너무 많습니다. 잠시 후 다시 시도하세요.'
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

          <div className="flex gap-2">
            <Button
              variant={tab === 'solve' ? 'default' : 'outline'}
              onClick={() => setTab('solve')}
            >
              풀이
            </Button>
            <Button
              variant={tab === 'solution' ? 'default' : 'outline'}
              onClick={() => setTab('solution')}
              disabled={!submitted}
            >
              해설
            </Button>
          </div>

          {tab === 'solve' ? (
            <div className="space-y-4">
              {isMultiple && (
                <div className="space-y-2">
                  {problem.options.map((opt, idx) => (
                    <label key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="choice"
                        value={opt}
                        checked={selected === opt}
                        onChange={(e) => setSelected(e.target.value)}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {isShort && (
                <div className="max-w-md">
                  <Input
                    placeholder="정답을 입력하세요"
                    value={selected}
                    onChange={(e) => setSelected(e.target.value)}
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button onClick={onSubmit} disabled={!selected || attemptMutation.isPending}>
                  제출
                </Button>
                {result && (
                  <span className={result.correct ? 'text-green-600' : 'text-red-600'}>
                    {result.message}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {solutionQuery.isLoading && (
                <div className="text-sm text-gray-500">해설 불러오는 중...</div>
              )}
              {solutionQuery.data ? (
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
              ) : (
                !solutionQuery.isLoading && (
                  <div className="text-gray-500">제출 후 해설을 확인할 수 있습니다.</div>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
