'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Mistake = {
  id: string;
  title: string;
  explanation?: string | null;
};

type RecentMistakesProps = {
  items?: Mistake[];
  onRetry?: (problemId: string) => void;
  loading?: boolean;
};

export function RecentMistakes({ items = [], onRetry, loading }: RecentMistakesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>최근 오답</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <div className="text-sm text-gray-500">로딩 중...</div>
        ) : items.length ? (
          items.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded border p-2 text-sm"
            >
              <div className="mr-3 min-w-0 flex-1 truncate text-gray-800">{m.title}</div>
              {onRetry && (
                <Button size="sm" variant="outline" onClick={() => onRetry(m.id)}>
                  다시 풀기
                </Button>
              )}
            </div>
          ))
        ) : (
          <div className="text-sm text-gray-500">최근 오답이 없습니다.</div>
        )}
      </CardContent>
    </Card>
  );
}

export default RecentMistakes;
