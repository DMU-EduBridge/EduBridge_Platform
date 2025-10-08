'use client';

import { Card } from '@/components/ui/card';
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
  const learningData = [
    {
      subject: '한국의 역사',
      grade: '중학교 3학년',
      currentUnit: '한국 전쟁의 시작',
      progress: 50,
      gradeColor: 'green' as const,
    },
    {
      subject: '알쏭달쏭 수학',
      grade: '중학교 3학년',
      currentUnit: '일차방정식',
      progress: 75,
      gradeColor: 'green' as const,
    },
    {
      subject: '고등 영어',
      grade: '고등학교 1학년',
      currentUnit: 'Hello, everyone',
      progress: 30,
      gradeColor: 'red' as const,
    },
  ];

  return (
    <div className="space-y-4">
      {learningData.map((item, index) => (
        <LearningProgressCard
          key={index}
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
