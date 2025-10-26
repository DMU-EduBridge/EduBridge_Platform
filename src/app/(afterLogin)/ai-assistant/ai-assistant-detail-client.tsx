'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  useChatSessions,
  useCreateChatSession,
  useDeleteChatSession,
  useSendMessage,
} from '@/hooks/chat/use-chat';
import { ArrowLeft, Bot, Clock, MessageSquare, Plus, Send, Trash2, User } from 'lucide-react';
import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

interface AIAssistantDetailClientProps {
  session: Session;
}

export function AIAssistantDetailClient({ session }: AIAssistantDetailClientProps) {
  const router = useRouter();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // API hooks
  const { data: chatData, isLoading: isLoadingSessions } = useChatSessions(session.user.id);
  const createSession = useCreateChatSession();
  const deleteSession = useDeleteChatSession();
  const sendMessage = useSendMessage();

  // 현재 세션의 메시지들
  const currentSession = chatData?.sessions.find((s) => s.id === currentSessionId);
  const messages = useMemo(() => currentSession?.messages || [], [currentSession?.messages]);

  // 임시 채팅방인지 확인
  const isTemporarySession = currentSessionId?.startsWith('temp-');

  // 첫 번째 세션을 기본으로 설정
  useEffect(() => {
    if (chatData?.sessions.length && !currentSessionId) {
      setCurrentSessionId(chatData.sessions[0]?.id || null);
    }
  }, [chatData, currentSessionId]);

  // 메시지가 추가될 때 스크롤을 맨 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNewSession = async () => {
    try {
      // 임시 ID를 즉시 설정하여 새 채팅방이 활성화되도록 함
      const tempId = `temp-${Date.now()}`;
      setCurrentSessionId(tempId);

      const newSession = await createSession.mutateAsync('새 대화');
      // 실제 ID로 교체
      setCurrentSessionId(newSession.id);
    } catch (error) {
      console.error('새 세션 생성 실패:', error);
      // 에러 발생 시 임시 ID 제거
      setCurrentSessionId(null);
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
    setPendingMessage(message); // 사용자 메시지를 즉시 표시
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
      setPendingMessage(null); // 응답 완료 후 pending 메시지 제거
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 사이드바 - 채팅 세션 목록 */}
      <div className="flex w-80 flex-col border-r border-gray-200/50 bg-white/80 shadow-lg backdrop-blur-sm">
        {/* 헤더 */}
        <div className="flex-shrink-0 border-b border-gray-200/50 bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          {/* 메인 헤더 영역 */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              뒤로가기
            </Button>{' '}
            <Button
              onClick={handleNewSession}
              disabled={createSession.isPending}
              size="sm"
              className="border-white/30 bg-white/20 text-white hover:bg-white/30"
            >
              <Plus className="mr-1 h-4 w-4" />새 대화
            </Button>
          </div>

          {/* 통계 정보 */}
          {chatData?.stats && (
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-white/10 p-2 text-center">
                <div className="font-semibold text-white">{chatData.stats.totalChats}</div>
                <div className="text-xs text-blue-100">총 대화</div>
              </div>
              <div className="rounded-lg bg-white/10 p-2 text-center">
                <div className="font-semibold text-white">{chatData.stats.totalMessages}</div>
                <div className="text-xs text-blue-100">총 메시지</div>
              </div>
            </div>
          )}
        </div>

        {/* 채팅 세션 목록 */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingSessions ? (
            <div className="p-6 text-center">
              <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              <p className="text-sm text-gray-500">로딩 중...</p>
            </div>
          ) : chatData?.sessions.length ? (
            <div className="space-y-2 p-3">
              {chatData.sessions.map((session) => (
                <Card
                  key={session.id}
                  className={`group cursor-pointer p-4 transition-all duration-200 hover:shadow-md ${
                    currentSessionId === session.id
                      ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 shadow-md'
                      : 'border-gray-200/50 hover:bg-gray-50/50'
                  }`}
                  onClick={() => setCurrentSessionId(session.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4 text-gray-400" />
                        <p className="truncate text-sm font-medium text-gray-900">
                          {session.title}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">
                          {session.messages.length}개 메시지
                        </Badge>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="mr-1 h-3 w-3" />
                          {new Date(session.updatedAt).toLocaleDateString('ko-KR')}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session.id);
                      }}
                      className="opacity-0 transition-opacity hover:bg-red-50 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">아직 대화가 없습니다.</p>
              <p className="mt-1 text-xs text-gray-400">새 대화를 시작해보세요!</p>
            </div>
          )}
        </div>
      </div>

      {/* 메인 채팅 영역 */}
      <div className="flex flex-1 flex-col">
        {/* 채팅 헤더 */}

        {/* 메시지 영역 */}
        <div className="flex-1 flex-grow overflow-y-auto bg-gradient-to-b from-transparent to-gray-50/30 p-6">
          {currentSessionId && !isTemporarySession ? (
            <div className="mx-auto max-w-4xl space-y-6">
              {/* 기존 메시지들 */}
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'USER' ? 'justify-end' : 'justify-start'
                  } animate-in slide-in-from-bottom-2 duration-300`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className={`flex max-w-2xl items-start space-x-3 ${
                      message.role === 'USER' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    {/* 아바타 */}
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                        message.role === 'USER'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600'
                          : 'bg-gradient-to-r from-gray-100 to-gray-200'
                      }`}
                    >
                      {message.role === 'USER' ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-gray-600" />
                      )}
                    </div>

                    {/* 메시지 내용 */}
                    <div
                      className={`rounded-2xl px-4 py-3 shadow-sm ${
                        message.role === 'USER'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : 'border border-gray-200 bg-white text-gray-900'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </p>
                      <p
                        className={`mt-2 text-xs ${
                          message.role === 'USER' ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pending 사용자 메시지 (즉시 표시) */}
              {pendingMessage && (
                <div className="animate-in slide-in-from-bottom-2 flex justify-end duration-300">
                  <div className="flex max-w-2xl flex-row-reverse items-start space-x-3 space-x-reverse">
                    {/* 아바타 */}
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                      <User className="h-4 w-4 text-white" />
                    </div>

                    {/* 메시지 내용 */}
                    <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-white shadow-sm">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {pendingMessage}
                      </p>
                      <p className="mt-2 text-xs text-blue-100">
                        {formatTime(new Date().toISOString())}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* AI 응답 생성 중 */}
              {isLoading && (
                <div className="animate-in slide-in-from-bottom-2 flex justify-start duration-300">
                  <div className="flex items-start space-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-gray-100 to-gray-200">
                      <Bot className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                        <span className="text-sm text-gray-600">
                          AI가 응답을 생성하고 있습니다...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 빈 상태 (메시지가 없고 pending도 없고 로딩도 아닐 때) */}
              {messages.length === 0 && !pendingMessage && !isLoading && (
                <div className="py-12 text-center">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100">
                    <MessageSquare className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-700">대화를 시작해보세요</h3>
                  <p className="text-gray-500">아래에서 메시지를 입력해보세요!</p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          ) : isTemporarySession ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-700">
                  새 대화를 생성하고 있습니다...
                </h3>
                <p className="text-gray-500">잠시만 기다려주세요</p>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100">
                  <MessageSquare className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-700">대화를 시작해보세요</h3>
                <p className="mb-4 text-gray-500">AI와 함께 학습에 대해 이야기해보세요</p>
                <Button
                  onClick={handleNewSession}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="mr-2 h-4 w-4" />새 대화 시작
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* 메시지 입력 영역 */}
        {currentSessionId && !isTemporarySession && (
          <div className="border-t border-gray-200/50 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
            <div className="mx-auto max-w-4xl">
              <div className="flex space-x-3">
                <div className="relative flex-1">
                  <textarea
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="메시지를 입력하세요... (Enter로 전송, Shift+Enter로 줄바꿈)"
                    className="w-full resize-none rounded-2xl border border-gray-300 px-4 py-3 pr-12 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={1}
                    disabled={isLoading}
                    style={{
                      minHeight: '48px',
                      maxHeight: '120px',
                    }}
                  />
                  {isLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 transform">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!currentInput.trim() || isLoading}
                  className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 hover:from-blue-700 hover:to-purple-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
