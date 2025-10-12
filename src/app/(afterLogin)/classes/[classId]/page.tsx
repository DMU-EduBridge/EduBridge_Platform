'use client';

import { ClassForm } from '@/components/classes/class-form';
import { InviteStudentModal } from '@/components/classes/invite-student-modal';
import { MemberList } from '@/components/classes/member-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useClassDetail } from '@/hooks/classes/use-class-detail';
import { useClassMemberMutations } from '@/hooks/classes/use-class-members';
import { useClassMutations } from '@/hooks/classes/use-class-mutations';
import { AddMemberRequest, UpdateClassRequest } from '@/types/domain/class';
import { ArrowLeft, BookOpen, Calendar, Edit, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;

  const [showEditForm, setShowEditForm] = useState(false);

  const { data: classResponse, isLoading, error } = useClassDetail(classId);
  const { updateClass } = useClassMutations();
  const { addMember, removeMember } = useClassMemberMutations();

  const classData = classResponse?.data;

  const handleUpdateClass = async (data: UpdateClassRequest) => {
    try {
      await updateClass.mutateAsync({ classId, data });
      setShowEditForm(false);
      toast.success('클래스가 수정되었습니다');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '클래스 수정에 실패했습니다');
    }
  };

  const handleInviteMember = async (data: AddMemberRequest) => {
    try {
      await addMember.mutateAsync({ classId, data });
      toast.success('멤버가 초대되었습니다');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '멤버 초대에 실패했습니다');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMember.mutateAsync({ classId, userId });
      toast.success('멤버가 제거되었습니다');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '멤버 제거에 실패했습니다');
    }
  };

  if (showEditForm && classData) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setShowEditForm(false)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              돌아가기
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">클래스 수정</h1>
              <p className="mt-2 text-gray-600">클래스 정보를 수정하세요</p>
            </div>
          </div>
        </div>
        <ClassForm
          initialData={classData}
          onSubmit={handleUpdateClass}
          onCancel={() => setShowEditForm(false)}
          isLoading={updateClass.isPending}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            돌아가기
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">클래스 정보</h1>
            <p className="mt-2 text-gray-600">클래스 정보를 불러오는 중...</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="text-gray-600">클래스 정보를 불러오는 중...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            돌아가기
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">클래스 정보</h1>
            <p className="mt-2 text-gray-600">클래스 정보를 불러올 수 없습니다</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-red-600">클래스 정보를 불러오는데 실패했습니다.</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              다시 시도
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            돌아가기
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{classData.name}</h1>
            <p className="mt-2 text-gray-600">
              {classData.subject} • {classData.gradeLevel} • {classData.schoolYear}{' '}
              {classData.semester}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEditForm(true)}>
            <Edit className="mr-2 h-4 w-4" />
            수정
          </Button>
          <Link href={`/classes/${classId}/progress`}>
            <Button>
              <BookOpen className="mr-2 h-4 w-4" />
              진도 확인
            </Button>
          </Link>
        </div>
      </div>

      {/* 클래스 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>클래스 정보</CardTitle>
          <CardDescription>클래스의 기본 정보와 통계입니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {classData.description && (
            <div>
              <h4 className="font-medium text-gray-900">설명</h4>
              <p className="text-gray-600">{classData.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-sm font-medium">{classData.stats.totalMembers}명</div>
                <div className="text-xs text-gray-500">총 멤버</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-sm font-medium">{classData.stats.totalAssignments}개</div>
                <div className="text-xs text-gray-500">과제</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <div className="text-sm font-medium">
                  {new Date(classData.createdAt).toLocaleDateString()}
                </div>
                <div className="text-xs text-gray-500">생성일</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full bg-green-500"></div>
              <div>
                <div className="text-sm font-medium">{classData.isActive ? '활성' : '비활성'}</div>
                <div className="text-xs text-gray-500">상태</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 멤버 관리 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">멤버 관리</h2>
        <InviteStudentModal onInvite={handleInviteMember} isLoading={addMember.isPending} />
      </div>

      <MemberList
        members={classData.members || []}
        onRemoveMember={handleRemoveMember}
        canManage={true}
      />
    </div>
  );
}
