const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side
    return '';
  }
  // Server-side
  return process.env.NEXTAUTH_URL || 'http://localhost:3000';
};

export const aiLLMService = {
  analyzeStudentPerformance: async (userId: string) => {
    // Use Next.js bridge route to handle auth/session and CORS
    const res = await fetch(`${getBaseUrl()}/api/ai/bridge/analyze-student-performance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    });
    if (!res.ok) {
      // Try to extract meaningful error payload
      const text = await res.text().catch(() => '');
      let message = '학습 성과 분석 호출 실패';
      try {
        const json = JSON.parse(text);
        message = json?.error || json?.detail || message;
      } catch {}
      throw new Error(message);
    }
    return res.json();
  },

  chatMessage: async (params: { userId: string; userMessage: string; history?: any[] }) => {
    // Use Next.js bridge route to handle auth/session and CORS
    const invoke = () =>
      fetch(`${getBaseUrl()}/api/ai/bridge/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: params.userId,
          user_message: params.userMessage,
          history: params.history ?? [],
        }),
      });

    const res = await invoke();

    // 브리지 라우트는 개발 모드에서 항상 200 상태 코드로 응답하므로
    // res.ok 체크를 제거하고 직접 JSON 파싱
    try {
      const data = await res.json();

      // 에러 응답인 경우에만 처리
      if (!res.ok) {
        const detail = data?.detail || data?.error || '챗봇 메시지 호출 실패';
        const needsAnalysis =
          res.status === 404 && /analysis context|generate a report/i.test(detail);
        if (needsAnalysis) {
          try {
            await aiLLMService.analyzeStudentPerformance(params.userId);
            const retryRes = await invoke();
            const retryData = await retryRes.json();
            if (retryRes.ok) return retryData;
          } catch {
            // ignore and fallthrough
          }
        }
        throw new Error(detail);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('챗봇 메시지 호출 실패');
    }
  },
};
