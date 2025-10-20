'use client';

import { Button } from '@/components/ui/button';
import {
  useChatSessions,
  useCreateChatSession,
  useDeleteChatSession,
  useSendMessage,
} from '@/hooks/chat/use-chat';
import { ArrowLeft, MessageSquare, Plus, Send, Trash2 } from 'lucide-react';
import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: {
    id: string;
    content: string;
    role: 'USER' | 'ASSISTANT';
    createdAt: string;
  }[];
}

interface ChatStats {
  totalChats: number;
  totalMessages: number;
  averageMessagesPerChat: number;
  mostActiveDay: string;
}

interface AIAssistantData {
  sessions: ChatSession[];
  stats: ChatStats;
  subjects: string[];
  messageTypes: string[];
}

interface AIAssistantDetailClientProps {
  session: Session;
  initialData: AIAssistantData | null;
}

export function AIAssistantDetailClient({ session, initialData }: AIAssistantDetailClientProps) {
  const router = useRouter();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // API hooks
  const { data: chatData, isLoading: isLoadingSessions } = useChatSessions();
  const createSession = useCreateChatSession();
  const deleteSession = useDeleteChatSession();
  const sendMessage = useSendMessage();

  // 현재 세션의 메시지들
  const currentSession = chatData?.sessions.find((s) => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  // 첫 번째 세션을 기본으로 설정
  useEffect(() => {
    if (chatData?.sessions.length && !currentSessionId) {
      setCurrentSessionId(chatData.sessions[0].id);
    }
  }, [chatData, currentSessionId]);

  // 메시지가 추가될 때 스크롤을 맨 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNewSession = async () => {
    try {
      const newSession = await createSession.mutateAsync('새 대화');
      setCurrentSessionId(newSession.id);
    } catch (error) {
      console.error('새 세션 생성 실패:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession.mutateAsync(sessionId);
      if (currentSessionId === sessionId) {
        setCurrentSessionId(null);
      }
    } catch (error) {
      console.error('세션 삭제 실패:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim() || !currentSessionId || isLoading) return;

    const message = currentInput.trim();
    setCurrentInput('');
    setIsLoading(true);

    try {
      await sendMessage.mutateAsync({
        sessionId: currentSessionId,
        message,
      });
    } catch (error) {
      console.error('메시지 전송 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 사이드바 - 채팅 세션 목록 */}
      <div className="flex w-80 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">대화</h2>
            <Button onClick={handleNewSession} size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />새 대화
            </Button>
          </div>

          {/* 통계 정보 */}
          {chatData?.stats && (
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div>총 대화: {chatData.stats.totalChats}개</div>
              <div>총 메시지: {chatData.stats.totalMessages}개</div>
            </div>
          )}
        </div>

        {/* 채팅 세션 목록 */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingSessions ? (
            <div className="p-4 text-center text-gray-500">로딩 중...</div>
          ) : chatData?.sessions.length ? (
            <div className="space-y-1 p-2">
              {chatData.sessions.map((session) => (
                <div
                  key={session.id}
                  className={`cursor-pointer rounded-lg p-3 transition-colors ${
                    currentSessionId === session.id
                      ? 'border border-blue-200 bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setCurrentSessionId(session.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{session.title}</p>
                      <p className="text-xs text-gray-500">{session.messages.length}개 메시지</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session.id);
                      }}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <MessageSquare className="mx-auto mb-2 h-8 w-8 text-gray-300" />
              <p>아직 대화가 없습니다</p>
              <p className="text-sm">새 대화를 시작해보세요!</p>
            </div>
          )}
        </div>
      </div>

      {/* 메인 채팅 영역 */}
      <div className="flex flex-1 flex-col">
        {/* 헤더 */}
        <div className="border-b border-gray-200 bg-white p-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              뒤로가기
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">AI 어시스턴트</h1>
              <p className="text-sm text-gray-600">AI와 대화하며 학습을 도와받으세요</p>
            </div>
          </div>
        </div>

        {/* 채팅 메시지 영역 */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {currentSessionId ? (
            messages.length > 0 ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'USER' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3xl rounded-lg px-4 py-2 ${
                      message.role === 'USER'
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-200 bg-white text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                    <p
                      className={`mt-1 text-xs ${
                        message.role === 'USER' ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="mt-8 text-center text-gray-500">
                <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <p>아직 메시지가 없습니다</p>
                <p className="text-sm">아래에서 메시지를 입력해보세요!</p>
              </div>
            )
          ) : (
            <div className="mt-8 text-center text-gray-500">
              <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <p>대화를 선택하거나 새 대화를 시작하세요</p>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-lg border border-gray-200 bg-white px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                  <span className="text-sm text-gray-600">AI가 응답을 생성하고 있습니다...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 메시지 입력 영역 */}
        {currentSessionId && (
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="flex gap-2">
              <textarea
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="메시지를 입력하세요... (Enter로 전송, Shift+Enter로 줄바꿈)"
                className="max-h-[120px] min-h-[60px] flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!currentInput.trim() || isLoading}
                className="px-4 py-2"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
