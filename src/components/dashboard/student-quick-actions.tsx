import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const StudentQuickActions = () => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">빠른 실행</h3>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/problems">
          <Button>문제 풀기</Button>
        </Link>
        <Link href="/reports">
          <Button variant="secondary">내 리포트 보기</Button>
        </Link>
        <Link href="/profile">
          <Button variant="outline">프로필 관리</Button>
        </Link>
      </div>
    </div>
  );
};
