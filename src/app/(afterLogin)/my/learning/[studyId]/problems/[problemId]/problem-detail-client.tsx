'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Clock, RotateCcw, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface ProblemDetailClientProps {
  studyId: string;
  problemId: string;
  initialProblem?: any;
  nextProblem?: any;
  currentIndex?: number;
  totalCount?: number;
}

export default function ProblemDetailClient({
  studyId,
  problemId,
  initialProblem,
  nextProblem,
  currentIndex = 1,
  totalCount = 1,
}: ProblemDetailClientProps) {
  const router = useRouter();
  const [answer, setAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // 시간 추적
  useEffect(() => {
    if (!startTime || isSubmitted) {
      if (!startTime) {
        setStartTime(new Date());
      }
      return;
    }

    const timer = setInterval(() => {
      if (startTime && !isSubmitted) {
        const now = new Date();
        const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, isSubmitted]);

  // 시간 포맷팅 (메모이제이션)
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // 정답 제출 (메모이제이션)
  const handleSubmit = useCallback(async () => {
    if (!answer.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/problems/${problemId}/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answer: answer.trim(),
          timeSpent: elapsedTime,
          studyId,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setIsCorrect(result.isCorrect);
        setIsSubmitted(true);
      } else {
        console.error('정답 제출 실패:', result.error);
      }
    } catch (error) {
      console.error('정답 제출 중 오류:', error);
    } finally {
      setIsLoading(false);
    }
  }, [answer, elapsedTime, problemId, studyId]);

  // 다음 문제로 (메모이제이션)
  const handleNext = useCallback(() => {
    if (nextProblem) {
      router.push(`/my/learning/${studyId}/problems/${nextProblem.id}`);
    } else {
      // 마지막 문제인 경우 학습 목록으로 돌아가기
      router.push(`/my/learning/${studyId}/problems`);
    }
  }, [router, studyId, nextProblem]);

  // 다시 풀기 (메모이제이션)
  const handleRetry = useCallback(() => {
    setAnswer('');
    setIsSubmitted(false);
    setIsCorrect(false);
    setStartTime(new Date());
    setElapsedTime(0);
  }, []);

  if (!initialProblem) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">문제를 찾을 수 없습니다</h1>
          <Button onClick={() => router.back()} className="mt-4">
            돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{initialProblem.title}</h1>
          <p className="text-gray-600">
            {initialProblem.subject} • {initialProblem.difficulty}
          </p>
          <div className="mt-2 text-sm text-blue-600">
            문제 {currentIndex} / {totalCount}
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>{formatTime(elapsedTime)}</span>
        </div>
      </div>

      {/* 진행률 바 */}
      <div className="w-full rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-blue-600 transition-all duration-300"
          style={{ width: `${(currentIndex / totalCount) * 100}%` }}
        />
      </div>

      {/* 문제 내용 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>문제</span>
            <span
              className="text-sm font-normal text-gray-500"
              aria-label={`문제 유형: ${
                initialProblem.type === 'MULTIPLE_CHOICE'
                  ? '객관식'
                  : initialProblem.type === 'SHORT_ANSWER'
                    ? '주관식'
                    : initialProblem.type === 'ESSAY'
                      ? '서술형'
                      : '기타'
              }`}
            >
              {initialProblem.type === 'MULTIPLE_CHOICE'
                ? '객관식'
                : initialProblem.type === 'SHORT_ANSWER'
                  ? '주관식'
                  : initialProblem.type === 'ESSAY'
                    ? '서술형'
                    : '기타'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none" role="main" aria-label="문제 내용">
            <div dangerouslySetInnerHTML={{ __html: initialProblem.content }} />
          </div>
        </CardContent>
      </Card>

      {/* 객관식 선택지 */}
      {initialProblem.type === 'MULTIPLE_CHOICE' && initialProblem.options && (
        <Card>
          <CardHeader>
            <CardTitle>선택지</CardTitle>
          </CardHeader>
          <CardContent>
            <fieldset disabled={isSubmitted} className="space-y-2">
              <legend className="sr-only">답안 선택</legend>
              {initialProblem.options.map((option: string, index: number) => (
                <label
                  key={index}
                  className="flex cursor-pointer items-center space-x-2 rounded-md p-2 transition-colors hover:bg-gray-50"
                  htmlFor={`option-${index}`}
                >
                  <input
                    id={`option-${index}`}
                    type="radio"
                    name="answer"
                    value={option}
                    checked={answer === option}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAnswer(e.target.value)}
                    disabled={isSubmitted}
                    className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    aria-describedby={`option-${index}-text`}
                  />
                  <span id={`option-${index}-text`} className="text-sm">
                    {option}
                  </span>
                </label>
              ))}
            </fieldset>
          </CardContent>
        </Card>
      )}

      {/* 답안 입력 */}
      {initialProblem.type !== 'MULTIPLE_CHOICE' && (
        <Card>
          <CardHeader>
            <CardTitle>답안</CardTitle>
          </CardHeader>
          <CardContent>
            {initialProblem.type === 'ESSAY' ? (
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="답안을 입력하세요..."
                disabled={isSubmitted}
                rows={6}
                className="w-full"
              />
            ) : (
              <Input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="답안을 입력하세요..."
                disabled={isSubmitted}
                className="w-full"
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* 제출 버튼 */}
      {!isSubmitted && (
        <div className="flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={!answer.trim() || isLoading}
            size="lg"
            className="px-8"
          >
            {isLoading ? '제출 중...' : '정답 제출'}
          </Button>
        </div>
      )}

      {/* 결과 표시 */}
      {isSubmitted && (
        <Card
          className={`border-2 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
        >
          <CardHeader>
            <CardTitle
              className={`flex items-center space-x-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}
            >
              {isCorrect ? (
                <>
                  <CheckCircle className="h-6 w-6" />
                  <span>정답입니다!</span>
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6" />
                  <span>틀렸습니다</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p>소요 시간: {formatTime(elapsedTime)}</p>
                <p>제출한 답안: {answer}</p>
                {!isCorrect && initialProblem.correctAnswer && (
                  <p className="font-medium text-green-600">정답: {initialProblem.correctAnswer}</p>
                )}
              </div>

              {/* 해설 표시 */}
              {initialProblem.explanation && (
                <div className="mt-4 rounded-lg bg-blue-50 p-4">
                  <h4 className="mb-2 font-semibold text-blue-800">해설</h4>
                  <div className="prose max-w-none text-sm">
                    <div dangerouslySetInnerHTML={{ __html: initialProblem.explanation }} />
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <Button onClick={handleRetry} variant="outline" size="sm">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  다시 풀기
                </Button>
                <Button onClick={handleNext} size="sm">
                  {nextProblem ? '다음 문제' : '학습 완료'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
