'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TeacherReport } from '@/types/domain/teacher-report';
import {
  Calendar,
  Clock,
  DollarSign,
  Edit,
  FileText,
  MoreHorizontal,
  Play,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface ReportCardProps {
  report: TeacherReport;
  onEdit?: (report: TeacherReport) => void;
  onDelete?: (reportId: string) => void;
  onGenerate?: (reportId: string) => void;
}

export function ReportCard({ report, onEdit, onDelete, onGenerate }: ReportCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'GENERATING':
        return 'bg-blue-100 text-blue-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return '완료';
      case 'GENERATING':
        return '생성 중';
      case 'DRAFT':
        return '초안';
      case 'FAILED':
        return '실패';
      default:
        return status;
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'PROGRESS_REPORT':
        return '진도 리포트';
      case 'PERFORMANCE_ANALYSIS':
        return '성과 분석';
      case 'CLASS_SUMMARY':
        return '클래스 요약';
      case 'STUDENT_INSIGHTS':
        return '학생 인사이트';
      default:
        return type;
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    if (confirm('정말로 이 리포트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      setIsDeleting(true);
      try {
        await onDelete(report.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleGenerate = async () => {
    if (!onGenerate) return;
    await onGenerate(report.id);
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{report.title}</CardTitle>
            <CardDescription className="mt-1">
              {getReportTypeLabel(report.reportType)}
              {report.class && ` • ${report.class.name}`}
            </CardDescription>
            {report.content && (
              <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                {report.content.substring(0, 100)}...
              </p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(report)}>
                <Edit className="mr-2 h-4 w-4" />
                수정
              </DropdownMenuItem>
              {report.status === 'DRAFT' && (
                <DropdownMenuItem onClick={handleGenerate}>
                  <Play className="mr-2 h-4 w-4" />
                  생성
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 상태 및 메타데이터 */}
        <div className="flex items-center justify-between">
          <Badge className={getStatusColor(report.status)}>{getStatusLabel(report.status)}</Badge>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            {new Date(report.createdAt).toLocaleDateString()}
          </div>
        </div>

        {/* 통계 정보 */}
        {report.status === 'COMPLETED' && (
          <div className="grid grid-cols-3 gap-4">
            {report.generationTimeMs && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium">
                    {Math.round(report.generationTimeMs / 1000)}초
                  </div>
                  <div className="text-xs text-gray-500">생성 시간</div>
                </div>
              </div>
            )}
            {report.tokenUsage && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium">{report.tokenUsage.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">토큰</div>
                </div>
              </div>
            )}
            {report.costUsd && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-sm font-medium">${report.costUsd.toFixed(4)}</div>
                  <div className="text-xs text-gray-500">비용</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-2 pt-2">
          <Link href={`/teacher-reports/${report.id}`} className="flex-1">
            <Button variant="default" size="sm" className="w-full">
              리포트 보기
            </Button>
          </Link>
          {report.status === 'DRAFT' && (
            <Button variant="outline" size="sm" onClick={handleGenerate}>
              <Play className="mr-1 h-3 w-3" />
              생성
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
