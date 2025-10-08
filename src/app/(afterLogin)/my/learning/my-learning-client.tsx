'use client';

import { StudyCard } from '@/components/learning/study-card';
import { StudyFilters } from '@/components/learning/study-filters';
import { useStudyItems } from '@/hooks/learning';
import { StudyItem } from '@/types/domain/learning';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

// Loading skeleton component
function StudySkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-slate-200 p-8">
          <div className="mb-4 h-6 w-20 rounded-full bg-slate-200" />
          <div className="mb-3 h-6 w-full rounded bg-slate-200" />
          <div className="mb-3 h-4 w-3/4 rounded bg-slate-200" />
          <div className="mb-4 h-4 w-1/2 rounded bg-slate-200" />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="h-12 rounded-md bg-slate-200" />
            <div className="h-12 rounded-md bg-slate-200" />
            <div className="h-12 rounded-md bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Error component
function StudyError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <h3 className="mb-2 text-lg font-semibold text-red-800">학습 자료를 불러올 수 없습니다</h3>
      <p className="mb-4 text-red-600">{error.message}</p>
      <button
        onClick={onRetry}
        className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
      >
        다시 시도
      </button>
    </div>
  );
}

export default function MyLearningClient() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string>('');

  // React Query를 사용한 데이터 페칭
  const { data: studyItems, isLoading, error, refetch } = useStudyItems();

  // 필터링된 아이템들
  const filteredItems = useMemo(() => {
    if (!studyItems) return [];

    return studyItems.filter((item: StudyItem) => {
      const matchesQuery =
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.summary.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = !status || item.level === status;

      return matchesQuery && matchesStatus;
    });
  }, [studyItems, query, status]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">단원별 학습하기</h1>
          <p className="mt-2 text-gray-600">진도에 맞게 원하는 과목을 선택해 문제를 풀어보세요.</p>
        </div>
        <StudySkeleton />
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">단원별 학습하기</h1>
          <p className="mt-2 text-gray-600">진도에 맞게 원하는 과목을 선택해 문제를 풀어보세요.</p>
        </div>
        <StudyError error={error} onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">단원별 학습하기</h1>
        <p className="mt-2 text-gray-600">진도에 맞게 원하는 과목을 선택해 문제를 풀어보세요.</p>
      </div>

      {/* 검색/필터 바 */}
      <StudyFilters
        query={query}
        status={status}
        onQueryChange={setQuery}
        onStatusChange={setStatus}
      />

      {/* 결과 개수 표시 */}
      <div className="text-sm text-gray-600">
        총 {filteredItems.length}개의 학습 자료를 찾았습니다.
      </div>

      {/* 카드 그리드 */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item: StudyItem) => (
            <StudyCard
              key={item.id}
              item={item}
              onStart={(id) => router.push(`/my/learning/${encodeURIComponent(id)}/problems`)}
              onReview={() => router.push('/my/incorrect-answers')}
              onAiHelp={() => router.push('/ai-assistant')}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
          <h3 className="mb-2 text-lg font-semibold text-gray-900">학습 자료를 찾을 수 없습니다</h3>
          <p className="text-gray-600">검색 조건에 맞는 학습 자료가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
