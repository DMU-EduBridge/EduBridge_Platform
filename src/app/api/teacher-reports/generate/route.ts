import { authOptions } from '@/lib/core/auth';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request): Promise<Response> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const accept = req.headers.get('accept') || '';
  const url = new URL(req.url);
  const wantsStream =
    accept.includes('text/event-stream') || url.searchParams.get('stream') === '1';
  const regenerateOf = url.searchParams.get('regenerateOf') || undefined;

  // 폴백: 스트림이 아닐 때는 잡 생성된 것처럼 응답
  if (!wantsStream) {
    return NextResponse.json(
      { jobId: `job_${Date.now()}`, status: 'queued', regenerateOf },
      { status: 200 },
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      function send(event: string, data: unknown) {
        controller.enqueue(encoder.encode(`event: ${event}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      // 모의 진행 단계
      send('start', {
        message: regenerateOf ? 'Regenerating report...' : 'Generating report...',
        progress: 0,
        regenerateOf,
      });
      await new Promise((r) => setTimeout(r, 400));
      send('progress', { step: 'fetch_data', progress: 20 });
      await new Promise((r) => setTimeout(r, 400));
      send('progress', { step: 'analyze', progress: 55 });
      await new Promise((r) => setTimeout(r, 400));
      send('progress', { step: 'assemble', progress: 85 });
      await new Promise((r) => setTimeout(r, 400));
      send('complete', { reportId: `rep_${Date.now()}`, progress: 100 });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
