import { ApiError, ApiSuccess } from '@/lib/api-response';
import { authOptions } from '@/lib/core/auth';
import { classService } from '@/server/services/classes/class.service';
import { UpdateClassRequest } from '@/types/domain/class';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { z } from 'zod';

const updateClassSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  subject: z.string().min(1).optional(),
  gradeLevel: z.string().min(1).optional(),
  schoolYear: z.string().min(1).optional(),
  semester: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest, { params }: { params: { classId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiError.unauthorized();
    }

    const { classId } = params;
    const cls = await classService.getClassById(classId, session.user.id);

    if (!cls) {
      return ApiError.notFound('클래스를 찾을 수 없습니다');
    }

    return ApiSuccess.ok(cls);
  } catch (error) {
    console.error('GET /api/classes/[classId] error:', error);
    return ApiError.internalError();
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { classId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiError.unauthorized();
    }

    if (!['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return ApiError.forbidden('교사 또는 관리자만 클래스를 수정할 수 있습니다');
    }

    const { classId } = params;
    const body = await request.json();
    const validatedData = updateClassSchema.parse(body) as UpdateClassRequest;

    const updatedClass = await classService.updateClass(classId, validatedData, session.user.id);
    return ApiSuccess.ok(updatedClass);
  } catch (error) {
    console.error('PATCH /api/classes/[classId] error:', error);
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
      return ApiError.forbidden('교사 또는 관리자만 클래스를 삭제할 수 있습니다');
    }

    const { classId } = params;
    await classService.deleteClass(classId, session.user.id);
    return ApiSuccess.ok({ message: '클래스가 삭제되었습니다' });
  } catch (error) {
    console.error('DELETE /api/classes/[classId] error:', error);
    return ApiError.internalError();
  }
}
