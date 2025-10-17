import { useCallback, useMemo, useRef, useState } from 'react';

export interface GenerateOptions {
  stream?: boolean;
  classId?: string;
  studentIds?: string[];
  depth?: 'quick' | 'standard' | 'deep';
  focus?: string[]; // 취약 개념 키워드 등
  regenerateOf?: string; // 기존 리포트 재생성 대상
}

export interface GenerateProgressEvent {
  type: 'start' | 'progress' | 'complete' | 'error';
  step?: string;
  progress?: number; // 0~100
  reportId?: string;
  message?: string;
}

export function useGenerateReport() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<GenerateProgressEvent | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [lastReportId, setLastReportId] = useState<string | undefined>(undefined);

  const start = useCallback(
    async (opts: GenerateOptions) => {
      if (running) return;
      setRunning(true);
      setProgress({ type: 'start', progress: 0, message: '시작합니다...' });

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        if (opts.stream) {
          const params = new URLSearchParams();
          params.set('stream', '1');
          if (opts.regenerateOf) params.set('regenerateOf', opts.regenerateOf);
          const url = `/api/teacher-reports/generate?${params.toString()}`;
          const res = await fetch(url, {
            method: 'POST',
            headers: { Accept: 'text/event-stream' },
            body: JSON.stringify(opts),
            signal: controller.signal,
          });
          if (!res.ok || !res.body) throw new Error('SSE 연결 실패');

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const parts = buffer.split('\n\n');
            buffer = parts.pop() || '';
            for (const part of parts) {
              const lines = part.split('\n');
              const eventLine = lines.find((l) => l.startsWith('event: '));
              const dataLine = lines.find((l) => l.startsWith('data: '));
              const event = eventLine ? eventLine.replace('event: ', '').trim() : 'message';
              const dataRaw = dataLine ? dataLine.replace('data: ', '') : '{}';
              try {
                const payload = JSON.parse(dataRaw);
                if (event === 'progress' || event === 'start') {
                  setProgress({ type: event as any, ...payload });
                } else if (event === 'complete') {
                  setProgress({ type: 'complete', ...payload, progress: 100 });
                  if (payload?.reportId) setLastReportId(payload.reportId);
                }
              } catch (e) {
                // ignore parse errors
              }
            }
          }
          setRunning(false);
        } else {
          const params = new URLSearchParams();
          if (opts.regenerateOf) params.set('regenerateOf', opts.regenerateOf);
          const res = await fetch(
            `/api/teacher-reports/generate${params.toString() ? `?${params.toString()}` : ''}`,
            {
              method: 'POST',
              signal: controller.signal,
            },
          );
          if (!res.ok) throw new Error('생성 요청 실패');
          const json = await res.json();
          setProgress({ type: 'complete', reportId: json.jobId, progress: 100 });
          if (json?.jobId) setLastReportId(json.jobId);
          setRunning(false);
        }
      } catch (e: any) {
        setProgress({ type: 'error', message: e?.message || '오류가 발생했습니다.' });
        setRunning(false);
      }
    },
    [running],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setRunning(false);
  }, []);

  return useMemo(
    () => ({ running, progress, start, cancel, lastReportId }),
    [running, progress, start, cancel, lastReportId],
  );
}
