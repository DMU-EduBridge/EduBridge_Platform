'use client';

import { ConceptMatrix } from '@/components/reports/concept-matrix';
import { InsightsPanel } from '@/components/reports/insights-panel';
import { KpiCards } from '@/components/reports/kpi-cards';
import { RecentMistakes } from '@/components/reports/recent-mistakes';
import { ReportHeader } from '@/components/reports/report-header';
import { SubjectBreakdown } from '@/components/reports/subject-breakdown';
import { TimelineSection } from '@/components/reports/timeline-section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useReports } from '@/hooks/reports';
import { useReportDetailSections } from '@/hooks/reports/use-report-detail';
import { User } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

// const _statusColors: Record<string, string> = {
//   COMPLETED: 'bg-green-100 text-green-800',
//   IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
//   PENDING: 'bg-gray-100 text-gray-800',
// };

export default function ReportDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { useReport, download } = useReports();
  const reportQuery = useReport(params.id);
  const sections = useReportDetailSections(params.id);

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
      <ReportHeader
        backHref="/reports"
        title={r.title}
        status={r.status}
        onDownload={() => download.mutate(r.id)}
        downloading={download.isPending}
      />

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

      <KpiCards
        totalProblems={r.totalProblems}
        averageScore={r.averageScore}
        completionRate={r.completionRate}
        students={r.students}
      />

      <InsightsPanel insights={r.insights} recommendations={r.recommendations} />

      <SubjectBreakdown items={sections.breakdown} loading={sections.isLoading} />
      <ConceptMatrix items={sections.concepts} loading={sections.isLoading} />
      <TimelineSection points={sections.timeline} loading={sections.isLoading} />
      <RecentMistakes
        items={sections.recentMistakes}
        loading={sections.isLoading}
        onRetry={async (pid) => {
          try {
            // 문제-학습자료 매핑 조회
            const res = await fetch(`/api/problems/material?ids=${encodeURIComponent(pid)}`);
            let studyId: string | null = null;
            if (res.ok) {
              const json = await res.json();
              const rec = (json?.data || [])[0];
              if (rec?.studyId) studyId = rec.studyId as string;
            }
            if (!studyId) {
              router.push(`/problems/${encodeURIComponent(pid)}?retry=true`);
              return;
            }
            const idsParam = encodeURIComponent(pid);
            router.push(
              `/my/learning/${encodeURIComponent(studyId)}/problems/${encodeURIComponent(
                pid,
              )}?wrongOnly=1&ids=${idsParam}&from=report`,
            );
          } catch (e) {
            console.error('리포트에서 재풀이 이동 실패:', e);
            router.push('/my/learning?error=server-error');
          }
        }}
      />
    </div>
  );
}
