'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useProgress } from '@/hooks/use-progress';
import { debugLog, formatTime } from '@/lib/utils/learning-utils';
import { ArrowLeft, ArrowRight, Home, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface Problem {
  id: string;
  title: string;
  description?: string | undefined;
  content: string;
  type: 'MULTIPLE_CHOICE';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  subject: string;
  options: string[];
  correctAnswer: string;
  explanation?: string | undefined;
  hints?: any;
  points: number;
  timeLimit?: number | undefined;
}

interface ProblemDetailClientProps {
  studyId: string;
  problemId: string;
  initialProblem?: Problem | undefined;
  nextProblem?: Problem | undefined;
  currentIndex?: number;
  totalCount?: number;
}

export default function ProblemDetailClient({
  studyId,
  initialProblem,
  nextProblem,
  currentIndex = 1,
  totalCount = 1,
}: ProblemDetailClientProps) {
  const router = useRouter();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  // Custom Hook 사용
  const { completedProblems, addCompletedProblem, initializeProgress } = useProgress(studyId);

  // 문제 설정 및 진행률 초기화
  useEffect(() => {
    if (initialProblem) {
      debugLog('Problem data:', initialProblem);
      debugLog('Options type:', typeof initialProblem.options);
      debugLog('Options value:', initialProblem.options);
      setProblem(initialProblem);
      setStartTime(new Date());
      // 새 문제로 변경될 때 해설 숨기기
      setShowExplanation(false);
      setShowResult(false);
      setSelectedAnswer('');

      // 진행률 초기화 (필요한 경우)
      initializeProgress(studyId, currentIndex, totalCount);
    }
  }, [initialProblem, studyId, currentIndex, totalCount, initializeProgress]);

  // 타이머 업데이트
  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const handleSubmit = useCallback(() => {
    if (!problem || !selectedAnswer) return;

    // 디버깅을 위한 상세 로그
    debugLog('=== 문제 제출 디버깅 ===');
    debugLog('문제 ID:', problem.id);
    debugLog('문제 제목:', problem.title);
    debugLog('선택한 답:', selectedAnswer, '(타입:', typeof selectedAnswer, ')');
    debugLog('정답:', problem.correctAnswer, '(타입:', typeof problem.correctAnswer, ')');
    debugLog('옵션들:', problem.options);
    debugLog('현재 completedProblems:', completedProblems);
    debugLog('totalCount:', totalCount);

    // 로컬에서 정답 확인
    const correct = selectedAnswer === problem.correctAnswer;
    debugLog('정답 여부:', correct);
    debugLog('=== 디버깅 끝 ===');

    setIsCorrect(correct);
    setShowResult(true);

    // 문제 완료 상태 추가 및 정답/오답 정보 저장
    if (!completedProblems.includes(problem.id)) {
      const answerData = {
        isCorrect: correct,
        selectedAnswer: selectedAnswer,
        correctAnswer: problem.correctAnswer,
        problemTitle: problem.title,
        completedAt: new Date().toISOString(),
      };

      addCompletedProblem(problem.id, answerData);

      // 완료된 문제 수 확인 (현재 문제 포함)
      const actualCompletedCount = completedProblems.length + 1;
      debugLog('업데이트된 완료 문제 수:', actualCompletedCount);
      debugLog('총 문제 수:', totalCount);
      debugLog('모든 문제 완료 여부:', actualCompletedCount >= totalCount);

      // 모든 문제를 다 풀었는지 확인
      debugLog('=== 완료 조건 확인 ===');
      debugLog('actualCompletedCount:', actualCompletedCount);
      debugLog('totalCount:', totalCount);
      debugLog('조건: actualCompletedCount >= totalCount');
      debugLog('결과:', actualCompletedCount >= totalCount);

      if (actualCompletedCount >= totalCount) {
        debugLog('🎉 모든 문제 완료! 3초 후 결과 페이지로 이동');
        debugLog('이동할 URL:', `/my/learning/${encodeURIComponent(studyId)}/results`);
        // 결과 표시 후 잠시 대기 후 결과 페이지로 이동
        setTimeout(() => {
          debugLog('⏰ 3초 경과! 결과 페이지로 이동 시작');
          router.push(`/my/learning/${encodeURIComponent(studyId)}/results`);
        }, 3000);
      } else {
        debugLog('📝 아직 문제가 남았습니다. 다음 문제로 이동 가능');
        debugLog(`남은 문제: ${totalCount - actualCompletedCount}개`);
      }
    } else {
      debugLog('이미 완료된 문제입니다.');
    }
  }, [problem, selectedAnswer, studyId, totalCount, router, completedProblems]);

  const handleNext = useCallback(() => {
    // 해설 숨기기
    setShowExplanation(false);

    debugLog('=== 다음 문제 이동 ===');
    debugLog('현재 completedProblems.length:', completedProblems.length);
    debugLog('totalCount:', totalCount);
    debugLog('nextProblem 존재 여부:', !!nextProblem);
    debugLog('현재 문제 ID:', problem?.id);

    // 현재 문제를 포함한 완료된 문제 수 계산
    const currentProblemCompleted = problem?.id && completedProblems.includes(problem.id);
    const actualCompletedCount = currentProblemCompleted
      ? completedProblems.length
      : completedProblems.length + 1;

    debugLog('=== handleNext 완료 조건 확인 ===');
    debugLog('actualCompletedCount:', actualCompletedCount);
    debugLog('totalCount:', totalCount);
    debugLog('모든 문제 완료 여부:', actualCompletedCount >= totalCount);

    // 모든 문제를 다 풀었는지 확인
    if (actualCompletedCount >= totalCount) {
      debugLog('🎉 handleNext에서 모든 문제 완료 감지! 결과 페이지로 이동');
      router.push(`/my/learning/${encodeURIComponent(studyId)}/results`);
    } else if (nextProblem) {
      debugLog('다음 문제로 이동:', nextProblem.id);
      router.push(`/my/learning/${encodeURIComponent(studyId)}/problems/${nextProblem.id}`);
    } else {
      debugLog('⚠️ 다음 문제가 없지만 아직 모든 문제를 완료하지 않음');
      debugLog('완료된 문제:', actualCompletedCount, '/ 총 문제:', totalCount);
      debugLog('결과 페이지로 이동 시도');
      router.push(`/my/learning/${encodeURIComponent(studyId)}/results`);
    }
  }, [nextProblem, router, studyId, completedProblems, totalCount, problem]);

  const handlePrevious = useCallback(() => {
    // 이전 문제 로직 (필요시 구현)
  }, []);

  const handleBackToList = useCallback(() => {
    router.push('/my/learning');
  }, [router]);

  const handleReset = useCallback(() => {
    setSelectedAnswer('');
    setShowResult(false);
    setIsCorrect(false);
    setStartTime(new Date());
    setElapsedTime(0);
  }, []);

  if (!problem) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg text-gray-600">문제를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Main Content */}
      <div className="flex-1">
        {/* Page Title and Timer */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleBackToList} className="px-4 py-2">
              <Home className="mr-2 h-4 w-4" />
              문제 목록
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">단원별 학습하기</h1>
          </div>
          <div className="rounded-full bg-[#d9e5ff] px-3 py-1 text-sm font-medium text-[#2463eb]">
            {formatTime(elapsedTime)}
          </div>
        </div>

        {/* Problem Context Bar */}
        <div className="mb-8 rounded-lg bg-[#2463eb] px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="text-lg font-medium">2025 수능 - 수학 (확률과 통계)</div>
            <div className="flex items-center gap-6 text-sm">
              <span>총 문항 수: {totalCount} 문제</span>
              <span>완료된 문항: {completedProblems.length} 문제</span>
              <span>남은 문항 수: {totalCount - completedProblems.length}문제</span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="h-2 w-full rounded-full bg-blue-200">
              <div
                className="h-2 rounded-full bg-white transition-all duration-300"
                style={{ width: `${(completedProblems.length / totalCount) * 100}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-blue-100">
              진행률: {Math.round((completedProblems.length / totalCount) * 100)}%
            </div>
          </div>
        </div>

        {/* Problem Content */}
        <div className="rounded-lg border border-gray-200 bg-white p-8">
          <div className="mb-6">
            <h2 className="mb-4 text-xl font-bold text-gray-800">
              {currentIndex}. {problem.title}
            </h2>
            <div className="mb-8 text-lg leading-relaxed text-black">{problem.content}</div>
          </div>

          {/* Answer Options - 객관식만 지원 */}
          <div className="mb-8">
            <div className="space-y-3">
              {(() => {
                let options: string[] = [];
                if (Array.isArray(problem.options)) {
                  options = problem.options;
                } else if (typeof problem.options === 'string') {
                  try {
                    options = JSON.parse(problem.options);
                  } catch {
                    options = ['옵션 1', '옵션 2', '옵션 3', '옵션 4', '옵션 5'];
                  }
                } else {
                  options = ['옵션 1', '옵션 2', '옵션 3', '옵션 4', '옵션 5'];
                }
                return options.map((option: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => {
                      debugLog('옵션 선택됨:', option, '(인덱스:', index, ')');
                      setSelectedAnswer(option);
                    }}
                    disabled={showResult}
                    className={`
                      w-full rounded-lg border-2 p-4 text-left transition-all duration-200
                      ${
                        selectedAnswer === option
                          ? showResult
                            ? option === problem.correctAnswer
                              ? 'border-green-500 bg-green-100 text-green-700'
                              : 'border-red-500 bg-red-100 text-red-700'
                            : 'border-blue-500 bg-blue-100 text-blue-700'
                          : showResult && option === problem.correctAnswer
                            ? 'border-green-500 bg-green-100 text-green-700'
                            : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
                      }
                      ${!showResult && 'cursor-pointer'}
                      flex items-center gap-3 text-lg font-medium
                    `}
                  >
                    <div
                      className={`
                      flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium
                      ${
                        selectedAnswer === option
                          ? showResult
                            ? option === problem.correctAnswer
                              ? 'border-green-500 bg-green-500 text-white'
                              : 'border-red-500 bg-red-500 text-white'
                            : 'border-blue-500 bg-blue-500 text-white'
                          : showResult && option === problem.correctAnswer
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-gray-300'
                      }
                    `}
                    >
                      {String.fromCharCode(9312 + index)}
                    </div>
                    <span>{option}</span>
                  </button>
                ));
              })()}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={true}
              className="px-6 py-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              이전 문제
            </Button>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleReset} className="px-6 py-2">
                <RotateCcw className="mr-2 h-4 w-4" />
                다시 풀기
              </Button>

              {!showResult ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedAnswer}
                  className="rounded-lg bg-blue-600 px-8 py-3 text-white hover:bg-blue-700"
                >
                  정답 확인
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="rounded-lg bg-green-600 px-8 py-3 text-white hover:bg-green-700"
                >
                  다음 문제
                </Button>
              )}
            </div>

            <Button
              variant="outline"
              onClick={handleNext}
              disabled={!nextProblem}
              className="px-6 py-2"
            >
              다음 문제
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Result and Explanation */}
        {showResult && (
          <Card className="mt-8 max-w-4xl p-6">
            <div className="mb-4">
              <div
                className={`mb-2 text-xl font-medium ${
                  isCorrect ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {isCorrect ? '✓ 정답입니다!' : '✗ 틀렸습니다.'}
              </div>
              <div className="text-gray-600">정답: {problem.correctAnswer}</div>
              {selectedAnswer && selectedAnswer !== problem.correctAnswer && (
                <div className="text-gray-600">선택한 답: {selectedAnswer}</div>
              )}
            </div>

            {problem.explanation && (
              <div className="border-t pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-lg font-medium">해설</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {showExplanation ? '접기' : '펼치기'}
                    <span className="ml-1">{showExplanation ? '▲' : '▼'}</span>
                  </Button>
                </div>
                {showExplanation && (
                  <div className="whitespace-pre-line leading-relaxed text-gray-700">
                    {problem.explanation}
                  </div>
                )}
              </div>
            )}
          </Card>
        )}
      </div>
    </>
  );
}
