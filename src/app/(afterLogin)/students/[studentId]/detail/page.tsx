'use client';

import { StudentProgressDetail } from '@/components/progress/student-progress-detail';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useStudentDetailProgress } from '@/hooks/progress/use-student-detail-progress';
import { ProgressFilters } from '@/types/domain/progress';
import { ArrowLeft, Filter } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = params.studentId as string;

  const [filters, setFilters] = useState<ProgressFilters>({
    classId: searchParams.get('classId') || undefined,
    startDate: searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined,
    endDate: searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined,
    subject: searchParams.get('subject') || undefined,
    difficulty: searchParams.get('difficulty') || undefined,
  });

  const { data: progressResponse, isLoading, error } = useStudentDetailProgress(studentId, filters);
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
            <h1 className="text-3xl font-bold text-gray-900">학생 상세 진도</h1>
            <p className="mt-2 text-gray-600">학생 진도를 불러오는 중...</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-gray-600">학생 진도를 불러오는 중...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">학생 상세 진도</h1>
            <p className="mt-2 text-gray-600">학생 진도를 불러올 수 없습니다</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-red-600">학생 진도를 불러오는데 실패했습니다.</p>
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
            <h1 className="text-3xl font-bold text-gray-900">
              {progressData.studentName}님의 학습 현황
            </h1>
            <p className="mt-2 text-gray-600">
              {progressData.className && `${progressData.className} • `}
              상세한 학습 진도와 분석 결과를 확인하세요
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            필터
          </Button>
          {progressData.classId && (
            <Button
              variant="outline"
              onClick={() => router.push(`/classes/${progressData.classId}/progress`)}
            >
              클래스 진도로
            </Button>
          )}
        </div>
      </div>

      {/* 학생 상세 진도 */}
      <StudentProgressDetail progress={progressData} />
    </div>
  );
}
