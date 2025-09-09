"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Users,
  TrendingUp,
  Clock,
  BookOpen,
  MessageCircle,
  Mail,
  Calendar,
  Award,
} from "lucide-react";
import { useStudents } from "@/hooks/use-api";
import { Student } from "@/lib/api-services";

// 하드코딩된 데이터는 이제 API에서 가져옵니다

const statusColors = {
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-gray-100 text-gray-800",
  SUSPENDED: "bg-red-100 text-red-800",
};

const statusLabels = {
  ACTIVE: "활성",
  INACTIVE: "비활성",
  SUSPENDED: "정지",
};

const progressColors = {
  high: "bg-green-500",
  medium: "bg-yellow-500",
  low: "bg-red-500",
};

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // TanStack Query 훅 사용
  const {
    students: studentsQuery,
    stats: statsQuery,
    // sendMessage: sendMessageMutation,
  } = useStudents({
    search: searchTerm || undefined,
    grade: selectedGrade !== "all" ? selectedGrade : undefined,
    status: selectedStatus !== "all" ? selectedStatus : undefined,
  });

  const students = studentsQuery.data?.students || [];
  const stats = statsQuery.data;

  // const handleSendMessage = (studentId: string, message: string) => {
  //   sendMessageMutation.mutate({ id: studentId, message });
  // };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return progressColors.high;
    if (progress >= 60) return progressColors.medium;
    return progressColors.low;
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">학생 관리</h1>
          <p className="text-gray-600 mt-2">
            학생들의 학습 진도를 확인하고 개별 상담을 진행하세요.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Mail className="w-4 h-4 mr-2" />
            일괄 메일 발송
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            학생 초대
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">총 학생 수</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsQuery.isLoading ? "..." : stats?.totalStudents || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.weeklyChange ? `+${stats.weeklyChange} 이번 주` : "로딩 중..."}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">활성 학생</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsQuery.isLoading ? "..." : stats?.activeStudents || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeRate ? `${stats.activeRate}% 활성율` : "로딩 중..."}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 진도율</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsQuery.isLoading ? "..." : `${stats?.averageProgress || 0}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.progressChange ? `+${stats.progressChange}% 이번 주` : "로딩 중..."}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">평균 점수</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsQuery.isLoading ? "..." : `${stats?.averageScore || 0}점`}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.scoreChange ? `+${stats.scoreChange}점 이번 주` : "로딩 중..."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <CardTitle>학생 검색 및 필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="학생 이름 또는 이메일로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">모든 학년</option>
                <option value="1학년">1학년</option>
                <option value="2학년">2학년</option>
                <option value="3학년">3학년</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">모든 상태</option>
                <option value="ACTIVE">활성</option>
                <option value="INACTIVE">비활성</option>
                <option value="SUSPENDED">정지</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 학생 목록 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {studentsQuery.isLoading ? (
          <div className="col-span-2">
            <Card>
              <CardContent className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">학생 목록을 불러오는 중...</p>
              </CardContent>
            </Card>
          </div>
        ) : studentsQuery.error ? (
          <div className="col-span-2">
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-red-600">학생 목록을 불러오는데 실패했습니다.</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          students.map((student: Student) => (
            <Card key={student.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{student.name}</CardTitle>
                    <CardDescription>{student.grade}</CardDescription>
                  </div>
                  <Badge className={statusColors[student.status as keyof typeof statusColors]}>
                    {statusLabels[student.status as keyof typeof statusLabels]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 기본 정보 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{student.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>가입일: {student.joinDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>마지막 활동: {student.lastActivity}</span>
                  </div>
                </div>

                {/* 학습 진도 */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">학습 진도</span>
                    <span className="text-sm text-gray-600">{student.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(student.progress)}`}
                      style={{ width: `${student.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* 학습 통계 */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-semibold text-gray-900">
                      {student.completedProblems}/{student.totalProblems}
                    </div>
                    <div className="text-gray-600">완료 문제</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-semibold text-gray-900">{student.averageScore}점</div>
                    <div className="text-gray-600">평균 점수</div>
                  </div>
                </div>

                {/* 수강 과목 */}
                <div>
                  <span className="text-sm font-medium text-gray-700">수강 과목:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {student.subjects.map((subject: string) => (
                      <Badge key={subject} variant="secondary" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    상담
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    진도 확인
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Mail className="w-4 h-4 mr-1" />
                    메일
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {!studentsQuery.isLoading && !studentsQuery.error && students.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">학생을 찾을 수 없습니다</h3>
            <p className="text-gray-600 mb-4">검색 조건에 맞는 학생이 없습니다.</p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              학생 초대하기
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
