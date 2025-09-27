'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { calculatePercentage, calculateScore, getGrade } from '@/lib/utils/learning-utils';
import { CheckCircle, Home, RotateCcw, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Problem {
  id: string;
  title: string;
  content: string;
  correctAnswer: string;
  explanation?: string;
  points: number;
}

interface LearningMaterial {
  id: string;
  title: string;
  description?: string;
  subject: string;
}

interface ResultsClientProps {
  studyId: string;
  problems: Problem[];
  learningMaterial: LearningMaterial | null;
  userId: string;
}

export default function ResultsClient({
  studyId,
  problems,
  learningMaterial,
  userId,
}: ResultsClientProps) {
  const router = useRouter();

  // localStorage에서 실제 완료된 문제 목록과 정답/오답 정보 가져오기
  const getCompletedProblems = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`completed-problems-${studyId}`);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  };

  const getProblemAnswers = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`problem-answers-${studyId}`);
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  };

  const completedProblems = getCompletedProblems();
  const problemAnswers = getProblemAnswers();

  // 실제 정답/오답 계산
  const correctAnswers = Object.values(problemAnswers).filter(
    (answer: any) => answer.isCorrect,
  ).length;
  const wrongAnswers = completedProblems.length - correctAnswers;

  const totalPoints = problems.reduce((sum, p) => sum + p.points, 0);
  const earnedPoints = calculateScore(correctAnswers, problems.length, totalPoints);
  const percentage = calculatePercentage(correctAnswers, completedProblems.length);

  const handleBackToLearning = () => {
    router.push('/my/learning');
  };

  const handleRetry = () => {
    // localStorage 초기화
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`completed-problems-${studyId}`);
      localStorage.removeItem(`problem-answers-${studyId}`);
    }
    router.push(`/my/learning/${encodeURIComponent(studyId)}/problems/${problems[0]?.id}`);
  };

  const gradeInfo = getGrade(percentage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleBackToLearning} className="px-4 py-2">
            <Home className="mr-2 h-4 w-4" />
            학습 홈
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">학습 결과</h1>
        </div>
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
                {percentage}점 ({correctAnswers}/{completedProblems.length} 정답)
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
              {problems.map((problem, index) => {
                const answerInfo = problemAnswers[problem.id];
                const isCompleted = completedProblems.includes(problem.id);
                const isCorrect = answerInfo?.isCorrect || false;

                return (
                  <div
                    key={problem.id}
                    className={`flex items-center justify-between rounded-lg border p-4 ${
                      isCompleted
                        ? isCorrect
                          ? 'border-green-200 bg-green-50'
                          : 'border-red-200 bg-red-50'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {!isCompleted ? (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
                      ) : isCorrect ? (
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
                          {answerInfo && !isCorrect && (
                            <span className="ml-2 text-red-600">
                              (선택: {answerInfo.selectedAnswer})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {isCompleted ? (isCorrect ? problem.points : 0) : '-'}점
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button onClick={handleRetry} variant="outline" className="px-6 py-3">
            <RotateCcw className="mr-2 h-4 w-4" />
            다시 풀기
          </Button>
          <Button onClick={handleBackToLearning} className="px-6 py-3">
            학습 홈으로
          </Button>
        </div>
      </div>
    </div>
  );
}
