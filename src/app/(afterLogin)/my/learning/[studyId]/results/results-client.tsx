'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ROUTES } from '@/lib/constants/learning';
import {
  calculatePercentage,
  calculateScore,
  getGrade,
  parseWrongOnlyParam,
} from '@/lib/utils/learning-utils';
import type { LearningStatus, ResultsClientProps } from '@/types/learning';
import { CheckCircle, Home, RotateCcw, XCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 학습 결과 페이지 클라이언트 컴포넌트
 * @param props 컴포넌트 props
 * @returns JSX.Element
 */

export default function ResultsClient({ studyId, problems, learningMaterial }: ResultsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cameFromWrongOnly = parseWrongOnlyParam(searchParams);
  const queryClient = useQueryClient();

  // API에서 학습 완료 상태 가져오기
  const [learningStatus, setLearningStatus] = useState<LearningStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reportStatus, setReportStatus] = useState<'idle' | 'pending' | 'success' | 'exists' | 'error'>(
    'idle',
  );
  const [reportError, setReportError] = useState<string | null>(null);
  const reportRequestedRef = useRef(false);

  useEffect(() => {
    const fetchLearningStatus = async () => {
      try {
        // URL에서 startNewAttempt 파라미터 확인
        const startNewAttemptParam = searchParams?.get('startNewAttempt');
        let url = `/api/learning/complete?studyId=${encodeURIComponent(studyId)}`;

        if (startNewAttemptParam) {
          url += `&startNewAttempt=${encodeURIComponent(startNewAttemptParam)}`;
        }

        const response = await fetch(url);
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setLearningStatus(result.data);
          }
        }
      } catch (error) {
        console.error('학습 상태 조회 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLearningStatus();
  }, [studyId, searchParams]);

  // API 데이터 사용
  const correctAnswers = learningStatus?.correctAnswers || 0;
  const wrongAnswers = learningStatus?.wrongAnswers || 0;
  const totalProblems = learningStatus?.totalProblems || problems.length;
  const currentAttemptNumber = learningStatus?.attemptNumber || 1;

  // "다시 풀기"를 위한 다음 시도 번호 계산
  const [nextAttemptNumber, setNextAttemptNumber] = useState(currentAttemptNumber + 1);

  // learningStatus가 업데이트될 때 nextAttemptNumber도 업데이트
  useEffect(() => {
    if (learningStatus?.attemptNumber) {
      setNextAttemptNumber(learningStatus.attemptNumber + 1);
    }
  }, [learningStatus?.attemptNumber]);

  const triggerReportGeneration = useCallback(
    async (manual = false) => {
      if (!manual && reportRequestedRef.current) {
        return;
      }

      reportRequestedRef.current = true;

      setReportError(null);
      setReportStatus('pending');

      try {
        const response = await fetch('/api/my/reports/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ studyId }),
        });

        const result = await response.json().catch(() => null);

        if (!response.ok || !result?.success) {
          throw new Error(result?.error || 'AI 리포트 생성에 실패했습니다.');
        }

        setReportStatus(result.data?.alreadyExists ? 'exists' : 'success');
        queryClient.invalidateQueries({ queryKey: ['student-reports'], exact: false });
      } catch (error) {
        setReportStatus('error');
        const message =
          error instanceof Error ? error.message : 'AI 리포트 생성에 실패했습니다.';
        setReportError(message);

        if (!manual) {
          reportRequestedRef.current = false;
        }
      }
    },
    [studyId, queryClient],
  );

  useEffect(() => {
    if (learningStatus?.isCompleted && !reportRequestedRef.current) {
      void triggerReportGeneration(false);
    }
  }, [learningStatus?.isCompleted, triggerReportGeneration]);

  console.log('learningStatus', learningStatus);
  console.log('correctAnswers', correctAnswers);
  console.log('wrongAnswers', wrongAnswers);
  console.log('totalProblems', totalProblems);
  console.log('currentAttemptNumber', currentAttemptNumber);

  const totalPoints = problems.reduce((sum, p) => sum + p.points, 0);
  const earnedPoints = calculateScore(correctAnswers, totalProblems, totalPoints);
  const percentage = calculatePercentage(correctAnswers, totalProblems);

  const handleBackToLearning = () => {
    if (cameFromWrongOnly) {
      router.push(ROUTES.INCORRECT_ANSWERS);
      return;
    }
    router.push(ROUTES.LEARNING);
  };

  const handleRetry = async () => {
    // 다시 풀기: 다음 시도 번호로 새로운 시도 시작을 명시적으로 요청
    router.push(
      `/my/learning/${encodeURIComponent(studyId)}/problems?retry=1&startNewAttempt=${nextAttemptNumber}`,
    );
  };

  const gradeInfo = getGrade(percentage);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBackToLearning} className="px-4 py-2">
            <Home className="mr-2 h-4 w-4" />
            {cameFromWrongOnly ? '오답 노트' : '학습 홈'}
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">학습 결과</h1>
          <span className="text-sm text-gray-500">{currentAttemptNumber}번째 시도 완료</span>
        </div>
        {learningStatus?.isCompleted && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {reportStatus === 'pending' && 'AI 리포트를 생성하는 중입니다...'}
              {reportStatus === 'success' &&
                'AI 리포트가 생성되어 마이 리포트에서 확인할 수 있습니다.'}
              {reportStatus === 'exists' && '이 학습에 대한 AI 리포트가 이미 생성되었습니다.'}
              {reportStatus === 'error' && (reportError || 'AI 리포트 생성에 실패했습니다.')}
              {reportStatus === 'idle' && 'AI 리포트를 준비 중입니다.'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => triggerReportGeneration(true)}
              disabled={reportStatus === 'pending'}
            >
              {reportStatus === 'pending' ? '생성 중...' : 'AI 리포트 다시 생성'}
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="mt-6 w-full ">
        {/* Learning Material Info */}
        <Card className="mb-6 p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {learningMaterial?.title || '학습 자료'}
            </h2>
            <p className="text-gray-600">
              {learningMaterial?.description || '학습을 완료했습니다!'}
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>과목: {learningMaterial?.subject || '수학'}</span>
            <span>총 문제 수: {problems.length}문제</span>
          </div>
        </Card>

        {/* Overall Results */}
        <Card className="mb-8 flex gap-4 p-8">
          {/* 상단 결과 요약 */}
          <div className="text-center">
            <div>
              <div
                className={`mx-auto inline-flex items-center rounded-full px-6 py-3 ${gradeInfo.bgColor}`}
              >
                <span className={`text-3xl font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</span>
              </div>
              <p className="mt-2 text-lg text-gray-600">
                {percentage}점 ({correctAnswers}/{totalProblems} 정답)
              </p>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-green-50 p-4">
                <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                <div className="text-sm text-green-600">정답</div>
              </div>
              <div className="rounded-lg bg-red-50 p-4">
                <div className="text-2xl font-bold text-red-600">{wrongAnswers}</div>
                <div className="text-sm text-red-600">오답</div>
              </div>
              <div className="rounded-lg bg-blue-50 p-4">
                <div className="text-2xl font-bold text-blue-600">{earnedPoints}</div>
                <div className="text-sm text-blue-600">획득 점수</div>
              </div>
            </div>
          </div>

          {/* 문제별 상세 결과 */}
          <div className="flex-1">
            <h4 className="mb-4 text-lg font-bold text-gray-800">문제별 상세 결과</h4>
            <div className="space-y-3">
              {(() => {
                const orderMap = new Map<string, number>();
                problems.forEach((p, idx) => orderMap.set(p.id, idx));
                const sortedAttempts = (learningStatus?.attempts || [])
                  .slice()
                  .sort((a: any, b: any) => {
                    const ai = orderMap.get(a.problemId) ?? Number.MAX_SAFE_INTEGER;
                    const bi = orderMap.get(b.problemId) ?? Number.MAX_SAFE_INTEGER;
                    return ai - bi;
                  });
                return sortedAttempts.map((attempt: any, index: number) => {
                  const problem = problems.find((p) => p.id === attempt.problemId);
                  if (!problem) return null;

                  const isCorrect = attempt.isCorrect;

                  return (
                    <div
                      key={problem.id}
                      className={`flex items-center justify-between rounded-lg border p-4 ${
                        isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <div className="font-medium text-gray-800">
                            {index + 1}. {problem.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            정답: {problem.correctAnswer}
                            {!isCorrect && (
                              <span className="ml-2 text-red-600">(선택: {attempt.selected})</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right text-sm text-gray-500">
                          <div>{isCorrect ? problem.points : 0}점</div>
                          {typeof attempt.timeSpent === 'number' && attempt.timeSpent > 0 && (
                            <div className="text-xs text-gray-400">
                              소요 시간: {attempt.timeSpent}초
                            </div>
                          )}
                        </div>
                        {!isCorrect && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              console.log('오답체크 버튼 클릭:', problem.id);
                              const url = `/my/learning/${encodeURIComponent(
                                studyId,
                              )}/problems/${encodeURIComponent(
                                problem.id,
                              )}?wrongOnly=1&ids=${encodeURIComponent(problem.id)}&from=results`;
                              console.log('이동할 URL:', url);
                              router.push(url);
                            }}
                            className="text-xs"
                          >
                            오답체크
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button onClick={handleRetry} variant="outline" className="px-6 py-3">
            <RotateCcw className="mr-2 h-4 w-4" />
            {nextAttemptNumber}번째 시도 시작
          </Button>
          <Button onClick={handleBackToLearning} className="px-6 py-3">
            {cameFromWrongOnly ? '오답 노트로' : '학습 홈으로'}
          </Button>
        </div>
      </div>
    </div>
  );
}
