'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type KpiCardsProps = {
  totalProblems?: number;
  averageScore?: number;
  completionRate?: number;
  students?: number;
  isLoading?: boolean;
};

export function KpiCards({
  totalProblems,
  averageScore,
  completionRate,
  students,
  isLoading,
}: KpiCardsProps) {
  const loadingText = isLoading ? '...' : undefined;
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle>총 문제 수</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">
          {loadingText ?? totalProblems ?? 0}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>평균 점수</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">
          {loadingText ?? `${averageScore ?? 0}점`}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>완료율</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">
          {loadingText ?? `${completionRate ?? 0}%`}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>학생 수</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">{loadingText ?? students ?? 0}</CardContent>
      </Card>
    </div>
  );
}

export default KpiCards;
