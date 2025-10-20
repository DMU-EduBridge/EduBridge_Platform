import { authOptions } from '@/lib/core/auth';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const EnvSchema = z.object({ NEXT_PUBLIC_FASTAPI_URL: z.string().url() });

const ChatMessageReqSchema = z.object({
  user_id: z.string().min(1).optional(),
  user_message: z.string().min(1),
  history: z.array(z.any()).default([]),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  console.log('Chat message bridge route called');
  const session = await getServerSession(authOptions);
  console.log('Session:', session?.user?.id ? 'authenticated' : 'not authenticated');
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const env = EnvSchema.safeParse({ NEXT_PUBLIC_FASTAPI_URL: process.env.NEXT_PUBLIC_FASTAPI_URL });
  const isDev = process.env.NODE_ENV !== 'production';
  console.log('Environment check:', {
    envSuccess: env.success,
    isDev,
    fastApiUrl: process.env.NEXT_PUBLIC_FASTAPI_URL,
  });

  if (!env.success) {
    return NextResponse.json(
      { success: false, error: 'LLM server URL not configured' },
      { status: 500 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = ChatMessageReqSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Bad Request' }, { status: 400 });
  }

  const base = env.data.NEXT_PUBLIC_FASTAPI_URL.replace(/\/$/, '');
  const upstreamUrl = `${base}/chat/message`;

  try {
    const res = await fetch(upstreamUrl, {
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
    });

    if (!res.ok) {
      // Try to proxy upstream JSON error as-is for easier debugging
      const contentType = res.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        const errJson = await res.json().catch(() => ({ detail: 'Upstream JSON parse error' }));
        return NextResponse.json(errJson, { status: res.status });
      }
      const text = await res.text().catch(() => '');
      return NextResponse.json({ detail: text || 'Upstream error' }, { status: res.status });
    }

    const json = await res.json().catch(() => ({}));
    return NextResponse.json(json, { status: 200 });
  } catch (err: any) {
    if (isDev) {
      return NextResponse.json(
        { ai_response: '개발 모드 네트워크 예외 목업', updated_history: [] },
        { status: 200 },
      );
    }
    return NextResponse.json({ success: false, error: 'Upstream exception' }, { status: 500 });
  }
}
