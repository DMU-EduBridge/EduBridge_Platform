'use client';

import { StudyCard } from '@/components/learning/study-card';
import { StudyFilters } from '@/components/learning/study-filters';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStudyItems } from '@/hooks/learning';
import { StudyItem } from '@/types/domain/learning';
import { Minus, Plus, PlusCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const UNIT_OPTIONS = [
  '실수와 그 계산',
  '이차방정식',
  '이차함수',
  '삼각비',
  '원의 성질',
  '통계',
] as const;

const DIFFICULTY_OPTIONS = ['쉬움', '중간', '어려움'] as const;
const DIFFICULTY_VALUE_MAP: Record<(typeof DIFFICULTY_OPTIONS)[number], 'easy' | 'medium' | 'hard'> = {
  쉬움: 'easy',
  중간: 'medium',
  어려움: 'hard',
};

function LearningHeader({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">단원별 학습하기</h1>
        <p className="mt-2 text-gray-600">진도에 맞게 원하는 과목을 선택해 문제를 풀어보세요.</p>
      </div>
      <Button
        onClick={onCreate}
        className="h-12 w-full gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white transition-colors hover:bg-blue-700 md:w-auto md:px-6 md:text-base"
        aria-label="AI로 문제 생성하기"
      >
        <PlusCircle className="h-5 w-5" />
        문제 생성하기
      </Button>
    </div>
  );
}

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
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<(typeof UNIT_OPTIONS)[number]>(UNIT_OPTIONS[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<(typeof DIFFICULTY_OPTIONS)[number]>(
    DIFFICULTY_OPTIONS[0],
  );
  const [questionCount, setQuestionCount] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleCreateProblems = () => {
    setCreateModalOpen(true);
  };

  const handleSubmitCreate = async () => {
    if (!selectedUnit || !selectedDifficulty) return;
    setCreateError(null);
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/my/learning/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unit: selectedUnit,
          difficulty: DIFFICULTY_VALUE_MAP[selectedDifficulty],
          count: questionCount,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        const message =
          result?.error || '문제 생성 요청에 실패했습니다. 잠시 후 다시 시도해주세요.';
        throw new Error(message);
      }

      await refetch();
      setCreateModalOpen(false);

      if (result.data?.material?.id) {
        router.push(`/my/learning/${encodeURIComponent(result.data.material.id)}/problems`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '문제 생성 요청 중 오류가 발생했습니다.';
      setCreateError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecreaseCount = () => {
    setQuestionCount((prev) => Math.max(1, prev - 1));
  };

  const handleIncreaseCount = () => {
    setQuestionCount((prev) => Math.min(5, prev + 1));
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!materialId) return;
    if (!window.confirm('이 학습 자료를 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.')) {
      return;
    }
    setDeleteError(null);
    setDeletingId(materialId);
    try {
      const response = await fetch(`/api/learning-materials/${encodeURIComponent(materialId)}`, {
        method: 'DELETE',
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.success === false) {
        const message = result?.error || '학습 자료 삭제에 실패했습니다.';
        throw new Error(message);
      }
      await refetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : '학습 자료 삭제 중 오류가 발생했습니다.';
      setDeleteError(message);
    } finally {
      setDeletingId(null);
    }
  };

  // URL 쿼리 → 상태 하이드레이션 (초기 1회)
  useEffect(() => {
    const qp = searchParams?.get('query') || '';
    const sp = searchParams?.get('difficulty') || '';
    setQuery(qp);
    setDifficulty(sp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React Query를 사용한 데이터 페칭
  const { data: studyItems, isLoading, error, refetch } = useStudyItems();

  // 필터링된 아이템들
  const filteredItems = useMemo(() => {
    if (!studyItems) return [];

    return studyItems.filter((item: StudyItem) => {
      const matchesQuery =
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.summary.toLowerCase().includes(query.toLowerCase());
      // API는 난이도를 한국어 문자열(level: '보통' | '어려움' ...)로 내려줌
      const itemLevel = (item as any).level;
      const matchesDifficulty = !difficulty || itemLevel === difficulty;

      return matchesQuery && matchesDifficulty;
    });
  }, [studyItems, query, difficulty]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6 p-6">
          <LearningHeader onCreate={handleCreateProblems} />
          <StudySkeleton />
        </div>
      );
    }

    if (error) {
      return (
        <div className="space-y-6 p-6">
          <LearningHeader onCreate={handleCreateProblems} />
          <StudyError error={error} onRetry={() => refetch()} />
        </div>
      );
    }

    return (
      <div className="space-y-6 p-6">
        <LearningHeader onCreate={handleCreateProblems} />

        {/* 검색/필터 바 */}
        <StudyFilters
          query={query}
          difficulty={difficulty}
          onQueryChange={setQuery}
          onDifficultyChange={setDifficulty}
        />

        {/* 결과 개수 표시 */}
        <div className="text-sm text-gray-600">
          총 {filteredItems.length}개의 학습 자료를 찾았습니다.
        </div>
        {deleteError && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {deleteError}
          </div>
        )}

        {/* 카드 그리드 */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item: StudyItem) => (
              <StudyCard
                key={item.id}
                item={item}
                onStart={(id) => router.push(`/my/learning/${encodeURIComponent(id)}/problems`)}
                onReview={() => router.push('/my/incorrect-answers')}
                onDelete={(id) => handleDeleteMaterial(id)}
                isDeleting={deletingId === item.id}
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
  };

  return (
    <>
      {renderContent()}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>문제 생성하기</DialogTitle>
            <DialogDescription>
              단원과 난이도를 선택하고 AI 문제 생성을 시작하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="unit-select">단원</Label>
              <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                <SelectTrigger id="unit-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_OPTIONS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty-select">난이도</Label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger id="difficulty-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_OPTIONS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>생성 문제 수</Label>
              <p className="text-sm text-muted-foreground">최대 5개까지 생성할 수 있어요.</p>
              <div className="flex items-center gap-4 rounded-lg border px-4 py-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleDecreaseCount}
                  disabled={questionCount <= 1}
                >
                  <Minus className="h-4 w-4" />
                  <span className="sr-only">문제 수 감소</span>
                </Button>
                <span className="w-10 text-center text-lg font-semibold">{questionCount}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleIncreaseCount}
                  disabled={questionCount >= 5}
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">문제 수 증가</span>
                </Button>
              </div>
            </div>
            {createError && <p className="text-sm text-red-600">{createError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)} disabled={isSubmitting}>
              취소
            </Button>
            <Button onClick={handleSubmitCreate} disabled={isSubmitting}>
              {isSubmitting ? '생성 중...' : '생성하기'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
