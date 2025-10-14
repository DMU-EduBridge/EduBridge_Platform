'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useReports } from '@/hooks/reports';
import type { ReportType } from '@prisma/client';
import { useState } from 'react';
import { toast } from 'sonner';

interface ReportCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportCreateModal({ open, onOpenChange }: ReportCreateModalProps) {
  const [title, setTitle] = useState('');
  const [reportType, setReportType] = useState<ReportType>('CLASS_SUMMARY' as ReportType);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [studentIds, setStudentIds] = useState(''); // 쉼표로 구분된 ID
  const [subjectIds, setSubjectIds] = useState(''); // 쉼표로 구분된 ID

  const { create: createReportMutation } = useReports();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedStudentIds = studentIds
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
      const parsedSubjectIds = subjectIds
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);

      const payload: {
        title: string;
        type: string;
        period: string;
        studentIds?: string[];
        subjectIds?: string[];
      } = {
        title,
        type: String(reportType),
        period: `${startDate} - ${endDate}`,
      };

      if (parsedStudentIds.length > 0) {
        payload.studentIds = parsedStudentIds;
      }
      if (parsedSubjectIds.length > 0) {
        payload.subjectIds = parsedSubjectIds;
      }

      await createReportMutation.mutateAsync(payload);
      toast.success('리포트 생성 요청이 성공적으로 전송되었습니다.');
      onOpenChange(false);
      setTitle('');
      setReportType('INDIVIDUAL' as ReportType);
      setStartDate('');
      setEndDate('');
      setStudentIds('');
      setSubjectIds('');
    } catch (error: any) {
      toast.error('리포트 생성 실패', {
        description: error.message || '리포트 생성 중 오류가 발생했습니다.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>새 리포트 생성</DialogTitle>
          <DialogDescription>
            새로운 분석 리포트를 생성합니다. 필요한 정보를 입력해주세요.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              제목
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="reportType" className="text-right">
              리포트 유형
            </Label>
            <select
              id="reportType"
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="col-span-3 rounded-md border border-gray-300 px-3 py-2 text-sm"
              required
            >
              <option value="INDIVIDUAL">개별 리포트</option>
              <option value="MONTHLY">월간 리포트</option>
              <option value="WEEKLY">주간 리포트</option>
              <option value="SUBJECT">과목별 리포트</option>
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">
              시작일
            </Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">
              종료일
            </Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="studentIds" className="text-right">
              학생 ID (쉼표 구분)
            </Label>
            <Input
              id="studentIds"
              value={studentIds}
              onChange={(e) => setStudentIds(e.target.value)}
              className="col-span-3"
              placeholder="예: student1, student2"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subjectIds" className="text-right">
              과목 ID (쉼표 구분)
            </Label>
            <Input
              id="subjectIds"
              value={subjectIds}
              onChange={(e) => setSubjectIds(e.target.value)}
              className="col-span-3"
              placeholder="예: MATH, ENGLISH"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createReportMutation.isPending}>
              {createReportMutation.isPending ? '생성 중...' : '리포트 생성'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
