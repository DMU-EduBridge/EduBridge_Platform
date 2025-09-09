import { Users, BookOpen, FileText, TrendingUp } from 'lucide-react';

const stats = [
  {
    name: '활성 학생',
    value: '45',
    change: '+5',
    changeType: 'positive',
    icon: Users,
  },
  {
    name: '학습 자료',
    value: '128',
    change: '+12',
    changeType: 'positive',
    icon: BookOpen,
  },
  {
    name: '문제 풀이',
    value: '1,247',
    change: '+89',
    changeType: 'positive',
    icon: FileText,
  },
  {
    name: '평균 성취율',
    value: '87%',
    change: '+3%',
    changeType: 'positive',
    icon: TrendingUp,
  },
];

export const StatsCards = () => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
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
          <div className="mt-4 flex items-center">
            <span
              className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {stat.change}
            </span>
            <span className="ml-2 text-sm text-gray-500">지난 주 대비</span>
          </div>
        </div>
      ))}
    </div>
  );
};
