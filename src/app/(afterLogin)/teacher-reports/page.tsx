import { ReportManagementCard } from '@/components/ai/report-management-card';
import { TeacherReportCard } from '@/components/ai/teacher-report-card';
import { authOptions } from '@/lib/core/auth';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'AI 교사 리포트 - EduBridge',
  description: 'AI가 자동으로 생성하는 교사 리포트 관리',
  robots: 'noindex, nofollow',
};

export default async function TeacherReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // 교사와 관리자만 접근 가능
  if (!['TEACHER', 'ADMIN'].includes(session.user.role)) {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI 교사 리포트</h1>
        <p className="mt-2 text-gray-600">
          학생 성적 데이터를 분석하여 AI가 자동으로 교사 리포트를 생성합니다.
        </p>
      </div>

      {/* 리포트 생성 */}
      <TeacherReportCard />

      {/* 리포트 관리 */}
      <ReportManagementCard />
    </div>
  );
}
