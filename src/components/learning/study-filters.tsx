'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Filter, Search } from 'lucide-react';

export type StudyFiltersProps = {
  query: string;
  status: string;
  onQueryChange: (v: string) => void;
  onStatusChange: (v: string) => void;
};

export function StudyFilters({ query, status, onQueryChange, onStatusChange }: StudyFiltersProps) {
  return (
    <Card className="rounded-xl p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            type="text"
            placeholder="문제 제목으로 검색..."
            className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">모든 상태</option>
            <option value="ongoing">진행 중</option>
            <option value="completed">완료</option>
          </select>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" /> 필터
          </Button>
        </div>
      </div>
    </Card>
  );
}
