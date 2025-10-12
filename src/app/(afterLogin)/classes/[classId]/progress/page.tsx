'use client';

import { ClassProgressChart } from '@/components/progress/class-progress-chart';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useClassProgress } from '@/hooks/progress/use-class-progress';
import { ArrowLeft, Clock, Target, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function ClassProgressPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;

  const { data: progressResponse, isLoading, error } = useClassProgress(classId);
  const progressData = progressResponse?.data;

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            돌아가기
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">클래스 진도</h1>
            <p className="mt-2 text-gray-600">클래스 진도를 불러오는 중...</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-gray-600">클래스 진도를 불러오는 중...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !progressData) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            돌아가기
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">클래스 진도</h1>
            <p className="mt-2 text-gray-600">클래스 진도를 불러올 수 없습니다</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-red-600">클래스 진도를 불러오는데 실패했습니다.</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              다시 시도
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            돌아가기
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{progressData.className} 진도</h1>
            <p className="mt-2 text-gray-600">클래스 전체 학생들의 학습 진도를 확인하세요</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/classes/${classId}`}>
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              클래스 관리
            </Button>
          </Link>
        </div>
      </div>

      {/* 클래스 진도 차트 */}
      <ClassProgressChart students={progressData.students} className={progressData.className} />

      {/* 학생별 상세 진도 테이블 */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">학생별 상세 진도</h2>
            <p className="text-gray-600">각 학생의 학습 현황을 확인하세요</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left font-medium">학생명</th>
                  <th className="px-4 py-3 text-center font-medium">진도율</th>
                  <th className="px-4 py-3 text-center font-medium">정답률</th>
                  <th className="px-4 py-3 text-center font-medium">완료 문제</th>
                  <th className="px-4 py-3 text-center font-medium">총 시도</th>
                  <th className="px-4 py-3 text-center font-medium">평균 시간</th>
                  <th className="px-4 py-3 text-center font-medium">마지막 활동</th>
                  <th className="px-4 py-3 text-center font-medium">상세 보기</th>
                </tr>
              </thead>
              <tbody>
                {progressData.students.map((student) => (
                  <tr key={student.studentId} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{student.studentName}</div>
                        <div className="text-sm text-gray-600">{student.studentEmail}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div
                          className={`font-bold ${
                            student.progressPercentage >= 80
                              ? 'text-green-600'
                              : student.progressPercentage >= 60
                                ? 'text-yellow-600'
                                : 'text-red-600'
                          }`}
                        >
                          {Math.round(student.progressPercentage)}%
                        </div>
                        <TrendingUp className="h-4 w-4 text-gray-400" />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div
                        className={`font-bold ${
                          student.accuracyRate >= 80
                            ? 'text-green-600'
                            : student.accuracyRate >= 60
                              ? 'text-yellow-600'
                              : 'text-red-600'
                        }`}
                      >
                        {Math.round(student.accuracyRate)}%
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="font-medium">
                        {student.completedProblems}/{student.totalProblems}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="font-medium">{student.totalAttempts}회</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {Math.round(student.averageTimeSpent / 60)}분
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="text-sm text-gray-600">
                        {new Date(student.lastActivity).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link href={`/students/${student.studentId}/detail?classId=${classId}`}>
                        <Button variant="outline" size="sm">
                          <Target className="mr-1 h-3 w-3" />
                          상세
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
