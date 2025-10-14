'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Message, MessagesStats } from '@/types';
import { ArrowLeft, Bell, Mail, MessageSquare } from 'lucide-react';
import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// 타입 정의
type MessageItem = Message;

interface MessagesData {
  messages: MessageItem[];
  categories: string[];
  stats: MessagesStats;
}

interface MessagesDetailClientProps {
  session: Session;
  initialData: MessagesData | null;
}

export function MessagesDetailClient({ initialData }: MessagesDetailClientProps) {
  const router = useRouter();
  const [messagesData, setMessagesData] = useState<MessagesData | null>(initialData);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [selectedMessage, setSelectedMessage] = useState<MessageItem | null>(null);

  if (!messagesData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  const { messages, stats } = messagesData;

  // 메시지 읽음 처리 함수
  const markMessageAsRead = (id: string) => {
    setMessagesData((prev) => {
      if (!prev) return prev;
      const updatedMessages = prev.messages.map((message) =>
        message.id === id ? { ...message, isRead: true, hasNotification: false } : message,
      );

      return {
        ...prev,
        messages: updatedMessages,
        stats: {
          ...prev.stats,
          unread: updatedMessages.filter((msg) => !msg.isRead).length,
          read: updatedMessages.filter((msg) => msg.isRead).length,
        },
      };
    });
  };

  // 메시지 선택 함수
  const selectMessage = (message: MessageItem) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      markMessageAsRead(message.id);
    }
  };

  // 카테고리별 필터링
  const filteredMessages =
    selectedCategory === '전체'
      ? messages
      : messages.filter((message) => message.category === selectedCategory);

  // 시간순 정렬 (최신순)
  const sortedMessages = filteredMessages.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'question':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'reminder':
        return <Bell className="h-4 w-4 text-yellow-500" />;
      default:
        return <Mail className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMessageTypeText = (type: string) => {
    switch (type) {
      case 'question':
        return '질문';
      case 'reminder':
        return '알림';
      default:
        return '일반';
    }
  };

  const getSenderType = (senderId: string) => {
    return senderId.includes('teacher') ? 'teacher' : 'student';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              뒤로가기
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">메시지</h1>
              <p className="mt-2 text-gray-600">받은 메시지를 확인하고 관리하세요</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 pt-0">
        {/* 메시지 목록 */}
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedCategory === '전체' ? '모든 메시지' : selectedCategory}
            </h2>

            {/* 메시지 현황 한 줄 배치 */}
            <div className="flex flex-wrap gap-2 rounded-lg bg-gray-50 p-3">
              <button
                onClick={() => setSelectedCategory('전체')}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  selectedCategory === '전체'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                전체 ({stats.total})
              </button>
              <button
                onClick={() => setSelectedCategory('학습 질문')}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  selectedCategory === '학습 질문'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                학습 질문 ({messages.filter((m) => m.category === '학습 질문').length})
              </button>
              <button
                onClick={() => setSelectedCategory('과제')}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  selectedCategory === '과제'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                과제 ({messages.filter((m) => m.category === '과제').length})
              </button>
              <button
                onClick={() => setSelectedCategory('일반')}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  selectedCategory === '일반'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                일반 ({messages.filter((m) => m.category === '일반').length})
              </button>
              <button
                onClick={() => setSelectedCategory('공지사항')}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  selectedCategory === '공지사항'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                공지사항 ({messages.filter((m) => m.category === '공지사항').length})
              </button>
            </div>

            <div className="space-y-3">
              {sortedMessages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => selectMessage(message)}
                  className={`flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors ${
                    selectedMessage?.id === message.id
                      ? 'border-blue-500 bg-blue-50'
                      : message.isRead
                        ? 'border-gray-200 hover:bg-gray-50'
                        : 'bg-blue-25 border-blue-200 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex-shrink-0">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        getSenderType(message.senderId) === 'teacher'
                          ? 'bg-blue-100'
                          : 'bg-purple-100'
                      }`}
                    >
                      <span
                        className={`text-sm font-medium ${
                          getSenderType(message.senderId) === 'teacher'
                            ? 'text-blue-600'
                            : 'text-purple-600'
                        }`}
                      >
                        {message.sender
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">{message.sender}</h3>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              getSenderType(message.senderId) === 'teacher'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {getSenderType(message.senderId) === 'teacher' ? '선생님' : '학생'}
                          </span>
                          <div className="flex items-center gap-1">
                            {getMessageTypeIcon(message.messageType)}
                            <span className="text-xs text-gray-500">
                              {getMessageTypeText(message.messageType)}
                            </span>
                          </div>
                        </div>

                        <h4 className="mb-2 text-sm font-medium text-gray-700">
                          {message.subject}
                        </h4>

                        <p className="line-clamp-2 text-sm text-gray-600">{message.message}</p>
                      </div>

                      <div className="ml-4 flex items-center gap-2">
                        {message.hasNotification && !message.isRead && (
                          <div className="flex-shrink-0">
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                              {message.notificationCount || 1}
                            </span>
                          </div>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(message.createdAt).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {sortedMessages.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-gray-500">메시지가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
