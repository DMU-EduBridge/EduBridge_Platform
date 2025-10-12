'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { MaterialItem } from '@/types/domain/material';
import { getMaterialDifficultyConfig, getMaterialStatusConfig } from '@/types/domain/material';
import { BookOpen, MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function MaterialCard({ item }: { item: MaterialItem }) {
  const router = useRouter();
  const difficultyConfig = getMaterialDifficultyConfig(item.difficulty);
  const statusConfig = getMaterialStatusConfig(item.status);

  const handleEdit = () => {
    router.push(`/learning-materials/${item.id}/edit`);
  };

  return (
    <Card className="p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
            <BookOpen className="h-6 w-6 text-blue-600" />
          </div>
          <div className="min-w-0">
            <h4 className="truncate text-lg font-semibold text-gray-900">{item.title}</h4>
            {item.description && (
              <p className="mt-1 line-clamp-2 text-sm text-gray-600">{item.description}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {item.difficulty && (
                <Badge className={difficultyConfig.color}>{difficultyConfig.label}</Badge>
              )}
              {item.status && <Badge className={statusConfig.color}>{statusConfig.label}</Badge>}
              {item.subject && <span className="text-xs text-gray-500">{item.subject}</span>}
              {typeof item.estimatedTime === 'number' && (
                <span className="text-xs text-gray-500">• {item.estimatedTime}분</span>
              )}
              {typeof item.problemsCount === 'number' && (
                <span className="text-xs text-gray-500">• {item.problemsCount}문제</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" onClick={handleEdit}>
            편집
          </Button>
          <Button variant="ghost" size="sm">
            미리보기
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function MaterialCardSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex items-start space-x-4">
        <div className="h-12 w-12 animate-pulse rounded-lg bg-gray-100" />
        <div className="min-w-0 flex-1">
          <div className="h-5 w-40 animate-pulse rounded bg-gray-100" />
          <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-gray-100" />
          <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    </Card>
  );
}
