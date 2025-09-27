// 성능 최적화를 위한 유틸리티 함수들

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const getGrade = (percentage: number) => {
  if (percentage >= 90) return { grade: 'A+', color: 'text-green-600', bgColor: 'bg-green-100' };
  if (percentage >= 80) return { grade: 'A', color: 'text-green-600', bgColor: 'bg-green-100' };
  if (percentage >= 70) return { grade: 'B+', color: 'text-blue-600', bgColor: 'bg-blue-100' };
  if (percentage >= 60) return { grade: 'B', color: 'text-blue-600', bgColor: 'bg-blue-100' };
  if (percentage >= 50) return { grade: 'C+', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
  if (percentage >= 40) return { grade: 'C', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
  return { grade: 'D', color: 'text-red-600', bgColor: 'bg-red-100' };
};

export const calculateScore = (
  correctAnswers: number,
  totalProblems: number,
  totalPoints: number,
) => {
  if (totalProblems === 0) return 0;
  return Math.floor(totalPoints * (correctAnswers / totalProblems));
};

export const calculatePercentage = (correctAnswers: number, completedProblems: number) => {
  if (completedProblems === 0) return 0;
  return Math.round((correctAnswers / completedProblems) * 100);
};

// 디버깅용 로그 (개발 환경에서만)
export const debugLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, data);
  }
};
