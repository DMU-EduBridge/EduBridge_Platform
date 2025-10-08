'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type InsightsPanelProps = {
  insights?: string[];
  recommendations?: string[];
  loading?: boolean;
};

export function InsightsPanel({
  insights = [],
  recommendations = [],
  loading,
}: InsightsPanelProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>인사이트</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <div className="text-sm text-gray-500">로딩 중...</div>
          ) : insights.length ? (
            insights.map((s, i) => (
              <div key={i} className="rounded bg-blue-50 p-2 text-sm text-gray-800">
                {s}
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">인사이트가 없습니다.</div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>개선 제안</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <div className="text-sm text-gray-500">로딩 중...</div>
          ) : recommendations.length ? (
            recommendations.map((s, i) => (
              <div key={i} className="rounded bg-green-50 p-2 text-sm text-gray-800">
                {s}
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">개선 제안이 없습니다.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default InsightsPanel;
