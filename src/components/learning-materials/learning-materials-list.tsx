'use client';

import { MaterialCard, MaterialCardSkeleton } from '@/components/learning-materials/material-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLearningMaterials } from '@/hooks/learning';
import { BookOpen, Search } from 'lucide-react';
import { memo, useMemo, useState } from 'react';

export default memo(function LearningMaterialsList() {
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const query = useMemo(
    () => ({
      ...(search ? { search } : {}),
      ...(subject ? { subject } : {}),
      ...(status ? { status } : {}),
      page,
      limit,
    }),
    [search, subject, status, page, limit],
  );

  const { materials } = useLearningMaterials(query);

  const items = useMemo(() => materials.data?.materials || [], [materials.data?.materials]);
  const total = useMemo(() => materials.data?.total || 0, [materials.data?.total]);
  const totalPages = useMemo(
    () => materials.data?.pagination?.totalPages || 1,
    [materials.data?.pagination?.totalPages],
  );

  const displayItems = items;

  const publishedCount = useMemo(
    () => displayItems.filter((m: any) => m.status === 'PUBLISHED').length,
    [displayItems],
  );
  const draftCount = useMemo(
    () => displayItems.filter((m: any) => m.status === 'DRAFT').length,
    [displayItems],
  );
  const problemsTotal = useMemo(
    () => displayItems.reduce((sum: number, m: any) => sum + (m.problemCount || 0), 0),
    [displayItems],
  );

  // 필터 핸들러들은 현재 사용되지 않음
  // const _handleSearchChange = useCallback((value: string) => {
  //   setSearch(value);
  //   setPage(1);
  // }, []);

  // const _handleSubjectChange = useCallback((value: string) => {
  //   setSubject(value);
  //   setPage(1);
  // }, []);

  // const _handleDifficultyChange = useCallback((value: string) => {
  //   setDifficulty(value);
  //   setPage(1);
  // }, []);

  // const _handleStatusChange = useCallback((value: string) => {
  //   setStatus(value);
  //   setPage(1);
  // }, []);

  // const _handlePageChange = useCallback((newPage: number) => {
  //   setPage(newPage);
  // }, []);

  return (
    <div className="space-y-6">
      {/* 통계 요약 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">전체 자료</p>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">발행된 자료</p>
              <p className="text-2xl font-bold text-gray-900">{publishedCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
              <BookOpen className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">초안</p>
              <p className="text-2xl font-bold text-gray-900">{draftCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">총 문제 수</p>
              <p className="text-2xl font-bold text-gray-900">{problemsTotal}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">학습 자료 목록</h3>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="자료 검색..."
                className="rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <select
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setPage(1);
              }}
            >
              <option value="">모든 과목</option>
              <option value="수학">수학</option>
              <option value="과학">과학</option>
              <option value="국어">국어</option>
              <option value="영어">영어</option>
            </select>
            <select
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value);
                setPage(1);
              }}
            >
              <option value="">모든 난이도</option>
              <option value="EASY">쉬움</option>
              <option value="MEDIUM">보통</option>
              <option value="HARD">어려움</option>
              <option value="EXPERT">전문가</option>
            </select>
            <select
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">모든 상태</option>
              <option value="PUBLISHED">발행됨</option>
              <option value="DRAFT">초안</option>
              <option value="ARCHIVED">보관됨</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {materials.isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <MaterialCardSkeleton key={i} />
              ))}
            </div>
          ) : materials.isError ? (
            <div className="text-sm text-red-600">데이터를 불러오는데 실패했습니다.</div>
          ) : displayItems.length === 0 ? (
            <div className="py-8 text-center text-gray-500">학습자료가 없습니다.</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {displayItems.map((material: any) => (
                <MaterialCard key={material.id} item={material} />
              ))}
            </div>
          )}
        </div>

        {/* 페이지네이션 */}
        {items.length > 0 && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              이전
            </Button>
            <span className="text-sm text-gray-600">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              다음
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
});
