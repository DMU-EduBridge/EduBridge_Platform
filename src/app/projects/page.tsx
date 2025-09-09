'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  Clock,
  MoreHorizontal,
  Edit,
  Eye,
} from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/layout';

const learningMaterials = [
  {
    id: '1',
    title: '수학 기초 - 함수와 그래프',
    description: '함수의 개념과 그래프 그리기 기초 학습 자료',
    status: 'PUBLISHED',
    subject: '수학',
    difficulty: 'EASY',
    estimatedTime: 45,
    studentsCompleted: 23,
    totalStudents: 30,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    title: '영어 문법 - 시제 완전 정복',
    description: '영어의 모든 시제를 체계적으로 학습하는 자료',
    status: 'DRAFT',
    subject: '영어',
    difficulty: 'MEDIUM',
    estimatedTime: 60,
    studentsCompleted: 0,
    totalStudents: 25,
    createdAt: '2024-03-01',
  },
  {
    id: '3',
    title: '과학 실험 - 화학 반응',
    description: '화학 반응의 원리와 실험 방법 학습 자료',
    status: 'PUBLISHED',
    subject: '과학',
    difficulty: 'HARD',
    estimatedTime: 90,
    studentsCompleted: 18,
    totalStudents: 20,
    createdAt: '2024-02-01',
  },
];

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-red-100 text-red-800',
};

const statusLabels = {
  DRAFT: '초안',
  PUBLISHED: '게시됨',
  ARCHIVED: '보관됨',
};

const difficultyColors = {
  EASY: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HARD: 'bg-red-100 text-red-800',
  EXPERT: 'bg-purple-100 text-purple-800',
};

const difficultyLabels = {
  EASY: '쉬움',
  MEDIUM: '보통',
  HARD: '어려움',
  EXPERT: '전문가',
};

export default function LearningPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filteredMaterials = learningMaterials.filter((material) => {
    const matchesSearch =
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || material.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">학습 자료</h1>
            <p className="mt-2 text-gray-600">학생들을 위한 학습 자료를 관리하고 업로드하세요</p>
          </div>
          <Button asChild>
            <Link href="/learning/new">
              <Plus className="mr-2 h-4 w-4" />새 자료 추가
            </Link>
          </Button>
        </div>

        {/* 필터 및 검색 */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <input
                    type="text"
                    placeholder="학습 자료 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">모든 상태</option>
                  <option value="PUBLISHED">게시됨</option>
                  <option value="DRAFT">초안</option>
                  <option value="ARCHIVED">보관됨</option>
                </select>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  필터
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 학습 자료 목록 */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filteredMaterials.map((material) => (
            <Card key={material.id} className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="mb-2 text-lg">{material.title}</CardTitle>
                    <div className="mb-2 flex gap-2">
                      <Badge className={statusColors[material.status as keyof typeof statusColors]}>
                        {statusLabels[material.status as keyof typeof statusLabels]}
                      </Badge>
                      <Badge
                        className={
                          difficultyColors[material.difficulty as keyof typeof difficultyColors]
                        }
                      >
                        {difficultyLabels[material.difficulty as keyof typeof difficultyLabels]}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">{material.description}</CardDescription>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2 font-medium">과목:</span>
                    <span>{material.subject}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>예상 학습 시간: {material.estimatedTime}분</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="mr-2 h-4 w-4" />
                    <span>
                      완료: {material.studentsCompleted}/{material.totalStudents}명
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>생성일: {material.createdAt}</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/learning/${material.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      보기
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/learning/${material.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMaterials.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-500">
                <Search className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <h3 className="mb-2 text-lg font-medium">학습 자료를 찾을 수 없습니다</h3>
                <p>검색 조건을 변경하거나 새 학습 자료를 추가해보세요.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
