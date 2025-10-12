'use client';

import { ClassCard } from '@/components/classes/class-card';
import { ClassForm } from '@/components/classes/class-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useClassMutations } from '@/hooks/classes/use-class-mutations';
import { useClasses } from '@/hooks/classes/use-classes';
import { ClassWithStats, CreateClassRequest, UpdateClassRequest } from '@/types/domain/class';
import { BookOpen, Calendar, Plus, Users } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ClassesPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassWithStats | null>(null);

  const { data: classesResponse, isLoading, error } = useClasses();
  const { createClass, updateClass, deleteClass } = useClassMutations();

  const classes = classesResponse?.data || [];

  const handleCreateClass = async (data: CreateClassRequest) => {
    try {
      await createClass.mutateAsync(data);
      setShowCreateForm(false);
      toast.success('클래스가 생성되었습니다');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '클래스 생성에 실패했습니다');
    }
  };

  const handleUpdateClass = async (data: UpdateClassRequest) => {
    if (!editingClass) return;

    try {
      await updateClass.mutateAsync({ classId: editingClass.id, data });
      setEditingClass(null);
      toast.success('클래스가 수정되었습니다');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '클래스 수정에 실패했습니다');
    }
  };

  const handleDeleteClass = async (classId: string) => {
    try {
      await deleteClass.mutateAsync(classId);
      toast.success('클래스가 삭제되었습니다');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '클래스 삭제에 실패했습니다');
    }
  };

  if (showCreateForm) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">새 클래스 생성</h1>
            <p className="mt-2 text-gray-600">새로운 클래스를 생성하세요</p>
          </div>
          <Button variant="outline" onClick={() => setShowCreateForm(false)}>
            목록으로 돌아가기
          </Button>
        </div>
        <ClassForm
          onSubmit={handleCreateClass}
          onCancel={() => setShowCreateForm(false)}
          isLoading={createClass.isPending}
        />
      </div>
    );
  }

  if (editingClass) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">클래스 수정</h1>
            <p className="mt-2 text-gray-600">클래스 정보를 수정하세요</p>
          </div>
          <Button variant="outline" onClick={() => setEditingClass(null)}>
            목록으로 돌아가기
          </Button>
        </div>
        <ClassForm
          initialData={editingClass}
          onSubmit={handleUpdateClass}
          onCancel={() => setEditingClass(null)}
          isLoading={updateClass.isPending}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">내 클래스</h1>
          <p className="mt-2 text-gray-600">생성한 클래스를 관리하고 학생들의 학습을 지도하세요.</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />새 클래스 생성
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 클래스</p>
                <p className="text-2xl font-bold">{classes.length}개</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">활성 클래스</p>
                <p className="text-2xl font-bold">{classes.filter((c) => c.isActive).length}개</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 학생 수</p>
                <p className="text-2xl font-bold">
                  {classes.reduce((sum, c) => sum + c.stats.totalMembers, 0)}명
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">이번 달 생성</p>
                <p className="text-2xl font-bold">
                  {
                    classes.filter((c) => {
                      const created = new Date(c.createdAt);
                      const now = new Date();
                      return (
                        created.getMonth() === now.getMonth() &&
                        created.getFullYear() === now.getFullYear()
                      );
                    }).length
                  }
                  개
                </p>
              </div>
              <Plus className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 클래스 목록 */}
      {isLoading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-gray-600">클래스 목록을 불러오는 중...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-red-600">클래스 목록을 불러오는데 실패했습니다.</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              다시 시도
            </Button>
          </CardContent>
        </Card>
      ) : classes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">아직 클래스가 없습니다</h3>
            <p className="mb-4 text-gray-600">첫 번째 클래스를 생성해보세요.</p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              클래스 생성하기
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {classes.map((classData) => (
            <ClassCard
              key={classData.id}
              classData={classData}
              onEdit={setEditingClass}
              onDelete={handleDeleteClass}
            />
          ))}
        </div>
      )}
    </div>
  );
}
