'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ConceptItem = { tag: string; accuracy: number; count: number };

type ConceptMatrixProps = {
  items?: ConceptItem[];
  loading?: boolean;
};

export function ConceptMatrix({ items = [], loading }: ConceptMatrixProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>개념/스킬 매트릭스</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-gray-500">로딩 중...</div>
        ) : items.length ? (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {items.map((c) => (
              <div
                key={c.tag}
                className="flex items-center justify-between rounded border p-2 text-sm"
              >
                <div className="font-medium">#{c.tag}</div>
                <div className="text-gray-600">
                  정확도 {c.accuracy}% • 노출 {c.count}
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

export default ConceptMatrix;
