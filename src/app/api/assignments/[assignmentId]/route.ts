import { ApiError, ApiSuccess } from '@/lib/api-response';
import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { assignmentService } from '@/server/services/assignments/assignment.service';
import { UpdateAssignmentRequest } from '@/types/domain/assignment';
import { AssignmentStatus } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { z } from 'zod';

const updateAssignmentSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다').optional(),
  description: z.string().optional(),
  status: z.nativeEnum(AssignmentStatus).optional(),
  dueDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  instructions: z.string().optional(),
  metadata: z.any().optional(),
});

export async function GET(request: NextRequest, { params }: { params: { assignmentId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiError.unauthorized();
    }

    if (!['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return ApiError.forbidden('교사 또는 관리자만 배정을 조회할 수 있습니다');
    }

    const assignment = await assignmentService.getAssignmentById(
      params.assignmentId,
      session.user.id,
    );
    if (!assignment) {
      return ApiError.notFound('배정을 찾을 수 없습니다');
    }

    logger.info('배정 조회 성공', { userId: session.user.id, assignmentId: params.assignmentId });
    return ApiSuccess.ok(assignment);
  } catch (error) {
    console.error('GET /api/assignments/[assignmentId] error:', error);
    return ApiError.internalError();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { assignmentId: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiError.unauthorized();
    }

    if (!['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return ApiError.forbidden('교사 또는 관리자만 배정을 수정할 수 있습니다');
    }

    const body = await request.json();
    const validatedData = updateAssignmentSchema.parse(body) as UpdateAssignmentRequest;

    const assignment = await assignmentService.updateAssignment(
      params.assignmentId,
      validatedData,
      session.user.id,
    );
    logger.info('배정 수정 성공', { userId: session.user.id, assignmentId: params.assignmentId });
    return ApiSuccess.ok(assignment);
  } catch (error) {
    console.error('PATCH /api/assignments/[assignmentId] error:', error);
    if (error instanceof z.ZodError) {
      return ApiError.badRequest('입력 데이터가 올바르지 않습니다', error.errors);
    }
    if (error instanceof Error) {
      return ApiError.badRequest(error.message);
    }
    return ApiError.internalError();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { assignmentId: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiError.unauthorized();
    }

    if (!['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return ApiError.forbidden('교사 또는 관리자만 배정을 삭제할 수 있습니다');
    }

    await assignmentService.deleteAssignment(params.assignmentId, session.user.id);
    logger.info('배정 삭제 성공', { userId: session.user.id, assignmentId: params.assignmentId });
    return ApiSuccess.ok({ message: '배정이 삭제되었습니다' });
  } catch (error) {
    console.error('DELETE /api/assignments/[assignmentId] error:', error);
    if (error instanceof Error) {
      return ApiError.badRequest(error.message);
    }
    return ApiError.internalError();
  }
}
