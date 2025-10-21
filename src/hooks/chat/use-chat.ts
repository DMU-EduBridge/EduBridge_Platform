import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface ChatSession {
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

export interface ChatStats {
  totalChats: number;
  totalMessages: number;
  averageMessagesPerChat: number;
  mostActiveDay: string;
}

export interface ChatSessionsResponse {
  sessions: ChatSession[];
  stats: ChatStats;
}

// 채팅 세션 목록 조회
export function useChatSessions(userId?: string) {
  return useQuery<ChatSessionsResponse>({
    queryKey: ['chat-sessions', userId],
    queryFn: async () => {
      const response = await fetch('/api/chat/sessions');
      if (!response.ok) {
        throw new Error('채팅 세션 조회 실패');
      }
      const data = await response.json();
      return data.data;
    },
    enabled: !!userId,
  });
}

// 특정 채팅 세션 조회
export function useChatSession(sessionId: string) {
  return useQuery<ChatSession>({
    queryKey: ['chat-session', sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/chat/sessions/${sessionId}`);
      if (!response.ok) {
        throw new Error('채팅 세션 조회 실패');
      }
      const data = await response.json();
      return data.data;
    },
    enabled: !!sessionId,
  });
}

// 새 채팅 세션 생성
export function useCreateChatSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (title?: string) => {
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!response.ok) {
        throw new Error('채팅 세션 생성 실패');
      }
      const data = await response.json();
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
  });
}

// 채팅 세션 삭제
export function useDeleteChatSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(`/api/chat/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('채팅 세션 삭제 실패');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
  });
}

// 채팅 메시지 전송
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, message }: { sessionId: string; message: string }) => {
      const response = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) {
        throw new Error('메시지 전송 실패');
      }
      const data = await response.json();
      return data.data;
    },
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: ['chat-session', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
  });
}
