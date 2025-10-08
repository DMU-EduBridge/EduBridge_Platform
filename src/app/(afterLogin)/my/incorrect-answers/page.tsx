import { authOptions } from '@/lib/core/auth';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { IncorrectAnswersDetailClient } from './incorrect-answers-detail-client';

export const metadata: Metadata = {
  title: '오답 노트 - EduBridge',
  description: '틀린 문제들을 다시 풀어보고 복습하세요',
  robots: 'noindex, nofollow',
};

// 서버에서 오답 노트 데이터를 가져오는 함수
async function getIncorrectAnswersData() {
  try {
    return {
      incorrectAnswers: [
        {
          id: '1',
          subject: '한국의 역사',
          grade: '중학교 3학년',
          gradeColor: 'green' as const,
          status: '노력 필요',
          statusColor: 'red' as const,
          incorrectCount: 10,
          retryCount: 5,
          completedCount: 5,
          totalProblems: 100,
          lastUpdated: '2024-01-20T16:30:00Z',
          problems: [
            {
              id: 'p1',
              question: '한국 전쟁이 일어난 연도는?',
              myAnswer: '1951년',
              correctAnswer: '1950년',
              explanation: '한국 전쟁은 1950년 6월 25일에 시작되었습니다.',
              difficulty: 'medium',
              topic: '한국 전쟁',
              attempts: 3,
              lastAttempt: '2024-01-20T14:30:00Z',
            },
            {
              id: 'p2',
              question: '조선왕조의 건국자는?',
              myAnswer: '이성계',
              correctAnswer: '이성계 (태조)',
              explanation: '이성계가 조선을 건국하고 태조로 즉위했습니다.',
              difficulty: 'easy',
              topic: '조선 건국',
              attempts: 2,
              lastAttempt: '2024-01-20T13:15:00Z',
            },
          ],
        },
        {
          id: '2',
          subject: '알쏭달쏭 수학',
          grade: '중학교 3학년',
          gradeColor: 'green' as const,
          status: '보통 수준',
          statusColor: 'yellow' as const,
          incorrectCount: 20,
          retryCount: 5,
          completedCount: 15,
          totalProblems: 80,
          lastUpdated: '2024-01-20T15:45:00Z',
          problems: [
            {
              id: 'p3',
              question: 'x² - 5x + 6 = 0의 해를 구하시오.',
              myAnswer: 'x = 2, 3',
              correctAnswer: 'x = 2, 3',
              explanation: '인수분해하면 (x-2)(x-3) = 0이므로 x = 2 또는 x = 3입니다.',
              difficulty: 'medium',
              topic: '이차방정식',
              attempts: 1,
              lastAttempt: '2024-01-20T12:00:00Z',
            },
          ],
        },
        {
          id: '3',
          subject: '확률과 통계',
          grade: '고등학교 1학년',
          gradeColor: 'red' as const,
          status: '완벽함',
          statusColor: 'green' as const,
          incorrectCount: 1,
          retryCount: 0,
          completedCount: 1,
          totalProblems: 120,
          lastUpdated: '2024-01-19T14:20:00Z',
          problems: [
            {
              id: 'p4',
              question: '주사위 2개를 던질 때 합이 7이 나올 확률은?',
              myAnswer: '1/6',
              correctAnswer: '1/6',
              explanation:
                '주사위 2개의 합이 7이 되는 경우는 (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) 총 6가지이고, 전체 경우의 수는 36가지이므로 6/36 = 1/6입니다.',
              difficulty: 'easy',
              topic: '확률',
              attempts: 1,
              lastAttempt: '2024-01-19T14:20:00Z',
            },
          ],
        },
      ],
      subjects: ['한국의 역사', '알쏭달쏭 수학', '확률과 통계', '고등 영어', '화학', '물리'],
      stats: {
        totalIncorrect: 31,
        totalRetry: 10,
        totalCompleted: 21,
        averageAttempts: 2.1,
        mostDifficultSubject: '한국의 역사',
      },
    };
  } catch (error) {
    console.error('오답 노트 데이터 로드 실패:', error);
    return null;
  }
}

export default async function IncorrectAnswersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const incorrectAnswersData = await getIncorrectAnswersData();

  return <IncorrectAnswersDetailClient session={session} initialData={incorrectAnswersData} />;
}
