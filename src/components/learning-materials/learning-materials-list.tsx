'use client';

import { MaterialCard, MaterialCardSkeleton } from '@/components/learning-materials/material-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLearningMaterials } from '@/hooks/learning';
import { BookOpen, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function LearningMaterialsList() {
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const query = {
    ...(search ? { search } : {}),
    ...(subject ? { subject } : {}),
    ...(status ? { status } : {}),
    page,
    limit,
  };

  const { materials } = useLearningMaterials(query);

  const items = useMemo(() => materials.data?.items || [], [materials.data?.items]);
  const total = materials.data?.pagination?.total || 0;
  const totalPages = materials.data?.pagination?.totalPages || 1;

  // 개발용 mock 데이터 (실제 API 연동 시 제거)
  const mockItems = [
    {
      id: 'm1',
      title: '수학 기초 - 이차방정식',
      description: '이차방정식의 기본 개념과 풀이 방법을 학습합니다.',
      subject: '수학',
      difficulty: 'MEDIUM',
      estimatedTime: 30,
      status: 'PUBLISHED',
      problemsCount: 5,
    },
    {
      id: 'm2',
      title: '과학 실험 - 광합성',
      description: '식물의 광합성 과정을 실험을 통해 이해합니다.',
      subject: '과학',
      difficulty: 'HARD',
      estimatedTime: 45,
      status: 'PUBLISHED',
      problemsCount: 8,
    },
    {
      id: 'm3',
      title: '국어 문법 - 조사와 어미',
      description: '한국어의 조사와 어미에 대한 기본 문법을 학습합니다.',
      subject: '국어',
      difficulty: 'EASY',
      estimatedTime: 20,
      status: 'DRAFT',
      problemsCount: 3,
    },
  ];

  const displayItems = items.length > 0 ? items : mockItems;

  const publishedCount = useMemo(
    () => displayItems.filter((m: any) => m.status === 'PUBLISHED').length,
    [displayItems],
  );
  const draftCount = useMemo(
    () => displayItems.filter((m: any) => m.status === 'DRAFT').length,
    [displayItems],
  );
  const problemsTotal = useMemo(
    () => displayItems.reduce((sum: number, m: any) => sum + (m.problemsCount || 0), 0),
    [displayItems],
  );

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
          {materials.isLoading && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <MaterialCardSkeleton key={i} />
              ))}
            </div>
          )}
          {materials.isError && (
            <div className="text-sm text-red-600">목록을 불러오지 못했습니다.</div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {displayItems.map((material: any) => (
              <MaterialCard key={material.id} item={material} />
            ))}
          </div>
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
}
