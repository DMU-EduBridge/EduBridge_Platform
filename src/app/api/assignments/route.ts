import { ApiError, ApiSuccess } from '@/lib/api-response';
import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { assignmentService } from '@/server/services/assignments/assignment.service';
import { AssignmentFilters, CreateAssignmentRequest } from '@/types/domain/assignment';
import { AssignmentType } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { z } from 'zod';

const createAssignmentSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다'),
  description: z.string().optional(),
  assignmentType: z.nativeEnum(AssignmentType),
  classId: z.string().optional(),
  studentId: z.string().optional(),
  problemIds: z.array(z.string()).min(1, '최소 하나의 문제를 선택해야 합니다'),
  dueDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  instructions: z.string().optional(),
  metadata: z.any().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiError.unauthorized();
    }

    if (!['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return ApiError.forbidden('교사 또는 관리자만 배정을 조회할 수 있습니다');
    }

    const { searchParams } = new URL(request.url);
    const filters: AssignmentFilters = {};

    if (searchParams.get('classId')) {
      filters.classId = searchParams.get('classId')!;
    }
    if (searchParams.get('studentId')) {
      filters.studentId = searchParams.get('studentId')!;
    }
    if (searchParams.get('assignmentType')) {
      filters.assignmentType = searchParams.get('assignmentType') as AssignmentType;
    }
    if (searchParams.get('status')) {
      filters.status = searchParams.get('status') as any;
    }
    if (searchParams.get('startDate')) {
      filters.startDate = new Date(searchParams.get('startDate')!);
    }
    if (searchParams.get('endDate')) {
      filters.endDate = new Date(searchParams.get('endDate')!);
    }

    const assignments = await assignmentService.getAssignments(session.user.id, filters);
    logger.info('배정 목록 조회 성공', { userId: session.user.id, count: assignments.length });
    return ApiSuccess.ok(assignments);
  } catch (error) {
    console.error('GET /api/assignments error:', error);
    return ApiError.internalError();
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiError.unauthorized();
    }

    if (!['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return ApiError.forbidden('교사 또는 관리자만 배정을 생성할 수 있습니다');
    }

    const body = await request.json();
    const validatedData = createAssignmentSchema.parse(body) as CreateAssignmentRequest;

    const assignment = await assignmentService.createAssignment(validatedData, session.user.id);
    logger.info('배정 생성 성공', { userId: session.user.id, assignmentId: assignment.id });
    return ApiSuccess.created(assignment);
  } catch (error) {
    console.error('POST /api/assignments error:', error);
    if (error instanceof z.ZodError) {
      return ApiError.badRequest('입력 데이터가 올바르지 않습니다', error.errors);
    }
    if (error instanceof Error) {
      return ApiError.badRequest(error.message);
    }
    return ApiError.internalError();
  }
}
