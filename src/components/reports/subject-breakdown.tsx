'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type UnitMetric = {
  unit: string;
  accuracy: number; // 0-100
  avgTimeSec?: number;
  attempts?: number;
  topWrongTags?: string[];
};

type SubjectBreakdownProps = {
  items?: Array<{ subject: string; metrics: UnitMetric[] }>;
  loading?: boolean;
};

export function SubjectBreakdown({ items = [], loading }: SubjectBreakdownProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>과목/단원별 분석</CardTitle>
        </CardHeader>
        <CardContent>로딩 중...</CardContent>
      </Card>
    );
  }

  if (!items.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>과목/단원별 분석</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-500">분석 데이터가 없습니다.</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((s) => (
        <Card key={s.subject}>
          <CardHeader>
            <CardTitle>{s.subject}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {s.metrics.map((m) => (
              <div key={m.unit} className="rounded border p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-gray-900">{m.unit}</div>
                  <div className="text-sm text-gray-600">정답률 {m.accuracy}%</div>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  평균 시간 {m.avgTimeSec ?? 0}s • 시도 {m.attempts ?? 0}회
                </div>
                {m.topWrongTags && m.topWrongTags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-700">
                    {m.topWrongTags.map((t) => (
                      <span key={t} className="rounded bg-gray-100 px-2 py-1">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default SubjectBreakdown;
