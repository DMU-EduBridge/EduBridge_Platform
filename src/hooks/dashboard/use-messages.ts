import type { Message, MarkMessageReadRequest as UpdateMessageRequest } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface MessageResponse {
  success: boolean;
  data: Message[];
}

interface CreateMessageRequest {
  recipientId: string;
  message: string;
  messageType?: 'question' | 'announcement' | 'reminder' | 'general';
}

/**
 * 메시지 목록을 가져오는 훅
 */
export function useMessages() {
  return useQuery<MessageResponse>({
    queryKey: ['dashboard', 'messages'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/messages');

      if (!response.ok) {
        throw new Error('메시지를 가져오는데 실패했습니다.');
      }

      return response.json();
    },
    staleTime: 1 * 60 * 1000, // 1분
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchInterval: 30 * 1000, // 30초마다 자동 새로고침
  });
}

/**
 * 메시지 데이터를 가져오는 훅 (데이터만 반환)
 */
export function useMessagesData() {
  const { data, ...rest } = useMessages();

  return {
    ...rest,
    messages: data?.data || [],
  };
}

/**
 * 새 메시지를 전송하는 훅
 */
export function useCreateMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageData: CreateMessageRequest) => {
      const response = await fetch('/api/dashboard/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error('메시지 전송에 실패했습니다.');
      }

      return response.json();
    },
    onSuccess: () => {
      // 메시지 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'messages'] });
    },
  });
}

/**
 * 메시지 읽음 상태를 업데이트하는 훅
 */
export function useUpdateMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageData: UpdateMessageRequest) => {
      const response = await fetch('/api/dashboard/messages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error('메시지 업데이트에 실패했습니다.');
      }

      return response.json();
    },
    onSuccess: () => {
      // 메시지 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'messages'] });
    },
  });
}
