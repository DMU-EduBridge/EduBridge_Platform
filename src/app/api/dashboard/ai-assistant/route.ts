import { logger } from '@/lib/monitoring';
import { ChatRequestSchema } from '@/lib/validation/schemas';
import { ok, withAuth } from '@/server/http/handler';
import { aiAssistantService } from '@/server/services/dashboard/ai-assistant.service';
import { NextRequest } from 'next/server';

export async function GET() {
  return withAuth(async ({ userId }) => {
    const data = await aiAssistantService.getChatExamples(userId);
    logger.info('AI 어시스턴트 대화 예시 조회 성공', { userId });
    return new Response(JSON.stringify(ok(data)), {
      headers: { 'Content-Type': 'application/json' },
    });
  });
}

export async function POST(request: NextRequest) {
  return withAuth(async ({ userId }) => {
    const body = await request.json();
    const data = ChatRequestSchema.parse(body);

    const result = await aiAssistantService.processChatRequest(userId, data);
    logger.info('AI 어시스턴트 질문 처리 성공', {
      userId,
      messageId: result.id,
      messageType: data.messageType,
      subject: data.subject,
    });
    return new Response(JSON.stringify(ok(result)), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
