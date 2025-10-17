import { chat as chatApi } from '@/lib/ai-server/client';
import type {
  ChatError,
  ChatMessage,
  ChatRequest,
  ChatRequestMeta,
  ChatResponse,
} from '@/types/ai/chat';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface UseChatOptions {
  initialSessionId?: string;
  blockWhilePending?: boolean; // true면 전송 중 추가 전송 차단
  enableQueue?: boolean; // true면 큐잉 처리(기본 false)
  stream?: boolean; // 스트리밍 사용
  maxTurns?: number; // 유지할 최대 턴 수(유저+어시스턴트 = 2가 1턴)
  persist?: 'none' | 'local';
  storageKey?: string; // persist가 local일 때 사용
}

export interface UseChatState {
  sessionId: string;
  messages: ChatMessage[];
  pending: boolean;
  error?: string;
}

export interface UseChatApi {
  state: UseChatState;
  setSession(sessionId: string): void;
  sendMessage(content: string, meta?: ChatRequestMeta): Promise<ChatResponse | undefined>;
  abort(): void;
  reset(): void;
}

export function useChat(options?: UseChatOptions): UseChatApi {
  const [state, setState] = useState<UseChatState>({
    sessionId: options?.initialSessionId ?? crypto.randomUUID(),
    messages: [],
    pending: false,
  });

  const abortRef = useRef<AbortController | null>(null);
  const stateRef = useRef(state);
  const queueRef = useRef<Array<{ content: string; meta?: ChatRequestMeta }>>([]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // 초기 세션/메시지 로딩 (세션 영속)
  useEffect(() => {
    if (options?.persist === 'local' && typeof window !== 'undefined') {
      const key = options.storageKey ?? `useChat:${state.sessionId}`;
      try {
        const raw = window.localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw) as { messages?: ChatMessage[] };
          if (Array.isArray(parsed?.messages)) {
            setState((s) => ({ ...s, messages: parsed.messages! }));
          }
        }
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 상태 영속
  useEffect(() => {
    if (options?.persist === 'local' && typeof window !== 'undefined') {
      const key = options.storageKey ?? `useChat:${state.sessionId}`;
      try {
        window.localStorage.setItem(key, JSON.stringify({ messages: state.messages }));
      } catch {
        // ignore
      }
    }
  }, [state.sessionId, state.messages, options?.persist, options?.storageKey]);

  const setSession = useCallback((sessionId: string) => {
    setState((s) => ({ ...s, sessionId }));
  }, []);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState((s) => ({ sessionId: s.sessionId, messages: [], pending: false }));
  }, []);

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, []);

  function trimMessages(messages: ChatMessage[], maxTurns?: number): ChatMessage[] {
    if (!maxTurns || maxTurns <= 0) return messages;
    // 최근 N턴 유지: user+assistant = 2 메시지
    const maxMsgs = maxTurns * 2;
    return messages.slice(-maxMsgs);
  }

  // 선택적 요약 주입(HOF로 나중에 확장 가능). 현재는 단순 트림만 적용
  // export type Summarizer = (messages: ChatMessage[]) => ChatMessage | null;

  const internalSend = useCallback(
    async (content: string, meta?: ChatRequestMeta) => {
      const trimmed = content.trim();
      if (!trimmed) return undefined;

      // block or allow depending on options
      if (
        stateRef.current.pending &&
        (options?.blockWhilePending ?? true) &&
        !options?.enableQueue
      ) {
        return undefined;
      }

      const controller = new AbortController();
      // 기존 진행 중 요청이 있다면 교체(사용자 abort 없이 덮어쓰기 방지하려면 옵션화 가능)
      abortRef.current?.abort();
      abortRef.current = controller;

      const userMsg: ChatMessage = { role: 'user', content: trimmed };
      setState((s) => ({
        ...s,
        pending: true,
        messages: trimMessages([...s.messages, userMsg], options?.maxTurns),
      }));

      try {
        const current = stateRef.current;
        const request: ChatRequest = {
          sessionId: current.sessionId,
          messages: [...current.messages, userMsg],
          ...(meta ? { meta } : {}),
        } as ChatRequest;

        const opts = options?.stream
          ? {
              signal: controller.signal,
              stream: true as const,
              onDelta: (d: any) => {
                setState((s) => {
                  const last = s.messages[s.messages.length - 1];
                  if (last && last.role === 'assistant') {
                    const merged = s.messages
                      .slice(0, -1)
                      .concat({ role: 'assistant', content: last.content + d.delta });
                    return { ...s, messages: merged };
                  }
                  return {
                    ...s,
                    messages: s.messages.concat({ role: 'assistant', content: d.delta }),
                  };
                });
              },
            }
          : { signal: controller.signal, stream: false as const };

        const res = await chatApi(request, opts);

        setState((s) => ({
          ...s,
          pending: false,
          messages: [...s.messages, res.message],
          error: '',
        }));
        return res;
      } catch (e) {
        const err: ChatError | Error = e as any;
        if ((err as any)?.name === 'AbortError') {
          setState((s) => ({ ...s, pending: false }));
          return undefined;
        }
        // 소프트 재시도: 네트워크/서버 일시 오류로 판단되면 1회 재시도
        const message = (err as any)?.message
          ? String((err as any).message)
          : '알 수 없는 오류가 발생했습니다.';
        const isTransient = /network|timeout|fetch|502|503|504/i.test(message);
        if (isTransient) {
          try {
            const retryRes = await chatApi(
              {
                sessionId: stateRef.current.sessionId,
                messages: [...stateRef.current.messages],
                ...(meta ? { meta } : {}),
              } as ChatRequest,
              { signal: controller.signal, stream: false },
            );
            setState((s) => ({
              ...s,
              pending: false,
              messages: [...s.messages, retryRes.message],
              error: '',
            }));
            return retryRes;
          } catch {
            // 재시도 실패 시 오류 표기
          }
        }
        setState((s) => ({ ...s, pending: false, error: message }));
        return undefined;
      } finally {
        abortRef.current = null;
      }
    },
    [options?.blockWhilePending, options?.enableQueue, options?.maxTurns, options?.stream],
  );

  const processQueue = useCallback(async () => {
    if (stateRef.current.pending) return;
    const job = queueRef.current.shift();
    if (!job) return;
    await internalSend(job.content, job.meta);
    if (queueRef.current.length > 0) void processQueue();
  }, [internalSend]);

  const sendMessage = useCallback(
    async (content: string, meta?: ChatRequestMeta) => {
      if (options?.enableQueue && stateRef.current.pending) {
        if (meta !== undefined) {
          queueRef.current.push({ content, meta });
        } else {
          queueRef.current.push({ content });
        }
        // 큐가 새로 시작되었다면 처리 트리거
        if (queueRef.current.length === 1) void processQueue();
        return undefined;
      }
      return internalSend(content, meta);
    },
    [internalSend, options?.enableQueue, processQueue],
  );

  return useMemo<UseChatApi>(
    () => ({ state, setSession, sendMessage, abort, reset }),
    [state, setSession, sendMessage, abort, reset],
  );
}
