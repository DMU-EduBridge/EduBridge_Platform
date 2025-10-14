'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, BookOpen, MessageSquare, Send, Star, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// 타입 정의
interface ChatHistoryItem {
  id: string;
  prompt: string;
  response: string;
  date: string;
  messageType: 'translation' | 'explanation' | 'question' | 'general';
  subject: string;
  helpful: boolean;
}

interface AIAssistantData {
  chatHistory: ChatHistoryItem[];
  subjects: string[];
  messageTypes: string[];
  stats: {
    totalChats: number;
    helpfulChats: number;
    averageRating: number;
    mostAskedSubject: string;
  };
}

interface AIAssistantDetailClientProps {
  session: Session;
  initialData: AIAssistantData | null;
}

export function AIAssistantDetailClient({ initialData }: AIAssistantDetailClientProps) {
  const router = useRouter();
  const [aiAssistantData, setAIAssistantData] = useState<AIAssistantData | null>(initialData);
  const [selectedSubject, setSelectedSubject] = useState<string>('전체');
  const [selectedMessageType, setSelectedMessageType] = useState<string>('전체');
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!aiAssistantData) {
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

  const { chatHistory, subjects, messageTypes, stats } = aiAssistantData;

  // 새 질문 제출 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() || isLoading) return;

    setIsLoading(true);

    // 시뮬레이션: AI 응답 생성
    setTimeout(() => {
      const newChat: ChatHistoryItem = {
        id: String(Date.now()),
        prompt: currentInput,
        response: `"${currentInput}"에 대한 AI의 상세한 답변입니다. 이 질문에 대해 체계적으로 설명드리겠습니다. (시뮬레이션 응답)`,
        date: new Date().toISOString(),
        messageType: 'explanation',
        subject: '일반',
        helpful: true,
      };

      setAIAssistantData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          chatHistory: [newChat, ...prev.chatHistory],
          stats: {
            ...prev.stats,
            totalChats: prev.stats.totalChats + 1,
            helpfulChats: prev.stats.helpfulChats + 1,
          },
        };
      });

      setCurrentInput('');
      setIsLoading(false);
    }, 1500);
  };

  // 도움됨 평가 함수
  const rateHelpful = (id: string, helpful: boolean) => {
    setAIAssistantData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        chatHistory: prev.chatHistory.map((chat) => (chat.id === id ? { ...chat, helpful } : chat)),
        stats: {
          ...prev.stats,
          helpfulChats: helpful ? prev.stats.helpfulChats + 1 : prev.stats.helpfulChats - 1,
        },
      };
    });
  };

  // 필터링
  const filteredChats = chatHistory.filter((chat) => {
    const subjectMatch = selectedSubject === '전체' || chat.subject === selectedSubject;
    const typeMatch = selectedMessageType === '전체' || chat.messageType === selectedMessageType;
    return subjectMatch && typeMatch;
  });

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'translation':
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'explanation':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'question':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMessageTypeText = (type: string) => {
    switch (type) {
      case 'translation':
        return '번역';
      case 'explanation':
        return '설명';
      case 'question':
        return '질문';
      default:
        return '일반';
    }
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
              <h1 className="text-3xl font-bold text-gray-900">AI 어시스턴트</h1>
              <p className="mt-2 text-gray-600">AI와 대화하며 학습을 도와받으세요</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* 통계 및 필터 */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">대화 현황</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">총 대화</span>
                    <span className="font-medium">{stats.totalChats}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">도움됨</span>
                    <span className="font-medium text-green-600">{stats.helpfulChats}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">평균 평점</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-current text-yellow-500" />
                      <span className="font-medium">{stats.averageRating}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">많이 질문한 과목</span>
                    <span className="font-medium text-blue-600">{stats.mostAskedSubject}</span>
                  </div>
                </div>
              </Card>

              {/* 과목 필터 */}
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">과목</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedSubject('전체')}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      selectedSubject === '전체'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    전체
                  </button>
                  {subjects.map((subject) => (
                    <button
                      key={subject}
                      onClick={() => setSelectedSubject(subject)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        selectedSubject === subject
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </Card>

              {/* 메시지 타입 필터 */}
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">유형</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedMessageType('전체')}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      selectedMessageType === '전체'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    전체
                  </button>
                  {messageTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedMessageType(type)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        selectedMessageType === type
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {getMessageTypeText(type)}
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* 채팅 영역 */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              <div className="space-y-6 p-6">
                {/* 새 질문 입력 */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={currentInput}
                      onChange={(e) => setCurrentInput(e.target.value)}
                      placeholder="AI에게 질문해보세요..."
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      disabled={isLoading}
                    />
                    <Button
                      type="submit"
                      disabled={!currentInput.trim() || isLoading}
                      className="flex items-center gap-2"
                    >
                      {isLoading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      {isLoading ? '처리중...' : '전송'}
                    </Button>
                  </div>
                </form>

                {/* 채팅 히스토리 */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">대화 기록</h2>

                  <div className="max-h-96 space-y-4 overflow-y-auto">
                    {filteredChats.map((chat) => (
                      <div key={chat.id} className="space-y-3">
                        {/* 사용자 질문 */}
                        <div className="flex justify-end">
                          <div className="max-w-3xl rounded-lg bg-blue-500 px-4 py-2 text-white">
                            <p className="text-sm">{chat.prompt}</p>
                          </div>
                        </div>

                        {/* AI 응답 */}
                        <div className="flex justify-start">
                          <div className="max-w-3xl rounded-lg bg-gray-100 px-4 py-3">
                            <div className="mb-2 flex items-center gap-2">
                              {getMessageTypeIcon(chat.messageType)}
                              <span className="text-xs text-gray-500">
                                {getMessageTypeText(chat.messageType)} • {chat.subject}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(chat.date).toLocaleDateString('ko-KR')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-800">{chat.response}</p>

                            {/* 평가 버튼 */}
                            <div className="mt-3 flex items-center gap-2">
                              <span className="text-xs text-gray-500">도움이 되었나요?</span>
                              <button
                                onClick={() => rateHelpful(chat.id, true)}
                                className={`rounded p-1 ${
                                  chat.helpful
                                    ? 'bg-green-100 text-green-600'
                                    : 'text-gray-400 hover:text-green-600'
                                }`}
                              >
                                <ThumbsUp className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => rateHelpful(chat.id, false)}
                                className={`rounded p-1 ${
                                  !chat.helpful
                                    ? 'bg-red-100 text-red-600'
                                    : 'text-gray-400 hover:text-red-600'
                                }`}
                              >
                                <ThumbsDown className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredChats.length === 0 && (
                      <div className="py-12 text-center">
                        <p className="text-gray-500">대화 기록이 없습니다.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
