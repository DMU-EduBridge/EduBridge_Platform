import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

interface DashboardOverview {
  learningProgress: {
    id: string;
    subject: string;
    grade: string;
    gradeColor: 'green' | 'red';
    currentUnit: string;
    progress: number;
    totalProblems: number;
    completedProblems: number;
    lastStudiedAt: string;
  }[];
  todos: {
    id: string;
    text: string;
    completed: boolean;
    priority: 'high' | 'medium' | 'low';
    dueDate?: string;
    createdAt: string;
    updatedAt: string;
  }[];
  messages: {
    id: string;
    sender: string;
    senderId: string;
    message: string;
    hasNotification: boolean;
    notificationCount?: number;
    isRead: boolean;
    messageType: 'question' | 'announcement' | 'reminder' | 'general';
    createdAt: string;
  }[];
  aiChatExamples: {
    id: string;
    prompt: string;
    response: string;
    date: string;
    messageType: 'question' | 'translation' | 'explanation' | 'general';
    subject?: string;
  }[];
  incorrectAnswerNotes: {
    id: string;
    subject: string;
    grade: string;
    gradeColor: 'green' | 'red';
    status: string;
    statusColor: 'red' | 'yellow' | 'green';
    incorrectCount: number;
    retryCount: number;
    completedCount: number;
    totalProblems: number;
    lastUpdated: string;
  }[];
  summary: {
    totalSubjects: number;
    totalTodos: number;
    completedTodos: number;
    unreadMessages: number;
    totalIncorrectProblems: number;
    completedIncorrectProblems: number;
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    // 실제 데이터베이스에서 가져올 통합 데이터 (현재는 시뮬레이션)
    const dashboardOverview: DashboardOverview = {
      learningProgress: [
        {
          id: '1',
          subject: '한국의 역사',
          grade: '중학교 3학년',
          gradeColor: 'green',
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
          gradeColor: 'green',
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
          gradeColor: 'red',
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
          priority: 'high',
          dueDate: '2024-01-21',
          createdAt: '2024-01-20T09:00:00Z',
          updatedAt: '2024-01-20T15:30:00Z',
        },
        {
          id: '2',
          text: '모의고사 점수 알려드리기',
          completed: true,
          priority: 'high',
          dueDate: '2024-01-21',
          createdAt: '2024-01-20T09:00:00Z',
          updatedAt: '2024-01-20T16:00:00Z',
        },
        {
          id: '3',
          text: '한국의 역사 오답노트 문제 풀기',
          completed: false,
          priority: 'medium',
          dueDate: '2024-01-22',
          createdAt: '2024-01-20T10:00:00Z',
          updatedAt: '2024-01-20T10:00:00Z',
        },
        {
          id: '4',
          text: '고등 영어 예습하기',
          completed: false,
          priority: 'low',
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
          messageType: 'question',
          createdAt: '2024-01-20T14:30:00Z',
        },
        {
          id: '2',
          sender: '수학 김땡땡 선생님',
          senderId: 'teacher_math_kim',
          message: '오늘 모의고사 점수 알려주세요~~',
          hasNotification: false,
          isRead: true,
          messageType: 'reminder',
          createdAt: '2024-01-20T13:15:00Z',
        },
        {
          id: '3',
          sender: '영어 리아나 선생님',
          senderId: 'teacher_english_riana',
          message: '오답노트 고쳐주세요 !!!',
          hasNotification: false,
          isRead: true,
          messageType: 'reminder',
          createdAt: '2024-01-20T12:00:00Z',
        },
        {
          id: '4',
          sender: '신학생',
          senderId: 'student_new',
          message: '나 오늘 모의고사 점수 등록해야 하는데 하기 싫어 ㅜㅜ',
          hasNotification: false,
          isRead: true,
          messageType: 'general',
          createdAt: '2024-01-20T11:45:00Z',
        },
      ],
      aiChatExamples: [
        {
          id: '1',
          prompt: '교과서 영어 문제를 해석해줘',
          response: 'Hello, my name is lily',
          date: '9월 20일',
          messageType: 'translation',
          subject: '영어',
        },
        {
          id: '2',
          prompt: '확률과 통계 기출 문제 풀이 좀 해줄래?',
          response: '확률과 통계 순열 부분 문제의 답을 알려줘.',
          date: '9월 26일',
          messageType: 'explanation',
          subject: '수학',
        },
      ],
      incorrectAnswerNotes: [
        {
          id: '1',
          subject: '한국의 역사',
          grade: '중학교 3학년',
          gradeColor: 'green',
          status: '노력 필요',
          statusColor: 'red',
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
          gradeColor: 'green',
          status: '보통 수준',
          statusColor: 'yellow',
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
          gradeColor: 'red',
          status: '완벽함',
          statusColor: 'green',
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

    logger.info('대시보드 개요 조회 성공', {
      userId: session.user.id,
      summary: dashboardOverview.summary,
    });

    return NextResponse.json({
      success: true,
      data: dashboardOverview,
    });
  } catch (error) {
    logger.error('대시보드 개요 조회 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '대시보드 개요 조회에 실패했습니다.' }, { status: 500 });
  }
}
