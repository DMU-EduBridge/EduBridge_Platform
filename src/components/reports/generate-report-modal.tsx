'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useGenerateReport } from '@/hooks/reports/use-generate-report';
import { useEffect, useState } from 'react';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function GenerateReportModal({ open, onOpenChange }: Props) {
  const { running, progress, start, cancel, lastReportId } = useGenerateReport();
  const [useStream, setUseStream] = useState(true);
  const [regenerateOf, setRegenerateOf] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!open) return;
    // 초기화
  }, [open]);

  const handleStart = () => {
    start({ stream: useStream, depth: 'standard', regenerateOf: regenerateOf ?? '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>리포트 생성</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={useStream}
              onChange={(e) => setUseStream(e.target.checked)}
            />
            스트리밍 진행 표시(SSE)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={Boolean(regenerateOf)}
              onChange={(e) =>
                setRegenerateOf(e.target.checked ? (lastReportId ?? 'rep_dummy') : undefined)
              }
            />
            직전 리포트 재생성
          </label>
          <div className="rounded border p-3 text-sm">
            <div className="mb-2 text-gray-700">진행 상태</div>
            <Progress value={progress?.progress ?? (running ? 10 : 0)} />
            <div className="mt-2 text-xs text-gray-600">
              {progress?.type === 'error'
                ? `오류: ${progress?.message ?? ''}`
                : progress?.type === 'complete'
                  ? `완료 ${progress?.reportId ? `(id: ${progress.reportId})` : ''}`
                  : progress?.step
                    ? `${progress.step} 진행 중...`
                    : running
                      ? '시작 대기 중...'
                      : '대기 중'}
            </div>
          </div>
        </div>
        <DialogFooter>
          {!running ? (
            <Button onClick={handleStart}>생성 시작</Button>
          ) : (
            <Button variant="outline" onClick={cancel}>
              취소
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
