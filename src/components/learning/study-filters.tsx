'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Filter, Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export type StudyFiltersProps = {
  query: string;
  difficulty: string;
  onQueryChange: (v: string) => void;
  onDifficultyChange: (v: string) => void;
};

export function StudyFilters({
  query,
  difficulty,
  onQueryChange,
  onDifficultyChange,
}: StudyFiltersProps) {
  const [mounted, setMounted] = useState(false);

  // Best practice: URL 쿼리 동기화(뒤로가기/공유/새로고침 복원), scroll 방지 replace
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const sp = new URLSearchParams(searchParams?.toString());
    if (query && query.trim().length > 0) sp.set('query', query.trim());
    else sp.delete('query');

    if (difficulty) sp.set('difficulty', difficulty);
    else sp.delete('difficulty');

    const qs = sp.toString();
    const nextUrl = qs ? `${pathname}?${qs}` : pathname;
    // shallow replace to avoid full reload
    router.replace(nextUrl, { scroll: false });
  }, [query, difficulty, router, pathname, searchParams, mounted]);

  if (!mounted) {
    return null;
  }

  return (
    <Card className="rounded-xl p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-xl">
          <label htmlFor="study-search" className="sr-only">
            문제 검색
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <input
            id="study-search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            type="text"
            placeholder="문제 제목으로 검색..."
            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
            aria-label="문제 검색"
            enterKeyHint="search"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="study-difficulty" className="sr-only">
            난이도 필터
          </label>
          <select
            id="study-difficulty"
            value={difficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            aria-label="난이도 필터"
          >
            <option value="">모든 난이도</option>
            <option value="쉬움">쉬움</option>
            <option value="보통">보통</option>
            <option value="어려움">어려움</option>
            <option value="매우 어려움">매우 어려움</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onQueryChange('');
              onDifficultyChange('');
            }}
            aria-label="필터 초기화"
          >
            <Filter className="mr-2 h-4 w-4" /> 초기화
          </Button>
        </div>
      </div>
    </Card>
  );
}
