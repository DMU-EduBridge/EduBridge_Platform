'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StudentProgress } from '@/types/domain/progress';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface ClassProgressChartProps {
  students: StudentProgress[];
  className: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function ClassProgressChart({ students, className }: ClassProgressChartProps) {
  // 진도율별 학생 분포 데이터
  const progressDistribution = [
    { range: '0-20%', count: students.filter((s) => s.progressPercentage <= 20).length },
    {
      range: '21-40%',
      count: students.filter((s) => s.progressPercentage > 20 && s.progressPercentage <= 40).length,
    },
    {
      range: '41-60%',
      count: students.filter((s) => s.progressPercentage > 40 && s.progressPercentage <= 60).length,
    },
    {
      range: '61-80%',
      count: students.filter((s) => s.progressPercentage > 60 && s.progressPercentage <= 80).length,
    },
    { range: '81-100%', count: students.filter((s) => s.progressPercentage > 80).length },
  ];

  // 정답률별 학생 분포 데이터
  const accuracyDistribution = [
    { range: '0-20%', count: students.filter((s) => s.accuracyRate <= 20).length },
    {
      range: '21-40%',
      count: students.filter((s) => s.accuracyRate > 20 && s.accuracyRate <= 40).length,
    },
    {
      range: '41-60%',
      count: students.filter((s) => s.accuracyRate > 40 && s.accuracyRate <= 60).length,
    },
    {
      range: '61-80%',
      count: students.filter((s) => s.accuracyRate > 60 && s.accuracyRate <= 80).length,
    },
    { range: '81-100%', count: students.filter((s) => s.accuracyRate > 80).length },
  ];

  // 학생별 진도 데이터 (상위 10명)
  const topStudents = students
    .sort((a, b) => b.progressPercentage - a.progressPercentage)
    .slice(0, 10)
    .map((student) => ({
      name:
        student.studentName.length > 8
          ? student.studentName.substring(0, 8) + '...'
          : student.studentName,
      progress: Math.round(student.progressPercentage),
      accuracy: Math.round(student.accuracyRate),
    }));

  return (
    <div className="space-y-6 p-6">
      {/* 클래스 전체 통계 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">총 학생 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}명</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">평균 진도율</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                students.reduce((sum, s) => sum + s.progressPercentage, 0) / students.length || 0,
              )}
              %
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">평균 정답률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                students.reduce((sum, s) => sum + s.accuracyRate, 0) / students.length || 0,
              )}
              %
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">활성 학생</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                students.filter(
                  (s) => s.lastActivity > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                ).length
              }
              명
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 학생별 진도 차트 */}
      <Card>
        <CardHeader>
          <CardTitle>학생별 진도율</CardTitle>
          <CardDescription>{className} 학생들의 진도율 비교</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topStudents}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="progress" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 진도율 분포 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>진도율 분포</CardTitle>
            <CardDescription>학생들의 진도율 분포</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={progressDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, count }) => `${range}: ${count}명`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {progressDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>정답률 분포</CardTitle>
            <CardDescription>학생들의 정답률 분포</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={accuracyDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, count }) => `${range}: ${count}명`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {accuracyDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
