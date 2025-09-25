'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { StudyItem, StudyLevel } from '@/types/domain/learning';
import { getStudyLevelConfig } from '@/types/domain/learning';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

function LevelBadge({ level }: { level: StudyLevel }) {
  const config = getStudyLevelConfig(level);

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${config.color}`}
    >
      {config.label}
    </span>
  );
}

export type StudyCardProps = {
  item: StudyItem;
  onStart?: (id: string) => void;
  onReview?: (id: string) => void;
  onAiHelp?: () => void;
};

export function StudyCard({ item, onStart, onReview, onAiHelp }: StudyCardProps) {
  return (
    <Card className="relative rounded-xl border border-slate-200 p-8 transition-colors hover:border-slate-300">
      <div className="absolute right-6 top-8">
        <LevelBadge level={item.level} />
      </div>

      <h3 className="pr-20 text-xl font-semibold leading-tight text-slate-900">{item.title}</h3>
      <p className="mt-3 text-base font-medium leading-7 text-slate-500">{item.summary}</p>

      <div className="mt-3 space-y-4 text-slate-600">
        <div className="flex items-center gap-3 text-base">
          <Clock className="h-5 w-5 flex-shrink-0" />
          <span>예상 학습 시간: {item.estimatedTimeMin}분</span>
        </div>
        <div className="flex items-center gap-3 text-base">
          <CalendarIcon className="h-5 w-5 flex-shrink-0" />
          <span>생성일: {new Date(item.createdAt).toLocaleDateString('ko-KR')}</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <Button
          onClick={() => onStart?.(item.id)}
          className="h-12 rounded-md bg-blue-600 text-sm font-semibold text-white transition-colors hover:bg-blue-700 md:text-base"
          aria-label={`${item.title} 문제 풀기`}
        >
          문제 풀기
        </Button>
        <Button
          onClick={() => onReview?.(item.id)}
          className="h-12 rounded-md bg-rose-500 text-sm font-semibold text-white transition-colors hover:bg-rose-600 md:text-base"
          aria-label={`${item.title} 오답체크`}
        >
          오답체크
        </Button>
        <Button
          onClick={() => onAiHelp?.()}
          className="h-12 rounded-md bg-purple-600 text-sm font-semibold text-white transition-colors hover:bg-purple-700 md:text-base"
          aria-label={`${item.title} AI 도움 받기`}
        >
          AI 도움 받기
        </Button>
      </div>
    </Card>
  );
}
