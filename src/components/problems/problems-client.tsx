'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useProblems } from '@/hooks/problems';
import {
  Problem,
  getProblemDifficultyConfig,
  getProblemStatusConfig,
  getProblemTypeConfig,
} from '@/types/domain/problem';
import { Clock, Edit, Eye, FileText, Plus, Search, Trash2, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// Loading skeleton component
function ProblemsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <div className="h-6 w-48 rounded bg-slate-200" />
                  <div className="h-6 w-16 rounded-full bg-slate-200" />
                  <div className="h-6 w-16 rounded-full bg-slate-200" />
                </div>
                <div className="mb-3 flex items-center gap-4">
                  <div className="h-4 w-20 rounded bg-slate-200" />
                  <div className="h-4 w-16 rounded bg-slate-200" />
                  <div className="h-4 w-24 rounded bg-slate-200" />
                  <div className="h-4 w-32 rounded bg-slate-200" />
                </div>
                <div className="flex items-center gap-6">
                  <div className="h-4 w-24 rounded bg-slate-200" />
                  <div className="h-4 w-20 rounded bg-slate-200" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-16 rounded bg-slate-200" />
                <div className="h-8 w-16 rounded bg-slate-200" />
                <div className="h-8 w-16 rounded bg-slate-200" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Error component
function ProblemsError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <h3 className="mb-2 text-lg font-semibold text-red-800">문제를 불러올 수 없습니다</h3>
        <p className="mb-4 text-red-600">{error.message}</p>
        <Button onClick={onRetry} variant="outline">
          다시 시도
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ProblemsClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');

  // TanStack Query 훅 사용
  const {
    problems: problemsQuery,
    stats: statsQuery,
    delete: deleteMutation,
  } = useProblems({
    ...(searchTerm && { search: searchTerm }),
    ...(selectedSubject !== 'all' && { subject: selectedSubject }),
    ...(selectedDifficulty !== 'all' && { difficulty: selectedDifficulty }),
  });

  const problems = problemsQuery.data?.problems || [];
  const stats = statsQuery.data;

  const handleDelete = (id: string) => {
    if (confirm('정말로 이 문제를 삭제하시겠습니까?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">문제 관리</h1>
          <p className="mt-2 text-gray-600">
            학습 문제를 생성하고 관리하여 학생들의 학습을 도와주세요.
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />새 문제 생성
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 문제 수</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsQuery.isLoading ? '...' : stats?.totalProblems || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.weeklyChange ? `+${stats.weeklyChange} 이번 주` : '로딩 중...'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 정답률</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsQuery.isLoading ? '...' : `${stats?.averageSuccessRate || 0}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.successRateChange ? `+${stats.successRateChange}% 이번 주` : '로딩 중...'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 시도 횟수</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsQuery.isLoading ? '...' : stats?.totalAttempts || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.attemptsChange ? `+${stats.attemptsChange} 이번 주` : '로딩 중...'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 문제</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsQuery.isLoading ? '...' : stats?.activeProblems || 0}
            </div>
            <p className="text-xs text-muted-foreground">활성 상태</p>
          </CardContent>
        </Card>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <CardTitle>문제 검색 및 필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="문제 제목으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="all">모든 과목</option>
                <option value="수학">수학</option>
                <option value="영어">영어</option>
                <option value="국어">국어</option>
                <option value="과학">과학</option>
              </select>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="all">모든 난이도</option>
                <option value="EASY">쉬움</option>
                <option value="MEDIUM">보통</option>
                <option value="HARD">어려움</option>
                <option value="EXPERT">전문가</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 문제 목록 */}
      <div className="space-y-4">
        {problemsQuery.isLoading ? (
          <ProblemsSkeleton />
        ) : problemsQuery.error ? (
          <ProblemsError
            error={problemsQuery.error as Error}
            onRetry={() => problemsQuery.refetch()}
          />
        ) : (
          problems.map((problem: Problem) => {
            const difficultyConfig = getProblemDifficultyConfig(problem.difficulty);
            const statusConfig = getProblemStatusConfig(problem.status);
            const typeConfig = getProblemTypeConfig(problem.type);

            return (
              <Card key={problem.id} className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">{problem.title}</h3>
                        <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                        <Badge className={difficultyConfig.color}>{difficultyConfig.label}</Badge>
                      </div>
                      <div className="mb-3 flex items-center gap-4 text-sm text-gray-600">
                        <span>과목: {problem.subject}</span>
                        <span>유형: {typeConfig.label}</span>
                        <span>문제 수: 1개</span>
                        <span>생성일: {new Date(problem.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>0회 시도</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-gray-400" />
                          <span>정답률 0%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/problems/${problem.id}`} prefetch>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-1 h-4 w-4" />
                          보기
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        <Edit className="mr-1 h-4 w-4" />
                        수정
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(problem.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        {deleteMutation.isPending ? '삭제 중...' : '삭제'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {!problemsQuery.isLoading && !problemsQuery.error && problems.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">문제를 찾을 수 없습니다</h3>
            <p className="mb-4 text-gray-600">검색 조건에 맞는 문제가 없습니다.</p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />새 문제 생성하기
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
