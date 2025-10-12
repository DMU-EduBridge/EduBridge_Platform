import { ApiError, ApiSuccess } from '@/lib/api-response';
import { authOptions } from '@/lib/core/auth';
import { classService } from '@/server/services/classes/class.service';
import { CreateClassRequest } from '@/types/domain/class';
import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { z } from 'zod';

const createClassSchema = z.object({
  name: z.string().min(1, '클래스명은 필수입니다'),
  description: z.string().optional(),
  subject: z.string().min(1, '과목은 필수입니다'),
  gradeLevel: z.string().min(1, '학년은 필수입니다'),
  schoolYear: z.string().min(1, '학년도는 필수입니다'),
  semester: z.string().min(1, '학기는 필수입니다'),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiError.unauthorized();
    }

    if (!['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return ApiError.forbidden('교사 또는 관리자만 클래스 목록을 조회할 수 있습니다');
    }

    const classes = await classService.getTeacherClasses(session.user.id);
    return ApiSuccess.ok(classes);
  } catch (error) {
    console.error('GET /api/classes error:', error);
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
      return ApiError.forbidden('교사 또는 관리자만 클래스를 생성할 수 있습니다');
    }

    const body = await request.json();
    const validatedData = createClassSchema.parse(body) as CreateClassRequest;

    const newClass = await classService.createClass(validatedData, session.user.id);
    return ApiSuccess.created(newClass);
  } catch (error) {
    console.error('POST /api/classes error:', error);
    return ApiError.internalError();
  }
}
