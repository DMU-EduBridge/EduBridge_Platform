import { LearningMaterialEditClient } from '@/components/learning-materials/learning-material-edit-client';
import { authOptions } from '@/lib/core/auth';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

interface LearningMaterialEditPageProps {
  params: { id: string };
}

export default async function LearningMaterialEditPage({ params }: LearningMaterialEditPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  // 선생님 또는 관리자만 접근 가능
  if (!['TEACHER', 'ADMIN'].includes(session.user.role)) {
    redirect('/dashboard');
  }

  return <LearningMaterialEditClient materialId={params.id} />;
}
