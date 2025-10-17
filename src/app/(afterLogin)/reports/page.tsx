'use client';

import { GenerateReportModal } from '@/components/reports/generate-report-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRefineReport } from '@/hooks/reports/use-refine-report';
import { useStudentReport } from '@/hooks/reports/use-student-report';
import { useTeacherOverview } from '@/hooks/reports/use-teacher-overview';
import { AlertTriangle, BookOpen, Download } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export default function ReportsPage() {
  const searchParams = useSearchParams();
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>(undefined);
  const [from, setFrom] = useState<string | undefined>(undefined);
  const [to, setTo] = useState<string | undefined>(undefined);
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [generateOpen, setGenerateOpen] = useState(false);

  useEffect(() => {
    const s = searchParams.get('studentId') || undefined;
    setSelectedStudentId(s || undefined);
  }, [searchParams]);

  const overviewParams: {
    from?: string;
    to?: string;
    flaggedOnly?: boolean;
  } = {};
  if (from) overviewParams.from = from;
  if (to) overviewParams.to = to;
  if (flaggedOnly) overviewParams.flaggedOnly = true;

  const {
    data: overview,
    isLoading: overviewLoading,
    error: overviewError,
  } = useTeacherOverview(overviewParams);

  const { data: studentDetail, isLoading: studentLoading } = useStudentReport(selectedStudentId);
  const { refine, loading: refineLoading } = useRefineReport();

  const classSummary = overview?.classSummary;
  const students = useMemo(() => {
    const list = overview?.students ?? [];
    return flaggedOnly ? list.filter((s) => s.flagged) : list;
  }, [overview?.students, flaggedOnly]);

  function riskColor(level?: 'LOW' | 'MEDIUM' | 'HIGH') {
    if (level === 'HIGH') return 'bg-red-50 text-red-700 border-red-200';
    if (level === 'MEDIUM') return 'bg-yellow-50 text-yellow-800 border-yellow-200';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  }

  return (
    <div className="space-y-6 p-6">
      {/* 상단: 필터/요약 */}
      <Card>
        <CardHeader>
          <CardTitle>리포트 필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="date"
              value={from || ''}
              onChange={(e) => setFrom(e.target.value || undefined)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <span className="text-sm text-gray-500">~</span>
            <input
              type="date"
              value={to || ''}
              onChange={(e) => setTo(e.target.value || undefined)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={flaggedOnly}
                onChange={(e) => setFlaggedOnly(e.target.checked)}
              />
              주의 학생만 보기
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">평균 점수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overviewLoading ? '...' : (classSummary?.avgScore ?? 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">하위 10% 평균</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overviewLoading ? '...' : (classSummary?.bottom10pctAvg ?? 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">주의 학생 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overviewLoading ? '...' : (classSummary?.flaggedCount ?? 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Top 취약 개념</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-700">
              {overviewLoading ? '...' : classSummary?.topWeakConcepts?.join(', ') || '-'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 본문: 좌/우 패널 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* 좌: 학생 리스트 */}
        <Card className="md:col-span-5">
          <CardHeader>
            <CardTitle>학생 목록</CardTitle>
          </CardHeader>
          <CardContent>
            {overviewLoading ? (
              <div className="p-4 text-center text-sm text-gray-600">불러오는 중...</div>
            ) : overviewError ? (
              <div className="p-4 text-center text-sm text-red-600">
                개요 데이터를 불러올 수 없습니다.
              </div>
            ) : students.length === 0 ? (
              <div className="p-8 text-center">
                <BookOpen className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                <div className="text-sm text-gray-600">학생이 없습니다</div>
              </div>
            ) : (
              <ul className="divide-y">
                {students.map((s) => (
                  <li key={s.studentId} className="flex items-center justify-between py-3">
                    <button
                      className={`text-left text-sm ${
                        selectedStudentId === s.studentId
                          ? 'font-semibold text-blue-700'
                          : 'text-gray-800'
                      }`}
                      onClick={() => setSelectedStudentId(s.studentId)}
                    >
                      <div className="flex items-center gap-2">
                        <span>{s.name}</span>
                        {s.flagged && (
                          <span className="inline-flex items-center gap-1 rounded bg-red-50 px-2 py-0.5 text-xs text-red-700">
                            <AlertTriangle className="h-3 w-3" /> 주의
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-gray-500">
                        숙련 {s.mastery}% · Δ {s.scoreDelta}
                      </div>
                      {s.risk && (
                        <div
                          className={`mt-1 inline-flex items-center gap-2 rounded border px-2 py-1 text-xs ${riskColor(
                            s.risk.level,
                          )}`}
                          title={s.risk.reasons?.join(', ')}
                        >
                          위험 {s.risk.level} · 점수 {s.risk.score}
                        </div>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* 우: 학생 상세 */}
        <Card className="md:col-span-7">
          <CardHeader className="flex items-center justify-between md:flex-row">
            <CardTitle>
              {selectedStudentId ? `학생 상세 · ${selectedStudentId}` : '학생 상세'}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!selectedStudentId || refineLoading}
                onClick={async () => {
                  try {
                    await refine('rep_dummy', 'recommendations');
                  } catch {}
                }}
              >
                추천 보강
              </Button>
              <Button onClick={() => setGenerateOpen(true)}>생성</Button>
              <Button variant="outline" disabled={!selectedStudentId}>
                <Download className="mr-2 h-4 w-4" /> PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!selectedStudentId ? (
              <div className="p-6 text-center text-sm text-gray-600">
                좌측에서 학생을 선택하세요.
              </div>
            ) : studentLoading ? (
              <div className="p-6 text-center text-sm text-gray-600">불러오는 중...</div>
            ) : studentDetail ? (
              <div className="space-y-6">
                <div>
                  <h4 className="mb-2 text-sm font-semibold">요약</h4>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
                    {studentDetail.summaryInsights.map((it, idx) => (
                      <li key={idx}>{it}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-semibold">취약 개념</h4>
                  <div className="text-sm text-gray-700">
                    {studentDetail.weakConcepts.join(', ') || '-'}
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-semibold">추천</h4>
                  <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700">
                    {studentDetail.recommendations.map((it, idx) => (
                      <li key={idx}>{it}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-sm text-gray-600">데이터가 없습니다.</div>
            )}
          </CardContent>
        </Card>
      </div>
      <GenerateReportModal open={generateOpen} onOpenChange={setGenerateOpen} />
    </div>
  );
}
