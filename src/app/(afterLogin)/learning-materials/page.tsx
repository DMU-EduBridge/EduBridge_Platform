import { LearningMaterialsList } from '@/components/learning-materials';
import { Button } from '@/components/ui/button';
import { authOptions } from '@/lib/core/auth';
import { Plus } from 'lucide-react';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: '학습자료 관리 - EduBridge',
  description: '교육 자료를 생성하고 관리할 수 있는 학습자료 관리 페이지',
  robots: 'noindex, nofollow', // 로그인 필요 페이지
};

export default async function LearningMaterialsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  if (session.user.role === 'STUDENT') {
    redirect('/problems');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">학습 자료 관리</h1>
          <p className="mt-2 text-gray-600">학생들을 위한 학습 자료를 생성하고 관리하세요.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />새 자료 생성
        </Button>
      </div>

      <LearningMaterialsList />
    </div>
  );
}
