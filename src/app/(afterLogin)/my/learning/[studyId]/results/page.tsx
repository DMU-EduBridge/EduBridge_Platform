import { authOptions } from '@/lib/core/auth';
import { materialService } from '@/server/services/material.service';
import { problemService } from '@/server/services/problem/problem-crud.service';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import ResultsClient from './results-client';

interface ResultsPageProps {
  params: {
    studyId: string;
  };
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  // 학생만 접근 가능
  if (session.user.role !== 'STUDENT') {
    redirect('/dashboard');
  }

  try {
    // studyId 디코딩
    const studyId = decodeURIComponent(params.studyId);

    // 해당 학습 자료의 모든 문제 목록 가져오기
    const allProblems = await problemService.getProblemsByStudyId(studyId, {
      page: 1,
      limit: 100,
    });

    // 학습 자료 정보 가져오기 (제목 등)
    const learningMaterial = await materialService.getMaterialById(studyId);

    return (
      <ResultsClient
        studyId={studyId}
        problems={allProblems}
        learningMaterial={learningMaterial}
        userId={session.user.id}
      />
    );
  } catch (error) {
    console.error('결과 페이지 로드 실패:', error);
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">결과를 불러올 수 없습니다</h1>
          <p className="mt-2 text-gray-600">잠시 후 다시 시도해주세요.</p>
        </div>
      </div>
    );
  }
}
