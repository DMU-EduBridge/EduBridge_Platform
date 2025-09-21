import { BookOpen, FileText, TrendingUp } from 'lucide-react';

interface StatItem {
  name: string;
  value: string;
  change?: string;
  icon: React.ComponentType<{ className?: string }>;
}

const studentStats: StatItem[] = [
  { name: '진행 중인 학습', value: '3', change: '+1', icon: BookOpen },
  { name: '오늘 푼 문제', value: '12', change: '+4', icon: FileText },
  { name: '평균 정답률', value: '82%', change: '+2%', icon: TrendingUp },
];

export const StudentStatsCards = () => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {studentStats.map((stat) => (
        <div
          key={stat.name}
          className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <stat.icon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          {stat.change && (
            <div className="mt-4 flex items-center">
              <span className="text-sm font-medium text-green-600">{stat.change}</span>
              <span className="ml-2 text-sm text-gray-500">전일 대비</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
