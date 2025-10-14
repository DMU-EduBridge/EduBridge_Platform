'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useClasses } from '@/hooks/classes/use-classes';
import { useProblems } from '@/hooks/problems/use-problems';
import {
  CreateAssignmentRequest,
  ProblemAssignment,
  UpdateAssignmentRequest,
} from '@/types/domain/assignment';
import { AssignmentType, Class } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface AssignmentFormProps {
  assignment?: ProblemAssignment;
  onSubmit: (data: CreateAssignmentRequest | UpdateAssignmentRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function AssignmentForm({ assignment, onSubmit, onCancel, isLoading }: AssignmentFormProps) {
  const [formData, setFormData] = useState({
    title: assignment?.title || '',
    description: assignment?.description || '',
    assignmentType: assignment?.assignmentType || AssignmentType.HOMEWORK,
    classId: assignment?.classId || '',
    studentId: assignment?.studentId || '',
    problemIds: assignment?.problemIds || [],
    dueDate: assignment?.dueDate ? new Date(assignment.dueDate).toISOString().split('T')[0] : '',
    instructions: assignment?.instructions || '',
  });

  const [selectedProblems, setSelectedProblems] = useState<string[]>(formData.problemIds);

  const { data: classesData } = useClasses();
  const { problems } = useProblems();
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProblemToggle = (problemId: string) => {
    setSelectedProblems((prev) =>
      prev.includes(problemId) ? prev.filter((id) => id !== problemId) : [...prev, problemId],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      problemIds: selectedProblems,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
    };

    // Remove empty fields
    Object.keys(submitData).forEach((key) => {
      if (submitData[key as keyof typeof submitData] === '') {
        delete submitData[key as keyof typeof submitData];
      }
    });

    await onSubmit(submitData as CreateAssignmentRequest | UpdateAssignmentRequest);
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

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{assignment ? '배정 수정' : '새 배정 생성'}</CardTitle>
        <CardDescription>
          {assignment ? '배정 정보를 수정하세요' : '학생들에게 배정할 문제를 설정하세요'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 정보 */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">제목 *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="배정 제목을 입력하세요"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="배정에 대한 설명을 입력하세요"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="assignmentType">배정 유형 *</Label>
              <Select
                value={formData.assignmentType}
                onValueChange={(value) => handleChange('assignmentType', value as AssignmentType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="배정 유형을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(AssignmentType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {getTypeText(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 배정 대상 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">배정 대상</h3>

            <div>
              <Label htmlFor="classId">클래스</Label>
              <Select
                value={formData.classId}
                onValueChange={(value) => {
                  handleChange('classId', value);
                  handleChange('studentId', ''); // Clear student when class is selected
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="클래스를 선택하세요 (선택사항)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">전체 클래스</SelectItem>
                  {(Array.isArray((classesData as any)?.data?.items)
                    ? (classesData as any).data.items
                    : Array.isArray((classesData as any)?.classes)
                      ? (classesData as any).classes
                      : Array.isArray(classesData as any)
                        ? (classesData as any)
                        : []
                  ).map((cls: Class) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} ({cls.subject} {cls.gradeLevel})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="studentId">개별 학생</Label>
              <Input
                id="studentId"
                value={formData.studentId}
                onChange={(e) => {
                  handleChange('studentId', e.target.value);
                  if (e.target.value) {
                    handleChange('classId', ''); // Clear class when student is selected
                  }
                }}
                placeholder="학생 ID를 입력하세요 (선택사항)"
              />
            </div>
          </div>

          {/* 문제 선택 */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">문제 선택 *</h3>
            <div className="max-h-60 overflow-y-auto rounded-md border p-4">
              {(problems?.data?.problems ?? []).map((problem: any) => (
                <div key={problem.id} className="flex items-center space-x-2 py-2">
                  <input
                    type="checkbox"
                    id={problem.id}
                    checked={selectedProblems.includes(problem.id)}
                    onChange={() => handleProblemToggle(problem.id)}
                    className="rounded"
                  />
                  <label htmlFor={problem.id} className="flex-1 cursor-pointer text-sm">
                    <div className="font-medium">{problem.title}</div>
                    <div className="text-gray-500">
                      {problem.subject} • {problem.difficulty}
                    </div>
                  </label>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600">선택된 문제: {selectedProblems.length}개</p>
          </div>

          {/* 기한 및 지시사항 */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="dueDate">기한</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="instructions">지시사항</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => handleChange('instructions', e.target.value)}
                placeholder="학생들에게 전달할 지시사항을 입력하세요"
                rows={3}
              />
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex items-center justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              취소
            </Button>
            <Button type="submit" disabled={isLoading || selectedProblems.length === 0}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {assignment ? '수정하기' : '생성하기'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
