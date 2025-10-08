'use client';

import { Card } from '@/components/ui/card';
import { useLearningProgressData } from '@/hooks/dashboard/use-learning-progress';
import { memo } from 'react';

interface LearningProgressCardProps {
  subject: string;
  grade: string;
  currentUnit: string;
  progress: number;
  gradeColor: 'green' | 'red';
}

const LearningProgressCard = memo(function LearningProgressCard({
  subject,
  grade,
  currentUnit,
  progress,
  gradeColor,
}: LearningProgressCardProps) {
  const getProgressColor = () => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-green-400';
    if (progress >= 30) return 'bg-purple-500';
    return 'bg-gray-400';
  };

  const getGradeColorClass = () => {
    return gradeColor === 'green' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{subject}</h3>
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${getGradeColorClass()}`}>
            {grade}
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-600">현재 배우고 있는 단원: {currentUnit}</p>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">진도율</span>
              <span className="font-medium text-gray-900">{progress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-2 rounded-full ${getProgressColor()}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
});

export const LearningProgressCards = memo(function LearningProgressCards() {
  const { learningProgress = [], isLoading, error } = useLearningProgressData();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse p-6">
            <div className="h-5 w-32 rounded bg-gray-200" />
            <div className="mt-4 h-3 w-full rounded bg-gray-200" />
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        학습 진도를 불러오지 못했습니다.
      </div>
    );
  }

  if (learningProgress.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
        아직 학습 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {learningProgress.map((item) => (
        <LearningProgressCard
          key={item.id}
          subject={item.subject}
          grade={item.grade}
          currentUnit={item.currentUnit}
          progress={item.progress}
          gradeColor={item.gradeColor}
        />
      ))}
    </div>
  );
});
