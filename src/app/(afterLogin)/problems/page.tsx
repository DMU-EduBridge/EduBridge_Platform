"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Filter,
  FileText,
  Clock,
  Users,
  TrendingUp,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { useProblems } from "@/hooks/use-api";

// 하드코딩된 데이터는 이제 API에서 가져옵니다

const difficultyColors = {
  EASY: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HARD: "bg-red-100 text-red-800",
  EXPERT: "bg-purple-100 text-purple-800",
};

const difficultyLabels = {
  EASY: "쉬움",
  MEDIUM: "보통",
  HARD: "어려움",
  EXPERT: "전문가",
};

const typeLabels = {
  MULTIPLE_CHOICE: "객관식",
  SHORT_ANSWER: "단답형",
  ESSAY: "서술형",
  CODING: "코딩",
  MATH: "수학",
};

const statusColors = {
  ACTIVE: "bg-blue-100 text-blue-800",
  DRAFT: "bg-gray-100 text-gray-800",
  ARCHIVED: "bg-red-100 text-red-800",
};

const statusLabels = {
  ACTIVE: "활성",
  DRAFT: "초안",
  ARCHIVED: "보관",
};

export default function ProblemsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  // TanStack Query 훅 사용
  const {
    problems: problemsQuery,
    stats: statsQuery,
    delete: deleteMutation,
  } = useProblems({
    search: searchTerm || undefined,
    subject: selectedSubject !== "all" ? selectedSubject : undefined,
    difficulty: selectedDifficulty !== "all" ? selectedDifficulty : undefined,
  });

  const problems = problemsQuery.data?.problems || [];
  const stats = statsQuery.data;

  const handleDelete = (id: string) => {
    if (confirm("정말로 이 문제를 삭제하시겠습니까?")) {
      deleteMutation.mutate(id as any);
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">문제 관리</h1>
          <p className="text-gray-600 mt-2">
            학습 문제를 생성하고 관리하여 학생들의 학습을 도와주세요.
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />새 문제 생성
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 문제 수</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsQuery.isLoading ? "..." : stats?.totalProblems || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.weeklyChange ? `+${stats.weeklyChange} 이번 주` : "로딩 중..."}
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
              {statsQuery.isLoading ? "..." : `${stats?.averageSuccessRate || 0}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.successRateChange ? `+${stats.successRateChange}% 이번 주` : "로딩 중..."}
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
              {statsQuery.isLoading ? "..." : stats?.totalAttempts || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.attemptsChange ? `+${stats.attemptsChange} 이번 주` : "로딩 중..."}
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
              {statsQuery.isLoading ? "..." : stats?.activeProblems || 0}
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
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
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
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
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
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">문제 목록을 불러오는 중...</p>
            </CardContent>
          </Card>
        ) : problemsQuery.error ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-red-600">문제 목록을 불러오는데 실패했습니다.</p>
            </CardContent>
          </Card>
        ) : (
          problems.map((problem: any) => (
            <Card key={problem.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{problem.title}</h3>
                      <Badge className={statusColors[problem.status as keyof typeof statusColors]}>
                        {statusLabels[problem.status as keyof typeof statusLabels]}
                      </Badge>
                      <Badge
                        className={
                          difficultyColors[problem.difficulty as keyof typeof difficultyColors]
                        }
                      >
                        {difficultyLabels[problem.difficulty as keyof typeof difficultyColors]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span>과목: {problem.subject}</span>
                      <span>유형: {typeLabels[problem.type as keyof typeof typeLabels]}</span>
                      <span>문제 수: {problem.questions}개</span>
                      <span>생성일: {problem.createdAt}</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{problem.attempts}회 시도</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                        <span>정답률 {problem.successRate}%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      보기
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      수정
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(problem.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      {deleteMutation.isPending ? "삭제 중..." : "삭제"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {!problemsQuery.isLoading && !problemsQuery.error && problems.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">문제를 찾을 수 없습니다</h3>
            <p className="text-gray-600 mb-4">검색 조건에 맞는 문제가 없습니다.</p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />새 문제 생성하기
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
