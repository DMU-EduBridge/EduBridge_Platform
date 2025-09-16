'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useReports } from '@/hooks/reports';
import { ArrowLeft, Download, User } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const statusColors: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  PENDING: 'bg-gray-100 text-gray-800',
};

export default function ReportDetailPage() {
  const params = useParams<{ id: string }>();
  const { useReport, download } = useReports();
  const reportQuery = useReport(params.id);

  if (reportQuery.isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">리포트를 불러오는 중...</CardContent>
      </Card>
    );
  }
  if (reportQuery.error || !reportQuery.data) {
    return (
      <Card>
        <CardContent className="p-12 text-center">리포트를 불러오지 못했습니다.</CardContent>
      </Card>
    );
  }

  const r = reportQuery.data as any;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/reports" className="text-sm text-gray-600 hover:underline">
            <ArrowLeft className="mr-1 inline h-4 w-4" /> 목록으로
          </Link>
          <h1 className="text-2xl font-bold">{r.title}</h1>
          <Badge className={statusColors[r.status] || ''}>{r.status}</Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => download.mutate(r.id)}
            disabled={download.isPending}
          >
            <Download className="mr-2 h-4 w-4" /> PDF 다운로드
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>학생 정보</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <User className="h-6 w-6 text-gray-500" />
          <div>
            <div className="font-semibold">{r.student?.name}</div>
            <div className="text-sm text-gray-600">{r.period}</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>총 문제 수</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{r.totalProblems}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>평균 점수</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{r.averageScore}점</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>완료율</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{r.completionRate}%</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>학생 수</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{r.students}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>인사이트</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(r.insights || []).map((s: string, i: number) => (
            <div key={i} className="rounded bg-blue-50 p-2 text-sm text-gray-800">
              {s}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>개선 제안</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(r.recommendations || []).map((s: string, i: number) => (
            <div key={i} className="rounded bg-green-50 p-2 text-sm text-gray-800">
              {s}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
