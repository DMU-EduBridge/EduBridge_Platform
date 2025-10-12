'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface Problem {
  id: string;
  title: string;
  content: string;
  type: string;
  difficulty: string;
  subject: string;
  points: number;
  isActive: boolean;
  createdAt: string;
}

interface ProblemCardProps {
  problem: Problem;
  onRemove?: () => void;
  showRemoveButton?: boolean;
}

export function ProblemCard({ problem, onRemove, showRemoveButton = false }: ProblemCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-green-100 text-green-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'HARD':
        return 'bg-red-100 text-red-800';
      case 'EXPERT':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY':
        return '쉬움';
      case 'MEDIUM':
        return '보통';
      case 'HARD':
        return '어려움';
      case 'EXPERT':
        return '전문가';
      default:
        return difficulty;
    }
  };

  const getSubjectLabel = (subject: string) => {
    switch (subject) {
      case 'MATH':
        return '수학';
      case 'SCIENCE':
        return '과학';
      case 'KOREAN':
        return '국어';
      case 'ENGLISH':
        return '영어';
      case 'SOCIAL':
        return '사회';
      default:
        return subject;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'MULTIPLE_CHOICE':
        return '객관식';
      case 'SHORT_ANSWER':
        return '단답형';
      case 'ESSAY':
        return '서술형';
      case 'CODING':
        return '코딩';
      default:
        return type;
    }
  };

  return (
    <div className="rounded-lg border p-4 transition-colors hover:bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="mb-2 font-medium text-gray-900">{problem.title}</h3>
          <p className="mb-3 line-clamp-2 text-sm text-gray-600">{problem.content}</p>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className={getDifficultyColor(problem.difficulty)}>
              {getDifficultyLabel(problem.difficulty)}
            </Badge>
            <Badge variant="outline">{getSubjectLabel(problem.subject)}</Badge>
            <Badge variant="outline">{getTypeLabel(problem.type)}</Badge>
            <span className="text-xs text-gray-500">{problem.points}점</span>
          </div>
        </div>

        {showRemoveButton && onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="ml-4 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
