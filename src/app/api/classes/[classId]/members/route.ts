import { ApiError, ApiSuccess } from '@/lib/api-response';
import { authOptions } from '@/lib/core/auth';
import { classService } from '@/server/services/classes/class.service';
import { AddMemberRequest } from '@/types/domain/class';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { z } from 'zod';

const addMemberSchema = z.object({
  userId: z.string().min(1, '사용자 ID는 필수입니다'),
  role: z.enum(['STUDENT', 'ASSISTANT', 'TEACHER']).optional().default('STUDENT'),
});

export async function GET(request: NextRequest, { params }: { params: { classId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiError.unauthorized();
    }

    const { classId } = params;
    const members = await classService.getClassMembers(classId, session.user.id);
    return ApiSuccess.ok(members);
  } catch (error) {
    console.error('GET /api/classes/[classId]/members error:', error);
    return ApiError.internalError();
  }
}

export async function POST(request: NextRequest, { params }: { params: { classId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiError.unauthorized();
    }

    if (!['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return ApiError.forbidden('교사 또는 관리자만 멤버를 추가할 수 있습니다');
    }

    const { classId } = params;
    const body = await request.json();
    const validatedData = addMemberSchema.parse(body) as AddMemberRequest;

    await classService.addMember(classId, validatedData, session.user.id);
    return ApiSuccess.created({ message: '멤버가 추가되었습니다' });
  } catch (error) {
    console.error('POST /api/classes/[classId]/members error:', error);
    return ApiError.internalError();
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { classId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiError.unauthorized();
    }

    if (!['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return ApiError.forbidden('교사 또는 관리자만 멤버를 제거할 수 있습니다');
    }

    const { classId } = params;
    const { searchParams } = new URL(request.url);
    const memberUserId = searchParams.get('userId');

    if (!memberUserId) {
      return ApiError.badRequest('사용자 ID가 필요합니다');
    }

    await classService.removeMember(classId, memberUserId, session.user.id);
    return ApiSuccess.ok({ message: '멤버가 제거되었습니다' });
  } catch (error) {
    console.error('DELETE /api/classes/[classId]/members error:', error);
    return ApiError.internalError();
  }
}
