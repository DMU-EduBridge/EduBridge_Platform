import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { chatbotService } from '@/server/services/chatbot.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 챗봇 요청 스키마
const ChatbotRequestSchema = z.object({
  message: z.string().min(1, '메시지는 필수입니다.'),
  context: z.string().optional(),
  userId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = ChatbotRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const response = await chatbotService.chat(parsed.data);
    return NextResponse.json(response);
  } catch (error) {
    logger.error('챗봇 API 오류', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '챗봇 응답 생성에 실패했습니다.' }, { status: 500 });
  }
}
