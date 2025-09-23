'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertCircle,
  Calendar,
  Download,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface SavedReport {
  id: string;
  title: string;
  type: 'full' | 'summary';
  period: string;
  status: string;
  createdAt: string;
}

interface ReportListResponse {
  success: boolean;
  reports: SavedReport[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

export function ReportManagementCard() {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'full' | 'summary'>('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchReports = useCallback(
    async (page = 1, type?: string) => {
      setIsLoading(true);
      setError('');

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: pagination.limit.toString(),
          ...(type && type !== 'all' && { reportType: type }),
        });

        const response = await fetch(`/api/ai/teacher-report/save?${params}`);
        const data: ReportListResponse = await response.json();

        if (data.success) {
          setReports(data.reports);
          setPagination(data.pagination);
        } else {
          setError(data.error || '리포트 조회 실패');
        }
      } catch (error) {
        setError('리포트 조회 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.limit],
  );

  const downloadReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/ai/teacher-report/save/${reportId}/download`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${reportId}.md`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('리포트 다운로드에 실패했습니다.');
      }
    } catch (error) {
      setError('리포트 다운로드 중 오류가 발생했습니다.');
    }
  };

  const deleteReport = async (reportId: string) => {
    if (!confirm('정말로 이 리포트를 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await fetch(`/api/ai/teacher-report/save/${reportId}/delete`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // 리포트 목록에서 제거
        setReports(reports.filter((report) => report.id !== reportId));
        alert('리포트가 삭제되었습니다.');
      } else {
        const errorData = await response.json();
        alert(errorData.error || '삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('삭제 오류:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.period.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || report.type === filterType;
    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    fetchReports(1, filterType);
  }, [fetchReports, filterType]);

  const getTypeBadge = (type: string) => {
    return type === 'full' ? (
      <Badge className="bg-blue-100 text-blue-800">상세 리포트</Badge>
    ) : (
      <Badge className="bg-green-100 text-green-800">요약 리포트</Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    return status === 'COMPLETED' ? (
      <Badge className="bg-green-100 text-green-800">완료</Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800">진행중</Badge>
    );
  };

  return (
    <Card className="w-full max-w-6xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          저장된 리포트 관리
        </CardTitle>
        <CardDescription>생성된 리포트를 저장하고 관리할 수 있습니다.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 검색 및 필터 */}
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Label htmlFor="search">검색</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="리포트 제목 또는 기간으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="filter">타입 필터</Label>
            <select
              id="filter"
              className="w-full rounded-md border p-2"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'full' | 'summary')}
            >
              <option value="all">전체</option>
              <option value="full">상세 리포트</option>
              <option value="summary">요약 리포트</option>
            </select>
          </div>
          <Button onClick={() => fetchReports(1, filterType)} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            새로고침
          </Button>
        </div>

        {/* 리포트 목록 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">리포트를 불러오는 중...</span>
          </div>
        ) : filteredReports.length > 0 ? (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div key={report.id} className="rounded-lg border p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{report.title}</h3>
                      {getTypeBadge(report.type)}
                      {getStatusBadge(report.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {report.period}
                      </div>
                      <div>생성일: {new Date(report.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => downloadReport(report.id)} variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => deleteReport(report.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p>저장된 리포트가 없습니다.</p>
            <p className="text-sm">새로운 리포트를 생성해보세요.</p>
          </div>
        )}

        {/* 페이지네이션 */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              총 {pagination.total}개의 리포트 중 {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)}개 표시
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => fetchReports(pagination.page - 1, filterType)}
                disabled={pagination.page === 1}
                variant="outline"
                size="sm"
              >
                이전
              </Button>
              <span className="px-3 py-1 text-sm">
                {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                onClick={() => fetchReports(pagination.page + 1, filterType)}
                disabled={pagination.page === pagination.totalPages}
                variant="outline"
                size="sm"
              >
                다음
              </Button>
            </div>
          </div>
        )}

        {/* 오류 메시지 */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
