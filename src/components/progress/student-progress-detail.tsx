'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StudentDetailProgress } from '@/types/domain/progress';
import { BookOpen, CheckCircle, Clock, TrendingDown, TrendingUp } from 'lucide-react';

interface StudentProgressDetailProps {
  progress: StudentDetailProgress;
}

export function StudentProgressDetail({ progress }: StudentProgressDetailProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* 전체 진도 요약 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">전체 진도율</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.progressPercentage}%</div>
            <Progress value={progress.progressPercentage} className="mt-2" />
            <p className="mt-1 text-xs text-muted-foreground">
              {progress.completedProblems}/{progress.totalProblems} 문제 완료
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 점수</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(progress.averageScore)}`}>
              {progress.averageScore}점
            </div>
            <p className="text-xs text-muted-foreground">
              {progress.correctAnswers}/{progress.completedProblems} 정답
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">마지막 활동</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {new Date(progress.lastActivity).toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(progress.lastActivity).toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">수강 과목</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{progress.subjects.length}개</div>
            <p className="text-xs text-muted-foreground">과목 수강 중</p>
          </CardContent>
        </Card>
      </div>

      {/* 과목별 진도 */}
      <Card>
        <CardHeader>
          <CardTitle>과목별 학습 현황</CardTitle>
          <CardDescription>각 과목의 진도율과 성취도를 확인하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progress.subjects.map((subject, index) => (
              <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex-1">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">{subject.subject}</h4>
                    <div className="flex items-center gap-4">
                      <span
                        className={`text-sm font-medium ${getScoreColor(subject.averageScore)}`}
                      >
                        {subject.averageScore}점
                      </span>
                      <span className="text-sm text-gray-600">
                        {subject.completedProblems}/{subject.totalProblems} 완료
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(subject.progress)}`}
                      style={{ width: `${subject.progress}%` }}
                    ></div>
                  </div>
                  <p className="mt-1 text-xs text-gray-600">진도율: {subject.progress}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 최근 시도 기록 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 학습 기록</CardTitle>
          <CardDescription>최근에 풀었던 문제들의 결과를 확인하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {progress.recentAttempts.map((attempt) => (
              <div
                key={attempt.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{attempt.problemTitle}</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(attempt.completedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={attempt.isCorrect ? 'default' : 'destructive'}
                    className={
                      attempt.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }
                  >
                    {attempt.isCorrect ? '정답' : '오답'}
                  </Badge>
                  <span className={`font-semibold ${getScoreColor(attempt.score)}`}>
                    {attempt.score}점
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 성과 트렌드 */}
      <Card>
        <CardHeader>
          <CardTitle>학습 성과 트렌드</CardTitle>
          <CardDescription>최근 학습 성과의 변화 추이를 확인하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progress.performanceTrend.map((trend, index) => (
              <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {new Date(trend.date).toLocaleDateString()}
                  </h4>
                  <p className="text-sm text-gray-600">{trend.problemsCompleted}개 문제 완료</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${getScoreColor(trend.score)}`}>
                    {trend.score}점
                  </span>
                  {index > 0 && (
                    <div className="flex items-center">
                      {trend.score > progress.performanceTrend[index - 1].score ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
