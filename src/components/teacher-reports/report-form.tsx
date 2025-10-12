'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CreateTeacherReportRequest, TeacherReport } from '@/types/domain/teacher-report';
import { ReportType } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ReportFormProps {
  initialData?: TeacherReport;
  onSubmit: (data: CreateTeacherReportRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  availableClasses?: Array<{ id: string; name: string; subject: string; gradeLevel: string }>;
}

export function ReportForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  availableClasses = [],
}: ReportFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    reportType: initialData?.reportType || ReportType.PROGRESS_REPORT,
    classId: initialData?.classId || '',
    includeCharts: true,
    includeRecommendations: true,
    customPrompt: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '리포트 제목을 입력해주세요';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const getReportTypeDescription = (type: ReportType) => {
    switch (type) {
      case ReportType.PROGRESS_REPORT:
        return '학생들의 학습 진도와 성과를 분석한 리포트';
      case ReportType.PERFORMANCE_ANALYSIS:
        return '학생들의 성과를 상세히 분석한 리포트';
      case ReportType.CLASS_SUMMARY:
        return '클래스 전체의 학습 현황을 요약한 리포트';
      case ReportType.STUDENT_INSIGHTS:
        return '개별 학생들의 학습 패턴과 인사이트를 제공하는 리포트';
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? '리포트 수정' : '새 리포트 생성'}</CardTitle>
        <CardDescription>
          {initialData ? '리포트 정보를 수정하세요' : 'AI 기반 학습 분석 리포트를 생성하세요'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">리포트 제목 *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="예: 중1 수학 A반 1학기 중간 진도 리포트"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reportType">리포트 유형 *</Label>
            <select
              id="reportType"
              value={formData.reportType}
              onChange={(e) => handleChange('reportType', e.target.value as ReportType)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value={ReportType.PROGRESS_REPORT}>진도 리포트</option>
              <option value={ReportType.PERFORMANCE_ANALYSIS}>성과 분석</option>
              <option value={ReportType.CLASS_SUMMARY}>클래스 요약</option>
              <option value={ReportType.STUDENT_INSIGHTS}>학생 인사이트</option>
            </select>
            <p className="text-sm text-gray-600">{getReportTypeDescription(formData.reportType)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="classId">대상 클래스</Label>
            <select
              id="classId"
              value={formData.classId}
              onChange={(e) => handleChange('classId', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">전체 클래스</option>
              {availableClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.subject} • {cls.gradeLevel})
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-600">
              특정 클래스를 선택하면 해당 클래스의 학생들만 분석됩니다
            </p>
          </div>

          <div className="space-y-4">
            <Label>분석 옵션</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeCharts"
                  checked={formData.includeCharts}
                  onChange={(e) => handleChange('includeCharts', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="includeCharts" className="text-sm">
                  차트 및 그래프 포함
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeRecommendations"
                  checked={formData.includeRecommendations}
                  onChange={(e) => handleChange('includeRecommendations', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="includeRecommendations" className="text-sm">
                  개선 권장사항 포함
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customPrompt">커스텀 프롬프트 (선택사항)</Label>
            <Textarea
              id="customPrompt"
              value={formData.customPrompt}
              onChange={(e) => handleChange('customPrompt', e.target.value)}
              placeholder="특별히 분석하고 싶은 내용이나 관점을 입력하세요..."
              rows={3}
            />
            <p className="text-sm text-gray-600">
              AI가 특정 관점에서 분석하도록 지시할 수 있습니다
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? '수정하기' : '리포트 생성'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              취소
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
