import { authOptions } from '@/lib/core/auth';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const EnvSchema = z.object({ NEXT_PUBLIC_FASTAPI_URL: z.string().url() });

const AnalyzeReqSchema = z.object({
  user_id: z.string().min(1).optional(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const env = EnvSchema.safeParse({ NEXT_PUBLIC_FASTAPI_URL: process.env.NEXT_PUBLIC_FASTAPI_URL });
  const isDev = process.env.NODE_ENV !== 'production';
  if (!env.success) {
    if (isDev) {
      // 개발 모드 목업 응답
      return NextResponse.json(
        { result: { summary: '개발 모드 목업 분석 결과' } },
        { status: 200 },
      );
    }
    return NextResponse.json(
      { success: false, error: 'LLM server URL not configured' },
      { status: 500 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = AnalyzeReqSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Bad Request' }, { status: 400 });
  }

  const base = env.data.NEXT_PUBLIC_FASTAPI_URL.replace(/\/$/, '');
  const upstreamUrl = `${base}/analyze-student-performance`;

  try {
    const res = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': session.user.id,
      },
      body: JSON.stringify({ user_id: parsed.data.user_id ?? session.user.id }),
    });

    if (!res.ok) {
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
        { result: { summary: '개발 모드 네트워크 예외 목업 결과' } },
        { status: 200 },
      );
    }
    return NextResponse.json({ success: false, error: 'Upstream exception' }, { status: 500 });
  }
}
