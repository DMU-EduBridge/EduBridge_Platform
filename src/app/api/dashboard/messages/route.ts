import { logger } from '@/lib/monitoring';
import { MessageCreateSchema, MessageUpdateSchema } from '@/lib/validation/schemas';
import { ok, withAuth } from '@/server/http/handler';
import { messagesService } from '@/server/services/dashboard/messages.service';
import { NextRequest } from 'next/server';

export async function GET() {
  return withAuth(async ({ userId }) => {
    const data = await messagesService.getMessages(userId);
    logger.info('메시지 조회 성공', { userId, count: data.length });
    return new Response(JSON.stringify(ok(data)), {
      headers: { 'Content-Type': 'application/json' },
    });
  });
}

export async function POST(request: NextRequest) {
  return withAuth(async ({ userId, session }) => {
    const body = await request.json();
    const data = MessageCreateSchema.parse(body);

    const result = await messagesService.createMessage(userId, data, session?.user.name || '익명');
    logger.info('메시지 생성 성공', {
      userId,
      messageId: result.id,
      recipientId: data.recipientId,
    });
    return new Response(JSON.stringify(ok(result)), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}

export async function PATCH(request: NextRequest) {
  return withAuth(async ({ userId }) => {
    const body = await request.json();
    const data = MessageUpdateSchema.parse(body);

    const result = await messagesService.updateMessage(userId, data);
    logger.info('메시지 업데이트 성공', { userId, messageId: data.id, isRead: data.isRead });
    return new Response(JSON.stringify(ok(result)), {
      headers: { 'Content-Type': 'application/json' },
    });
  });
}
