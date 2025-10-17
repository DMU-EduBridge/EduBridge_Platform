import { authOptions } from '@/lib/core/auth';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const EnvSchema = z.object({ NEXT_PUBLIC_FASTAPI_URL: z.string().url() });

const ChatReqSchema = z.object({
  sessionId: z.string(),
  messages: z.array(
    z.object({ role: z.enum(['user', 'assistant', 'system']), content: z.string() }),
  ),
  meta: z
    .object({
      grade: z.string().optional(),
      subject: z.string().optional(),
      unit: z.string().optional(),
    })
    .optional(),
  stream: z.boolean().optional(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const isDev = process.env.NODE_ENV !== 'production';
  const wantsStream = req.nextUrl.searchParams.get('stream') === '1';
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const env = EnvSchema.safeParse({ NEXT_PUBLIC_FASTAPI_URL: process.env.NEXT_PUBLIC_FASTAPI_URL });
  if (!env.success) {
    if (isDev) {
      // 개발 환경: 환경변수 없을 때도 목업으로 동작
      if (wantsStream) {
        const encoder = new TextEncoder();
        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            const chunks = ['안', '녕하세요', '. ', '환경변수 ', '없어도 ', '스트리밍 ', '목업!'];
            for (const piece of chunks) {
              const line = `data: ${JSON.stringify({ choices: [{ delta: { content: piece } }] })}\n\n`;
              controller.enqueue(encoder.encode(line));
              await new Promise((r) => setTimeout(r, 120));
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          },
        });
        return new NextResponse(stream, {
          status: 200,
          headers: {
            'content-type': 'text/event-stream',
            'cache-control': 'no-cache',
            connection: 'keep-alive',
          },
        });
      }
      // 비스트리밍 목업 JSON
      const body = await req.json().catch(() => null);
      const parsed = ChatReqSchema.safeParse(body);
      const sessionId = parsed.success ? parsed.data.sessionId : 'dev-session';
      await new Promise((resolve) => setTimeout(resolve, 300));
      return NextResponse.json(
        {
          conversationId: sessionId,
          message: { role: 'assistant', content: '개발 모드 목업 응답입니다.' },
          citations: [],
          usage: { tokensPrompt: 0, tokensCompletion: 0, tokensTotal: 0 },
        },
        { status: 200 },
      );
    }
    return NextResponse.json(
      { success: false, error: 'LLM server URL not configured' },
      { status: 500 },
    );
  }
  const base = env.data.NEXT_PUBLIC_FASTAPI_URL.replace(/\/$/, '');

  const body = await req.json().catch(() => null);
  const parsed = ChatReqSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Bad Request' }, { status: 400 });
  }

  const upstreamUrl = `${base}/chat`;

  // 개발 환경에서 스트리밍 목업 (?stream=1)
  if (isDev && wantsStream) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        // 간단한 토큰 청크들
        const chunks = ['안', '녕하세요', '. ', '모의 ', '스트리밍 ', '응답입니다.'];
        for (const piece of chunks) {
          const line = `data: ${JSON.stringify({ choices: [{ delta: { content: piece } }] })}\n\n`;
          controller.enqueue(encoder.encode(line));
          await new Promise((r) => setTimeout(r, 150));
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    return new NextResponse(stream, {
      status: 200,
      headers: {
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache',
        connection: 'keep-alive',
      },
    });
  }

  try {
    // 스트리밍 요청이면 text/event-stream을 그대로 파이프 시도
    const controller = new AbortController();
    const res = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': session.user.id,
      },
      body: JSON.stringify(parsed.data),
      signal: controller.signal,
    });

    const contentType = res.headers.get('content-type') ?? '';
    if (contentType.includes('text/event-stream')) {
      return new NextResponse(res.body, {
        status: res.status,
        headers: {
          'content-type': 'text/event-stream',
          'cache-control': 'no-cache',
          connection: 'keep-alive',
        },
      });
    }

    // JSON 응답 전달
    if (!res.ok) {
      if (isDev) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return NextResponse.json(
          {
            conversationId: parsed.data.sessionId,
            message: { role: 'assistant', content: '개발 모드: 업스트림 오류로 목업 응답' },
            citations: [],
            usage: { tokensPrompt: 0, tokensCompletion: 0, tokensTotal: 0 },
          },
          { status: 200 },
        );
      }
      return NextResponse.json({ success: false, error: 'Upstream error' }, { status: res.status });
    }

    const json = await res.json().catch(() => ({ success: false, error: 'Upstream parse error' }));
    return NextResponse.json(json, { status: res.status });
  } catch (err) {
    // 네트워크 예외, 타임아웃 등
    if (isDev) {
      if (wantsStream) {
        const encoder = new TextEncoder();
        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            const chunks = ['업', '스트', '림 ', '연', '결 ', '오류 ', '목업'];
            for (const piece of chunks) {
              const line = `data: ${JSON.stringify({ choices: [{ delta: { content: piece } }] })}\n\n`;
              controller.enqueue(encoder.encode(line));
              await new Promise((r) => setTimeout(r, 120));
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          },
        });
        return new NextResponse(stream, {
          status: 200,
          headers: {
            'content-type': 'text/event-stream',
            'cache-control': 'no-cache',
            connection: 'keep-alive',
          },
        });
      }
      return NextResponse.json(
        {
          conversationId: parsed.data.sessionId,
          message: { role: 'assistant', content: '개발 모드: 네트워크 예외 목업 응답' },
          citations: [],
          usage: { tokensPrompt: 0, tokensCompletion: 0, tokensTotal: 0 },
        },
        { status: 200 },
      );
    }
    return NextResponse.json({ success: false, error: 'Upstream exception' }, { status: 500 });
  }
}
