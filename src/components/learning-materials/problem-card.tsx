'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getProblemDifficultyConfig, type Problem } from '@/types/domain/problem';
import { Trash2 } from 'lucide-react';

interface ProblemCardProps {
  problem: Problem;
  onRemove?: () => void;
  showRemoveButton?: boolean;
}

export function ProblemCard({ problem, onRemove, showRemoveButton = false }: ProblemCardProps) {
  const difficultyConfig = getProblemDifficultyConfig(problem.difficulty);

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
            <Badge className={difficultyConfig.color}>{difficultyConfig.label}</Badge>
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
