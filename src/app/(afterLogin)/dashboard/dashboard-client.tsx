'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useDashboardOverviewData } from '@/hooks/dashboard/use-dashboard-overview';
import { Check, ChevronRight, Download, Plus, Square } from 'lucide-react';
import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// 타입 정의
interface LearningProgressItem {
  id: string;
  subject: string;
  grade: string;
  gradeColor: 'green' | 'red';
  currentUnit: string;
  progress: number;
  totalProblems: number;
  completedProblems: number;
  lastStudiedAt: string;
}

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

interface MessageItem {
  id: string;
  sender: string;
  senderId: string;
  message: string;
  hasNotification: boolean;
  notificationCount?: number;
  isRead: boolean;
  messageType: 'question' | 'reminder' | 'general';
  createdAt: string;
}

interface ChatExample {
  id: string;
  prompt: string;
  response: string;
  date: string;
  messageType: 'translation' | 'explanation' | 'question' | 'general';
  subject: string;
}

interface IncorrectAnswerNoteItem {
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
}

interface DashboardData {
  learningProgress: LearningProgressItem[];
  todos: TodoItem[];
  messages: MessageItem[];
  aiChatExamples: ChatExample[];
  incorrectAnswerNotes: IncorrectAnswerNoteItem[];
  summary: {
    totalSubjects: number;
    totalTodos: number;
    completedTodos: number;
    unreadMessages: number;
    totalIncorrectProblems: number;
    completedIncorrectProblems: number;
  };
}

interface DashboardClientProps {
  session: Session;
  initialData: DashboardData | null;
}

export function DashboardClient({ session, initialData }: DashboardClientProps) {
  const router = useRouter();
  const [aiInput, setAiInput] = useState('');

  // React Query로 데이터 가져오기 (초기 데이터는 서버에서 제공)
  const {
    learningProgress,
    todos,
    messages,
    aiChatExamples,
    incorrectAnswerNotes,
    summary: _summary,
    isLoading,
    error,
  } = useDashboardOverviewData(initialData || undefined);

  // 데이터가 없으면 로딩 상태 표시
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
          <p className="mt-2 text-gray-600">나의 학습 진도와 오늘의 목표를 한눈에 확인해보세요!</p>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태 표시
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
          <p className="mt-2 text-gray-600">나의 학습 진도와 오늘의 목표를 한눈에 확인해보세요!</p>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-red-600">데이터를 불러오는데 실패했습니다.</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                다시 시도
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 할 일 토글 함수 (React Query mutation 사용)
  const toggleTodo = async (id: string) => {
    try {
      const response = await fetch('/api/dashboard/todos', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          completed: !todos.find((todo) => todo.id === id)?.completed,
        }),
      });

      if (response.ok) {
        // React Query가 자동으로 캐시를 무효화하고 다시 가져올 것
        window.location.reload(); // 임시로 페이지 새로고침
      }
    } catch (error) {
      console.error('할 일 업데이트 실패:', error);
    }
  };

  // 메시지 읽음 처리 함수 (React Query mutation 사용)
  const markMessageAsRead = async (id: string) => {
    try {
      const response = await fetch('/api/dashboard/messages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          isRead: true,
        }),
      });

      if (response.ok) {
        // React Query가 자동으로 캐시를 무효화하고 다시 가져올 것
        window.location.reload(); // 임시로 페이지 새로고침
      }
    } catch (error) {
      console.error('메시지 업데이트 실패:', error);
    }
  };

  // AI 어시스턴트 질문 처리 함수 (API 사용)
  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    try {
      const response = await fetch('/api/dashboard/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: aiInput,
          messageType: 'general',
          subject: '일반',
        }),
      });

      if (response.ok) {
        // React Query가 자동으로 캐시를 무효화하고 다시 가져올 것
        window.location.reload(); // 임시로 페이지 새로고침
        setAiInput('');
      }
    } catch (error) {
      console.error('AI 질문 전송 실패:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 대시보드 헤더 */}
      <div className="px-6 py-4">
        <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
        <p className="mt-2 text-gray-600">
          안녕하세요, {session.user.name}님! 나의 학습 진도와 오늘의 목표를 한눈에 확인해보세요!
        </p>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="p-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* 왼쪽 열 - 학습 진도 */}
          <div className="space-y-6">
            {/* 학습 진도 카드들 */}
            <div className="space-y-4">
              {learningProgress.map((subject) => (
                <Card key={subject.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">{subject.subject}</h3>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-medium ${
                            subject.gradeColor === 'green'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {subject.grade}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/my/learning/${subject.id}`)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        현재 배우고 있는 단원: {subject.currentUnit}
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">진도율</span>
                          <span className="font-medium text-gray-900">{subject.progress}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-gray-200">
                          <div
                            className={`h-2 rounded-full ${
                              subject.progress >= 75
                                ? 'bg-green-500'
                                : subject.progress >= 50
                                  ? 'bg-green-400'
                                  : subject.progress >= 30
                                    ? 'bg-purple-500'
                                    : 'bg-gray-400'
                            }`}
                            style={{ width: `${subject.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* AI 어시스턴트 */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">무엇을 도와드릴까요?</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/ai-assistant')}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <form onSubmit={handleAiSubmit} className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 transform">
                    <Plus className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="질문을 입력하세요..."
                    className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  />
                </form>
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700">최근 대화</h3>
                  {aiChatExamples.map((example) => (
                    <div key={example.id} className="space-y-2 rounded-lg bg-gray-50 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{example.prompt}</p>
                        <span className="text-xs text-gray-500">{example.date}</span>
                      </div>
                      <p className="rounded border-l-4 border-blue-500 bg-white p-2 text-sm text-gray-600">
                        {example.response}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* 가운데 열 - 할 일 리스트 */}
          <div className="space-y-6">
            {/* 할 일 리스트 */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">해야할 일 리스트</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/my/todos')}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {todos.map((todo) => (
                    <div
                      key={todo.id}
                      onClick={() => toggleTodo(todo.id)}
                      className="flex cursor-pointer items-center space-x-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex-shrink-0">
                        {todo.completed ? (
                          <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-500">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        ) : (
                          <Square className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <span
                        className={`flex-1 text-sm ${todo.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}
                      >
                        {todo.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* 오답 노트 */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">오답 노트</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/my/incorrect-answers')}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  {incorrectAnswerNotes.map((note) => (
                    <div key={note.id} className="space-y-4 rounded-lg border border-gray-200 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{note.subject}</h3>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${note.gradeColor === 'green' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                          >
                            {note.grade}
                          </span>
                        </div>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            note.statusColor === 'red'
                              ? 'bg-red-100 text-red-800'
                              : note.statusColor === 'yellow'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {note.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>틀린 문제: {note.incorrectCount}문제</p>
                        <p>다시 풀어본 문제: {note.retryCount}문제</p>
                        <p>오답 완료: {note.completedCount}문제</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" className="bg-blue-500 text-white hover:bg-blue-600">
                          문제 풀기
                        </Button>
                        <Button size="sm" variant="outline" className="flex items-center space-x-1">
                          <Download className="h-4 w-4" />
                          <span>다운로드</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* 오른쪽 열 - 메일함 */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">메일함</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/my/messages')}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => markMessageAsRead(msg.id)}
                      className="flex cursor-pointer items-start space-x-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex-shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                          <span className="text-sm font-medium text-purple-600">
                            {msg.sender
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="truncate text-sm font-medium text-gray-900">{msg.sender}</p>
                          {msg.hasNotification && !msg.isRead && (
                            <div className="flex-shrink-0">
                              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-xs font-medium text-white">
                                {msg.notificationCount || 1}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-gray-600">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
