import { authOptions } from '@/lib/core/auth';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { MessagesDetailClient } from './messages-detail-client';

export const metadata: Metadata = {
  title: '메시지 - EduBridge',
  description: '나의 메시지를 확인하고 관리하세요',
  robots: 'noindex, nofollow',
};

// 서버에서 메시지 데이터를 가져오는 함수
async function getMessagesData() {
  try {
    return {
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
          subject: '수학 문제 질문',
          category: '학습 질문',
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
          subject: '모의고사 점수 제출',
          category: '과제',
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
          subject: '오답노트 수정',
          category: '과제',
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
          subject: '모의고사 점수 등록',
          category: '일반',
        },
        {
          id: '5',
          sender: '박학생',
          senderId: 'student_park',
          message: '내일 스터디 그룹 모임 시간 변경됐어!',
          hasNotification: true,
          notificationCount: 2,
          isRead: false,
          messageType: 'general' as const,
          createdAt: '2024-01-20T10:30:00Z',
          subject: '스터디 그룹 모임',
          category: '일반',
        },
        {
          id: '6',
          sender: '과학 이선생님',
          senderId: 'teacher_science_lee',
          message: '실험 보고서 제출 기한이 연장되었습니다.',
          hasNotification: false,
          isRead: true,
          messageType: 'reminder' as const,
          createdAt: '2024-01-20T09:15:00Z',
          subject: '실험 보고서 제출',
          category: '과제',
        },
      ],
      categories: ['학습 질문', '과제', '일반', '공지사항'],
      stats: {
        total: 6,
        unread: 2,
        read: 4,
        fromTeachers: 3,
        fromStudents: 3,
      },
    };
  } catch (error) {
    console.error('메시지 데이터 로드 실패:', error);
    return null;
  }
}

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const messagesData = await getMessagesData();

  return <MessagesDetailClient session={session} initialData={messagesData} />;
}
