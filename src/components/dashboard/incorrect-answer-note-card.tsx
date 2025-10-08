'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useIncorrectAnswersData } from '@/hooks/dashboard/use-incorrect-answers';
import { Download } from 'lucide-react';
import { memo } from 'react';

const SubjectNoteItem = memo(function SubjectNoteItem({
  subject,
  grade,
  gradeColor,
  status,
  statusColor,
  incorrectCount,
  retryCount,
  completedCount,
}: {
  id: string;
  subject: string;
  grade: string;
  gradeColor: 'green' | 'red';
  status: string;
  statusColor: 'red' | 'yellow' | 'green';
  incorrectCount: number;
  retryCount: number;
  completedCount: number;
}) {
  const getGradeColorClass = () => {
    return gradeColor === 'green' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusColorClass = () => {
    switch (statusColor) {
      case 'red':
        return 'bg-red-100 text-red-800';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800';
      case 'green':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-gray-900">{subject}</h3>
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${getGradeColorClass()}`}>
            {grade}
          </span>
        </div>
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColorClass()}`}>
          {status}
        </span>
      </div>

      <div className="space-y-1 text-sm text-gray-600">
        <p>틀린 문제: {incorrectCount}문제</p>
        <p>다시 풀어본 문제: {retryCount}문제</p>
        <p>오답 완료: {completedCount}문제</p>
      </div>

      <div className="flex space-x-2">
        <Button size="sm" className="bg-blue-500 text-white hover:bg-blue-600">
          문제 풀기
        </Button>
        <Button size="sm" variant="outline" className="flex items-center space-x-1">
          <Download className="h-4 w-4" />
          <span>다운로드</span>
        </Button>
      </div>
    </div>
  );
});

export const IncorrectAnswerNoteCard = memo(function IncorrectAnswerNoteCard() {
  const { incorrectAnswers, isLoading, error } = useIncorrectAnswersData();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">오답 노트</h2>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-gray-500">로딩 중...</div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">오답 노트</h2>
          <div className="flex items-center justify-center py-8">
            <div className="text-sm text-red-500">데이터를 불러오는데 실패했습니다.</div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">오답 노트</h2>

        <div className="space-y-4">
          {incorrectAnswers.map((note) => (
            <SubjectNoteItem
              key={note.id}
              id={note.id}
              subject={note.subject}
              grade={note.grade}
              gradeColor={note.gradeColor}
              status={note.status}
              statusColor={note.statusColor}
              incorrectCount={note.incorrectCount}
              retryCount={note.retryCount}
              completedCount={note.completedCount}
            />
          ))}
        </div>
      </div>
    </Card>
  );
});
