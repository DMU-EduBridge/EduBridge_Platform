'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useStudentsList } from '@/hooks/students/use-students-list';
import { CreateTeacherReportRequest, TeacherReport } from '@/types/domain/teacher-report';
import { ReportType } from '@prisma/client';
import { Check, Loader2, Search, Users } from 'lucide-react';
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
    studentIds: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [studentSearch, setStudentSearch] = useState('');
  const [showStudentSelector, setShowStudentSelector] = useState(false);

  // 학생 목록 조회
  const { data: studentsResponse, isLoading: studentsLoading } = useStudentsList({
    ...(studentSearch && { search: studentSearch }),
    limit: 50,
  });

  const students = studentsResponse?.students || [];

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

  const handleChange = (field: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const toggleStudent = (studentId: string) => {
    setFormData((prev) => ({
      ...prev,
      studentIds: prev.studentIds.includes(studentId)
        ? prev.studentIds.filter((id) => id !== studentId)
        : [...prev.studentIds, studentId],
    }));
  };

  const getSelectedStudents = () => {
    return students.filter((student: any) => formData.studentIds.includes(student.id));
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

  const getReportScopeDescription = () => {
    if (formData.studentIds.length > 0) {
      return `선택된 ${formData.studentIds.length}명의 학생에 대한 개별 리포트`;
    }
    if (formData.classId) {
      const selectedClass = availableClasses.find((cls) => cls.id === formData.classId);
      return selectedClass
        ? `${selectedClass.name} 클래스 전체 리포트`
        : '선택된 클래스 전체 리포트';
    }
    return '모든 학생에 대한 전체 리포트';
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          {initialData ? '리포트 수정' : '새 리포트 생성'}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {initialData ? '리포트 정보를 수정하세요' : 'AI 기반 학습 분석 리포트를 생성하세요'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="space-y-4">
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
              <p className="text-sm text-gray-600">
                {getReportTypeDescription(formData.reportType)}
              </p>
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
          </div>
        </div>

        {/* 학생 선택 섹션 */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">학생 선택 (선택사항)</Label>
                <p className="text-sm text-gray-600">
                  특정 학생들만 선택하여 개별 리포트를 생성할 수 있습니다
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowStudentSelector(!showStudentSelector)}
              >
                <Users className="mr-1 h-4 w-4" />
                {showStudentSelector ? '숨기기' : '학생 선택'}
              </Button>
            </div>

            {formData.studentIds.length > 0 && (
              <div className="rounded-lg bg-blue-50 p-3">
                <div className="text-sm font-medium text-blue-900">
                  선택된 학생 ({formData.studentIds.length}명)
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {getSelectedStudents().map((student: any) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
                    >
                      {student.name}
                      <button
                        type="button"
                        onClick={() => toggleStudent(student.id)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showStudentSelector && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="학생 이름으로 검색..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {studentsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="ml-2 text-sm text-gray-600">학생 목록을 불러오는 중...</span>
                  </div>
                ) : (
                  <div className="max-h-60 space-y-1 overflow-y-auto">
                    {students.map((student: any) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between rounded-lg border p-2 hover:bg-gray-50"
                      >
                        <div>
                          <div className="font-medium text-gray-900">{student.name}</div>
                          <div className="text-xs text-gray-500">
                            {student.email} • {student.gradeLevel}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleStudent(student.id)}
                          className={`rounded-full p-1 ${
                            formData.studentIds.includes(student.id)
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 text-gray-400 hover:border-blue-500'
                          }`}
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="rounded-lg bg-gray-50 p-3">
              <div className="text-sm font-medium text-gray-900">리포트 범위</div>
              <div className="mt-1 text-sm text-gray-600">{getReportScopeDescription()}</div>
            </div>
          </div>
        </div>

        {/* 분석 옵션 */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="space-y-4">
            <Label className="text-base font-medium">분석 옵션</Label>
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
        </div>

        {/* 커스텀 프롬프트 */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
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
        </div>

        {/* 제출 버튼 */}
        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? '수정하기' : '리포트 생성'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            취소
          </Button>
        </div>
      </form>
    </div>
  );
}
