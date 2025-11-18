import { RetryManager } from '@/lib/ai-server/retry-manager';
import { AI_TIMEOUT_CONFIG, fetchWithTimeout } from '@/lib/ai-server/timeout-config';
import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const EnvSchema = z.object({ NEXT_PUBLIC_FASTAPI_URL: z.string().url().optional() });

const ChatMessageReqSchema = z.object({
  user_id: z.string().min(1).optional(),
  user_message: z.string().min(1),
  history: z.array(z.any()).default([]),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const env = EnvSchema.safeParse({
      NEXT_PUBLIC_FASTAPI_URL: process.env.NEXT_PUBLIC_FASTAPI_URL,
    });
    const isDev = process.env.NODE_ENV !== 'production';

    const body = await req.json().catch(() => null);
    const parsed = ChatMessageReqSchema.safeParse(body ?? {});
    if (!parsed.success) {
      logger.warn('Invalid chat message request', {
        userId: session.user.id,
        errors: parsed.error.errors,
      });
      return NextResponse.json({ success: false, error: 'Bad Request' }, { status: 400 });
    }

    const base = (env.data?.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000').replace(/\/$/, '');
    const upstreamUrl = `${base}/chat/message`;

    const result = await RetryManager.executeWithRetry(async () => {
      const res = await fetchWithTimeout(
        upstreamUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': session.user.id,
          },
          body: JSON.stringify({
            user_id: parsed.data.user_id ?? session.user.id,
            user_message: parsed.data.user_message,
            history: parsed.data.history ?? [],
          }),
        },
        AI_TIMEOUT_CONFIG.CHAT_MESSAGE,
      );

      if (!res.ok) {
        const contentType = res.headers.get('content-type') ?? '';
        if (contentType.includes('application/json')) {
          const errJson = await res.json().catch(() => ({ detail: 'Upstream JSON parse error' }));
          throw new Error(`Upstream error: ${JSON.stringify(errJson)}`);
        }
        const text = await res.text().catch(() => '');
        throw new Error(`Upstream error: ${text || 'Unknown error'}`);
      }

      const json = await res.json().catch(() => ({}));
      return json;
    }, RetryManager.getChatServiceConfig());

    const duration = Date.now() - startTime;

    if (!result.success) {
      logger.error('Chat message bridge failed', result.error, {
        userId: session.user.id,
        duration,
        attempts: result.attempts,
      });

      if (isDev) {
        return NextResponse.json(
          { ai_response: '개발 모드 네트워크 예외 목업', updated_history: [] },
          { status: 200 },
        );
      }
      return NextResponse.json({ success: false, error: 'Upstream exception' }, { status: 500 });
    }

    logger.info('Chat message bridge completed', {
      userId: session.user.id,
      duration,
      attempts: result.attempts,
      success: true,
    });

    return NextResponse.json(result.data, { status: 200 });
  } catch (err: any) {
    const duration = Date.now() - startTime;
    logger.error('Chat message bridge unexpected error', err, {
      duration,
    });

    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json(
        { ai_response: '개발 모드 예외 목업', updated_history: [] },
        { status: 200 },
      );
    }
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
