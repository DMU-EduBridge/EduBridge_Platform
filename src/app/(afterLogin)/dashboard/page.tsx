import { authOptions } from '@/lib/core/auth';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { DashboardClient } from './dashboard-client';

export const metadata: Metadata = {
  title: '대시보드 - EduBridge',
  description: '학습 현황과 활동을 한눈에 확인할 수 있는 대시보드',
  robots: 'noindex, nofollow', // 로그인 필요 페이지
};

// 서버에서 대시보드 데이터를 가져오는 함수
async function getDashboardData() {
  try {
    // 실제 데이터베이스에서 가져올 데이터 (현재는 시뮬레이션)
    return {
      learningProgress: [
        {
          id: '1',
          subject: '한국의 역사',
          grade: '중학교 3학년',
          gradeColor: 'green' as const,
          currentUnit: '한국 전쟁의 시작',
          progress: 50,
          totalProblems: 100,
          completedProblems: 50,
          lastStudiedAt: '2024-01-20T10:30:00Z',
        },
        {
          id: '2',
          subject: '알쏭달쏭 수학',
          grade: '중학교 3학년',
          gradeColor: 'green' as const,
          currentUnit: '일차방정식',
          progress: 75,
          totalProblems: 80,
          completedProblems: 60,
          lastStudiedAt: '2024-01-20T14:15:00Z',
        },
        {
          id: '3',
          subject: '고등 영어',
          grade: '고등학교 1학년',
          gradeColor: 'red' as const,
          currentUnit: 'Hello, everyone',
          progress: 30,
          totalProblems: 120,
          completedProblems: 36,
          lastStudiedAt: '2024-01-19T16:45:00Z',
        },
      ],
      todos: [
        {
          id: '1',
          text: '모의고사 오답 확인하기',
          completed: true,
          priority: 'high' as const,
          dueDate: '2024-01-21',
          createdAt: '2024-01-20T09:00:00Z',
          updatedAt: '2024-01-20T15:30:00Z',
        },
        {
          id: '2',
          text: '모의고사 점수 알려드리기',
          completed: true,
          priority: 'high' as const,
          dueDate: '2024-01-21',
          createdAt: '2024-01-20T09:00:00Z',
          updatedAt: '2024-01-20T16:00:00Z',
        },
        {
          id: '3',
          text: '한국의 역사 오답노트 문제 풀기',
          completed: false,
          priority: 'medium' as const,
          dueDate: '2024-01-22',
          createdAt: '2024-01-20T10:00:00Z',
          updatedAt: '2024-01-20T10:00:00Z',
        },
        {
          id: '4',
          text: '고등 영어 예습하기',
          completed: false,
          priority: 'low' as const,
          dueDate: '2024-01-23',
          createdAt: '2024-01-20T11:00:00Z',
          updatedAt: '2024-01-20T11:00:00Z',
        },
      ],
      messages: [
        {
          id: '1',
          sender: '김학생',
          senderId: 'student_kim',
          message: '너 이거 다 풀었어?? 나 좀 알려주라 ㅜㅜ',
          hasNotification: true,
          notificationCount: 1,
          isRead: false,
          messageType: 'question' as const,
          createdAt: '2024-01-20T14:30:00Z',
        },
        {
          id: '2',
          sender: '수학 김땡땡 선생님',
          senderId: 'teacher_math_kim',
          message: '오늘 모의고사 점수 알려주세요~~',
          hasNotification: false,
          isRead: true,
          messageType: 'reminder' as const,
          createdAt: '2024-01-20T13:15:00Z',
        },
        {
          id: '3',
          sender: '영어 리아나 선생님',
          senderId: 'teacher_english_riana',
          message: '오답노트 고쳐주세요 !!!',
          hasNotification: false,
          isRead: true,
          messageType: 'reminder' as const,
          createdAt: '2024-01-20T12:00:00Z',
        },
        {
          id: '4',
          sender: '신학생',
          senderId: 'student_new',
          message: '나 오늘 모의고사 점수 등록해야 하는데 하기 싫어 ㅜㅜ',
          hasNotification: false,
          isRead: true,
          messageType: 'general' as const,
          createdAt: '2024-01-20T11:45:00Z',
        },
      ],
      aiChatExamples: [
        {
          id: '1',
          prompt: '교과서 영어 문제를 해석해줘',
          response: 'Hello, my name is lily',
          date: '9월 20일',
          messageType: 'translation' as const,
          subject: '영어',
        },
        {
          id: '2',
          prompt: '확률과 통계 기출 문제 풀이 좀 해줄래?',
          response: '확률과 통계 순열 부분 문제의 답을 알려줘.',
          date: '9월 26일',
          messageType: 'explanation' as const,
          subject: '수학',
        },
      ],
      incorrectAnswerNotes: [
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
        },
      ],
      summary: {
        totalSubjects: 3,
        totalTodos: 4,
        completedTodos: 2,
        unreadMessages: 1,
        totalIncorrectProblems: 31,
        completedIncorrectProblems: 21,
      },
    };
  } catch (error) {
    console.error('대시보드 데이터 로드 실패:', error);
    return null;
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const dashboardData = await getDashboardData();

  return <DashboardClient session={session} initialData={dashboardData} />;
}
