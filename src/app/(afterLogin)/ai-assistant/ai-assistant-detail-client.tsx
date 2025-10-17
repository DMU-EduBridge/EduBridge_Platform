'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useChat } from '@/hooks/ai/use-chat';
import type { ChatMessage } from '@/types/ai/chat';
import { ArrowLeft, Send, Trash2 } from 'lucide-react';
import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

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
}

interface AIAssistantDetailClientProps {
  session: Session;
  initialData: AIAssistantData | null;
}

export function AIAssistantDetailClient({ initialData }: AIAssistantDetailClientProps) {
  const router = useRouter();
  const [aiAssistantData] = useState<AIAssistantData | null>(initialData);
  const [currentInput, setCurrentInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Chat hook (real API)
  const { state, sendMessage, setSession, reset } = useChat();

  // --- 채팅방(세션) 리스트 상태 (로컬 저장) ---
  interface ChatRoomItem {
    id: string;
    title: string;
    updatedAt: string;
    lastMessage?: string;
  }
  const [rooms, setRooms] = useState<ChatRoomItem[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string>('');

  // 로컬 저장소 키
  const LS_KEY = 'aiChat.sessions';

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(LS_KEY) : null;
    if (raw) {
      const parsed: ChatRoomItem[] = JSON.parse(raw) as ChatRoomItem[];
      setRooms(parsed);
      if (parsed.length > 0) {
        const firstRoom = parsed[0] as ChatRoomItem;
        setActiveRoomId(firstRoom.id);
        setSession(firstRoom.id);
      }
    } else {
      const first: ChatRoomItem = {
        id: state.sessionId,
        title: '새 대화',
        updatedAt: new Date().toISOString(),
        lastMessage: '',
      };
      setRooms([first]);
      setActiveRoomId(first.id);
      setSession(first.id);
      if (typeof window !== 'undefined')
        window.localStorage.setItem(LS_KEY, JSON.stringify([first]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 방 선택
  const onSelectRoom = (id: string) => {
    setActiveRoomId(id);
    setSession(id);
    reset();
  };

  // 새 대화
  const onNewRoom = () => {
    const id = crypto.randomUUID();
    const item: ChatRoomItem = {
      id,
      title: '새 대화',
      updatedAt: new Date().toISOString(),
      lastMessage: '',
    };
    const next = [item, ...rooms];
    setRooms(next);
    setActiveRoomId(id);
    setSession(id);
    reset();
    if (typeof window !== 'undefined') window.localStorage.setItem(LS_KEY, JSON.stringify(next));
  };

  // 방 삭제
  const onDeleteRoom = (id: string) => {
    const next = rooms.filter((r) => r.id !== id);
    setRooms(next);
    if (typeof window !== 'undefined') window.localStorage.setItem(LS_KEY, JSON.stringify(next));
    if (activeRoomId === id) {
      const fallback = next[0]?.id ?? crypto.randomUUID();
      if (!next[0]) {
        const seed = [
          { id: fallback, title: '새 대화', updatedAt: new Date().toISOString(), lastMessage: '' },
        ];
        setRooms(seed);
        if (typeof window !== 'undefined')
          window.localStorage.setItem(LS_KEY, JSON.stringify(seed));
      }
      setActiveRoomId(fallback);
      setSession(fallback);
      reset();
    }
  };

  // 현재 방 대화 비우기
  const onClearMessages = () => reset();

  // 스크롤 ref (훅은 항상 상단 호출)
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // 안전한 히스토리 참조(초기 로딩 시 빈 배열)
  const chatHistorySafe: ChatHistoryItem[] = aiAssistantData?.chatHistory ?? [];

  // 메시지 변경 시 활성 방의 최근 메시지/시간 갱신 (훅은 조건 밖)
  useEffect(() => {
    if (!activeRoomId) return;
    if (state.messages.length === 0) return;
    const last = state.messages[state.messages.length - 1] as ChatMessage;
    setRooms((prev) => {
      const next = prev.map((r) =>
        r.id === activeRoomId
          ? { ...r, lastMessage: last.content, updatedAt: new Date().toISOString() }
          : r,
      );
      if (typeof window !== 'undefined') window.localStorage.setItem(LS_KEY, JSON.stringify(next));
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.messages]);

  // 새 질문 제출: 실제 LLM 호출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInput.trim() || isLoading) return;
    setIsLoading(true);
    try {
      await sendMessage(currentInput);
      // 방 제목/업데이트 갱신(첫 사용자 메시지를 제목으로)
      setRooms((prev) => {
        const title = currentInput.length > 30 ? `${currentInput.slice(0, 30)}…` : currentInput;
        const next = prev.map((r) =>
          r.id === activeRoomId
            ? {
                ...r,
                title: r.title === '새 대화' ? title : r.title,
                updatedAt: new Date().toISOString(),
                lastMessage: currentInput,
              }
            : r,
        );
        if (typeof window !== 'undefined')
          window.localStorage.setItem(LS_KEY, JSON.stringify(next));
        return next;
      });
    } finally {
      setCurrentInput('');
      setIsLoading(false);
      if (inputRef.current) inputRef.current.focus();
    }
  };

  // 기존 히스토리(샘플) 그대로 사용(안전 배열)
  const filteredChats = chatHistorySafe;

  // 샘플 히스토리를 ChatMessage 시퀀스로 변환(사용자→어시스턴트 쌍)
  const historyMessages: ChatMessage[] = useMemo(() => {
    const seq: ChatMessage[] = [];
    filteredChats.forEach((c) => {
      seq.push({ role: 'user', content: c.prompt });
      seq.push({ role: 'assistant', content: c.response });
    });
    return seq;
  }, [filteredChats]);

  // 신규 메시지(실제 대화) 렌더용
  const liveMessages: ChatMessage[] = state.messages;

  // 최종 표시 메시지: 과거(샘플) + 실시간
  const allMessages: ChatMessage[] = useMemo(
    () => [...historyMessages, ...liveMessages],
    [historyMessages, liveMessages],
  );

  // 방 리스트 최신순 정렬
  const sortedRooms = useMemo(() => {
    return [...rooms].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }, [rooms]);

  // 새 메시지 수신 시 하단으로 스크롤
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [allMessages.length]);

  // 입력창 포커스 유지: 방 전환/대기 상태 변화 시 포커스 복원
  useEffect(() => {
    if (isLoading) return;
    if (inputRef.current) inputRef.current.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRoomId, state.pending]);

  // 데이터 로딩 화면(훅 선언 뒤에 조건부 리턴)
  if (!aiAssistantData) {
    return (
      <div className="bg-gray-50">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 타입 단순화에 따라 메시지 타입 아이콘/텍스트는 제거 (후속 확장 가능)

  return (
    <div className="flex h-full flex-col overflow-hidden bg-gray-50">
      {/* 헤더 */}
      <div className="shrink-0 px-6 py-4">
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

      <div className="min-h-0 flex-1 overflow-hidden p-6 pt-0">
        <div className="grid h-full grid-cols-1 gap-6 overflow-hidden lg:grid-cols-4">
          {/* 좌측: 채팅방 리스트 */}
          <div className="min-h-0 overflow-hidden lg:col-span-1">
            <Card className="flex h-full min-h-0 flex-col overflow-hidden p-0">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="text-sm font-semibold text-gray-700">대화</div>
                <Button size="sm" variant="outline" onClick={onNewRoom}>
                  새 대화
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {sortedRooms.map((room) => (
                  <div
                    key={room.id}
                    className={`flex items-center justify-between border-b px-4 py-3 text-sm ${
                      activeRoomId === room.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    title={room.title}
                  >
                    <button
                      onClick={() => onSelectRoom(room.id)}
                      className="flex-1 truncate text-left"
                    >
                      <div className="truncate">{room.title}</div>
                      {room.lastMessage ? (
                        <div className="truncate text-xs text-gray-500">{room.lastMessage}</div>
                      ) : (
                        <div className="truncate text-xs text-gray-400">
                          {new Date(room.updatedAt).toLocaleDateString('ko-KR')}
                        </div>
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRoom(room.id);
                      }}
                      className="ml-2 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="대화 삭제"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {sortedRooms.length === 0 && (
                  <div className="p-4 text-center text-sm text-gray-500">대화가 없습니다.</div>
                )}
              </div>
            </Card>
          </div>

          {/* 채팅 영역 */}
          <div className="min-h-0 overflow-hidden lg:col-span-3">
            <Card className="flex h-full min-h-0 flex-col overflow-hidden p-0">
              {/* 상단 바: 현재 방 액션 */}
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="text-sm font-semibold text-gray-700">대화창</div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onClearMessages}
                  disabled={state.messages.length === 0}
                >
                  비우기
                </Button>
              </div>
              {/* 스크롤 영역 */}
              <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-6">
                {allMessages.map((m, idx) => (
                  <div key={`msg-${idx}`} className="space-y-3">
                    {m.role === 'user' ? (
                      <div className="flex justify-end">
                        <div className="max-w-3xl rounded-2xl bg-blue-500 px-4 py-2 text-white">
                          <p className="whitespace-pre-wrap text-sm">{m.content}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-start">
                        <div className="max-w-3xl rounded-2xl bg-gray-100 px-4 py-3">
                          <p className="whitespace-pre-wrap text-sm text-gray-800">{m.content}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* 타이핑 인디케이터 */}
                {state.pending && (
                  <div className="flex justify-start">
                    <div className="max-w-3xl rounded-2xl bg-gray-100 px-4 py-3 text-gray-500">
                      <p className="text-sm">응답 생성 중…</p>
                    </div>
                  </div>
                )}

                {allMessages.length === 0 && (
                  <div className="py-12 text-center text-gray-500">대화를 시작해보세요.</div>
                )}
              </div>

              {/* 입력 박스 (하단 고정) */}
              <form onSubmit={handleSubmit} className="border-t border-gray-100 p-4">
                <div className="flex items-end gap-3">
                  <textarea
                    ref={inputRef}
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    placeholder="메시지를 입력하세요... (Shift+Enter 줄바꿈)"
                    className="max-h-40 min-h-12 flex-1 resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        void handleSubmit(e);
                        // 제출 직후에도 포커스 유지
                        if (inputRef.current) {
                          // 다음 페인트 타이밍에 재포커스
                          requestAnimationFrame(() => inputRef.current && inputRef.current.focus());
                        }
                      }
                    }}
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    disabled={!currentInput.trim() || isLoading || state.pending}
                    className="flex items-center gap-2"
                  >
                    {isLoading || state.pending ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    전송
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
