'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ClassWithStats } from '@/types/domain/class';
import { BookOpen, Calendar, Edit, MoreHorizontal, Trash2, Users } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface ClassCardProps {
  classData: ClassWithStats;
  onEdit?: (classData: ClassWithStats) => void;
  onDelete?: (classId: string) => void;
}

export function ClassCard({ classData, onEdit, onDelete }: ClassCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete) return;

    if (confirm('정말로 이 클래스를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      setIsDeleting(true);
      try {
        await onDelete(classData.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{classData.name}</CardTitle>
            <CardDescription className="mt-1">
              {classData.subject} • {classData.gradeLevel} • {classData.schoolYear}{' '}
              {classData.semester}
            </CardDescription>
            {classData.description && (
              <p className="mt-2 line-clamp-2 text-sm text-gray-600">{classData.description}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(classData)}>
                <Edit className="mr-2 h-4 w-4" />
                수정
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 통계 정보 */}
        <div className="grid grid-cols-2 gap-4">
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
        </div>

        {/* 상태 및 생성일 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={classData.isActive ? 'default' : 'secondary'}>
              {classData.isActive ? '활성' : '비활성'}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              {new Date(classData.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-2 pt-2">
          <Link href={`/classes/${classData.id}`} className="flex-1">
            <Button variant="default" size="sm" className="w-full">
              클래스 관리
            </Button>
          </Link>
          <Link href={`/classes/${classData.id}/progress`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              진도 확인
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
