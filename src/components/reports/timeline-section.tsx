'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type TimelinePoint = { date: string; accuracy: number; attempts: number };

type TimelineSectionProps = {
  points?: TimelinePoint[];
  loading?: boolean;
};

export function TimelineSection({ points = [], loading }: TimelineSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>시간 축 분석</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-gray-500">로딩 중...</div>
        ) : points.length ? (
          <div className="space-y-2">
            {points.map((p) => (
              <div
                key={p.date}
                className="flex items-center justify-between rounded border p-2 text-sm"
              >
                <div className="text-gray-700">{p.date}</div>
                <div className="text-gray-600">
                  정답률 {p.accuracy}% • 시도 {p.attempts}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500">데이터가 없습니다.</div>
        )}
      </CardContent>
    </Card>
  );
}

export default TimelineSection;
