'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import Link from 'next/link';

type ReportHeaderProps = {
  backHref: string;
  title: string;
  status?: string;
  period?: string;
  onDownload?: () => void;
  downloading?: boolean;
};

const statusColors: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  PENDING: 'bg-gray-100 text-gray-800',
};

export function ReportHeader({
  backHref,
  title,
  status,
  onDownload,
  downloading,
}: ReportHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link href={backHref} className="text-sm text-gray-600 hover:underline">
          ← 목록으로
        </Link>
        <h1 className="text-2xl font-bold">{title}</h1>
        {status && <Badge className={statusColors[status] || ''}>{status}</Badge>}
      </div>
      <div className="flex gap-2">
        {onDownload && (
          <Button variant="outline" onClick={onDownload} disabled={!!downloading}>
            <Download className="mr-2 h-4 w-4" /> {downloading ? 'PDF 생성 중...' : 'PDF 다운로드'}
          </Button>
        )}
      </div>
    </div>
  );
}

export default ReportHeader;
