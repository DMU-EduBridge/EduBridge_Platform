import { authOptions } from '@/lib/core/auth';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { TodoListDetailClient } from './todo-list-detail-client';

export const metadata: Metadata = {
  title: '할 일 목록 - EduBridge',
  description: '나의 할 일 목록을 관리하고 확인하세요',
  robots: 'noindex, nofollow',
};

// 서버에서 할 일 데이터를 가져오는 함수
async function getTodoData() {
  try {
    return {
      todos: [
        {
          id: '1',
          text: '모의고사 오답 확인하기',
          completed: true,
          priority: 'high' as const,
          dueDate: '2024-01-21',
          createdAt: '2024-01-20T09:00:00Z',
          updatedAt: '2024-01-20T15:30:00Z',
          category: '시험 준비',
          description: '수학 모의고사에서 틀린 문제들을 다시 풀어보고 오답 노트에 정리하기',
        },
        {
          id: '2',
          text: '모의고사 점수 알려드리기',
          completed: true,
          priority: 'high' as const,
          dueDate: '2024-01-21',
          createdAt: '2024-01-20T09:00:00Z',
          updatedAt: '2024-01-20T16:00:00Z',
          category: '시험 준비',
          description: '선생님께 모의고사 점수를 보고하고 피드백 받기',
        },
        {
          id: '3',
          text: '한국의 역사 오답노트 문제 풀기',
          completed: false,
          priority: 'medium' as const,
          dueDate: '2024-01-22',
          createdAt: '2024-01-20T10:00:00Z',
          updatedAt: '2024-01-20T10:00:00Z',
          category: '복습',
          description: '한국 전쟁 관련 문제들을 다시 풀어보고 개념 정리하기',
        },
        {
          id: '4',
          text: '고등 영어 예습하기',
          completed: false,
          priority: 'low' as const,
          dueDate: '2024-01-23',
          createdAt: '2024-01-20T11:00:00Z',
          updatedAt: '2024-01-20T11:00:00Z',
          category: '예습',
          description: '다음 단원의 단어와 문법을 미리 학습하기',
        },
        {
          id: '5',
          text: '수학 문제집 3단원 풀기',
          completed: false,
          priority: 'medium' as const,
          dueDate: '2024-01-24',
          createdAt: '2024-01-20T12:00:00Z',
          updatedAt: '2024-01-20T12:00:00Z',
          category: '과제',
          description: '이차방정식 관련 문제들을 풀고 정답 확인하기',
        },
        {
          id: '6',
          text: '과학 실험 보고서 작성',
          completed: false,
          priority: 'high' as const,
          dueDate: '2024-01-25',
          createdAt: '2024-01-20T13:00:00Z',
          updatedAt: '2024-01-20T13:00:00Z',
          category: '과제',
          description: '화학 반응 실험 결과를 정리하고 보고서 작성하기',
        },
      ],
      categories: ['시험 준비', '복습', '예습', '과제', '기타'],
      stats: {
        total: 6,
        completed: 2,
        pending: 4,
        overdue: 0,
      },
    };
  } catch (error) {
    console.error('할 일 데이터 로드 실패:', error);
    return null;
  }
}

export default async function TodoListPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const todoData = await getTodoData();

  return <TodoListDetailClient session={session} initialData={todoData} />;
}
