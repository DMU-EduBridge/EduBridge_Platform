'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProblemAssignment } from '@/types/domain/assignment';
import { AssignmentStatus, AssignmentType } from '@prisma/client';
import { Calendar, Clock, User, Users } from 'lucide-react';
import Link from 'next/link';

interface AssignmentCardProps {
  assignment: ProblemAssignment;
  onEdit?: (assignment: ProblemAssignment) => void;
  onDelete?: (assignment: ProblemAssignment) => void;
}

const getStatusColor = (status: AssignmentStatus) => {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-100 text-gray-800';
    case 'ACTIVE':
      return 'bg-blue-100 text-blue-800';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'OVERDUE':
      return 'bg-red-100 text-red-800';
    case 'CANCELLED':
      return 'bg-gray-100 text-gray-600';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: AssignmentStatus) => {
  switch (status) {
    case 'DRAFT':
      return '초안';
    case 'ACTIVE':
      return '진행중';
    case 'COMPLETED':
      return '완료';
    case 'OVERDUE':
      return '기한초과';
    case 'CANCELLED':
      return '취소';
    default:
      return status;
  }
};

const getTypeText = (type: AssignmentType) => {
  switch (type) {
    case 'HOMEWORK':
      return '숙제';
    case 'QUIZ':
      return '퀴즈';
    case 'EXAM':
      return '시험';
    case 'PRACTICE':
      return '연습';
    case 'REVIEW':
      return '복습';
    case 'PROJECT':
      return '프로젝트';
    default:
      return type;
  }
};

export function AssignmentCard({ assignment, onEdit, onDelete }: AssignmentCardProps) {
  const isOverdue =
    assignment.dueDate &&
    new Date(assignment.dueDate) < new Date() &&
    assignment.status === 'ACTIVE';

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{assignment.title}</CardTitle>
            {assignment.description && (
              <CardDescription className="line-clamp-2">{assignment.description}</CardDescription>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(assignment.status)}>
              {getStatusText(assignment.status)}
            </Badge>
            <Badge variant="outline">{getTypeText(assignment.assignmentType)}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 배정 정보 */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {assignment.class ? (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{assignment.class.name}</span>
              </div>
            ) : assignment.student ? (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{assignment.student.name}</span>
              </div>
            ) : null}

            {assignment.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span className={isOverdue ? 'font-medium text-red-600' : ''}>
                  {new Date(assignment.dueDate).toLocaleDateString()}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{assignment.problems?.length || 0}개 문제</span>
            </div>
          </div>

          {/* 문제 목록 */}
          {assignment.problems && assignment.problems.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">포함된 문제:</h4>
              <div className="flex flex-wrap gap-1">
                {assignment.problems.slice(0, 3).map((problem) => (
                  <Badge key={problem.id} variant="secondary" className="text-xs">
                    {problem.title}
                  </Badge>
                ))}
                {assignment.problems.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{assignment.problems.length - 3}개 더
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* 지시사항 */}
          {assignment.instructions && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium">지시사항:</h4>
              <p className="line-clamp-2 text-sm text-gray-600">{assignment.instructions}</p>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-gray-500">
              생성일: {new Date(assignment.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/assignments/${assignment.id}`}>
                <Button variant="outline" size="sm">
                  상세보기
                </Button>
              </Link>
              {onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(assignment)}>
                  수정
                </Button>
              )}
              {onDelete && (
                <Button variant="outline" size="sm" onClick={() => onDelete(assignment)}>
                  삭제
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
