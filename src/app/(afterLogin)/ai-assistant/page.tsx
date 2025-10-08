import { authOptions } from '@/lib/core/auth';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { AIAssistantDetailClient } from './ai-assistant-detail-client';

export const metadata: Metadata = {
  title: 'AI 어시스턴트 - EduBridge',
  description: 'AI와 대화하며 학습을 도와받으세요',
  robots: 'noindex, nofollow',
};

// 서버에서 AI 대화 데이터를 가져오는 함수
async function getAIAssistantData() {
  try {
    return {
      chatHistory: [
        {
          id: '1',
          prompt: '교과서 영어 문제를 해석해줘',
          response:
            'Hello, my name is lily. 이 문장은 "안녕하세요, 제 이름은 릴리입니다"라는 뜻입니다. "Hello"는 인사말이고, "my name is"는 "제 이름은"이라는 의미입니다.',
          date: '2024-01-20T14:30:00Z',
          messageType: 'translation' as const,
          subject: '영어',
          helpful: true,
        },
        {
          id: '2',
          prompt: '확률과 통계 기출 문제 풀이 좀 해줄래?',
          response:
            '확률과 통계 순열 부분 문제의 답을 알려줘. 이 문제는 순열의 기본 공식 nPr = n!/(n-r)!을 사용하면 됩니다. 주어진 조건에 따라 n과 r 값을 대입하여 계산하시면 됩니다.',
          date: '2024-01-20T13:15:00Z',
          messageType: 'explanation' as const,
          subject: '수학',
          helpful: true,
        },
        {
          id: '3',
          prompt: '한국 전쟁의 원인을 설명해줘',
          response:
            '한국 전쟁의 주요 원인은 다음과 같습니다: 1) 냉전 체제 하에서의 이데올로기 대립, 2) 38선 분할로 인한 남북 분단, 3) 미소 양국의 개입, 4) 내전의 성격을 띤 통일 전쟁 등이 복합적으로 작용했습니다.',
          date: '2024-01-20T12:00:00Z',
          messageType: 'explanation' as const,
          subject: '역사',
          helpful: true,
        },
        {
          id: '4',
          prompt: '화학 반응식 균형 맞추는 방법 알려줘',
          response:
            '화학 반응식의 균형을 맞추는 방법: 1) 각 원소의 개수를 좌우에서 세어보기, 2) 계수를 조정하여 원소 개수 맞추기, 3) 가장 복잡한 화합물부터 시작하기, 4) 분수 계수는 정수로 변환하기',
          date: '2024-01-20T11:45:00Z',
          messageType: 'explanation' as const,
          subject: '화학',
          helpful: false,
        },
        {
          id: '5',
          prompt: '영어 문법에서 현재완료와 과거형의 차이점은?',
          response:
            '현재완료(present perfect)와 과거형(past tense)의 차이점: 현재완료는 과거의 행동이 현재까지 영향을 미치는 경우 사용하며, 과거형은 단순히 과거에 일어난 일을 표현할 때 사용합니다. 예: "I have lived here for 5 years" vs "I lived here 5 years ago"',
          date: '2024-01-20T10:30:00Z',
          messageType: 'explanation' as const,
          subject: '영어',
          helpful: true,
        },
      ],
      subjects: ['영어', '수학', '역사', '화학', '물리', '생물', '국어', '사회'],
      messageTypes: ['translation', 'explanation', 'question', 'general'],
      stats: {
        totalChats: 5,
        helpfulChats: 4,
        averageRating: 4.2,
        mostAskedSubject: '영어',
      },
    };
  } catch (error) {
    console.error('AI 어시스턴트 데이터 로드 실패:', error);
    return null;
  }
}

export default async function AIAssistantPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const aiAssistantData = await getAIAssistantData();

  return <AIAssistantDetailClient session={session} initialData={aiAssistantData} />;
}
