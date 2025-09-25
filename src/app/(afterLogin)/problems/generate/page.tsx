import { ProblemGenerationForm } from '@/components/problems';
import { authOptions } from '@/lib/core/auth';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'AI 문제 생성 - EduBridge',
  description: 'AI를 활용하여 학습 문제를 자동으로 생성할 수 있는 페이지',
  robots: 'noindex, nofollow', // 로그인 필요 페이지
};

export default async function ProblemGenerationPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // 학생은 문제 생성 페이지에 접근할 수 없음
  if (session.user.role === 'STUDENT') {
    redirect('/my/learning');
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI 문제 생성</h1>
        <p className="mt-2 text-gray-600">
          AI를 활용하여 과목, 난이도, 단원을 선택하여 학습 문제를 자동으로 생성할 수 있습니다.
        </p>
      </div>

      <ProblemGenerationForm
        onGenerate={async (request) => {
          // 실제 API 호출로 대체
          const response = await fetch('/api/problems/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
          });

          if (!response.ok) {
            throw new Error('문제 생성에 실패했습니다.');
          }

          return response.json();
        }}
        onSaveProblems={async (problems) => {
          // 실제 API 호출로 대체
          const response = await fetch('/api/problems/batch', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(problems),
          });

          if (!response.ok) {
            throw new Error('문제 저장에 실패했습니다.');
          }

          return response.json();
        }}
      />
    </div>
  );
}
