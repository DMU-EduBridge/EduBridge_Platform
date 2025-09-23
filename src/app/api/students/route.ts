import { parseJsonBody } from '@/lib/config/validation';
import { logger } from '@/lib/monitoring';
import { ValidationError, withErrorHandler } from '@/lib/utils/error-handler';
import { getPagination, getParam, getSearchParams, okJson } from '@/lib/utils/http';
import { getRequestId } from '@/lib/utils/request-context';
import { StudentListResponseSchema } from '@/server/dto/student';
import { studentService } from '@/server/services/student.service';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
export const dynamic = 'force-dynamic';
export const revalidate = 60; // 목록: 짧은 캐시

const createStudentSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  grade: z.string().min(1),
  subjects: z.array(z.string()).optional(),
  learningStyle: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
});

// 학생 목록 조회
async function getStudents(request: NextRequest) {
  const sp = getSearchParams(request);
  const search = getParam(sp, 'search');
  const grade = getParam(sp, 'grade');
  const status = getParam(sp, 'status');
  const { page, limit } = getPagination(sp);

  const { students, total } = await studentService.list({ search, grade, status, page, limit });
  logger.info('Students fetched successfully', {
    count: students.length,
    page,
    limit,
    requestId: getRequestId(request),
  });
  const payload = {
    students,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
  StudentListResponseSchema.parse(payload);
  return okJson(payload, 'private, max-age=60', request);
}

// 새 학생 생성
async function createStudent(request: NextRequest) {
  const raw = await request.json();
  const parsed = parseJsonBody(raw, createStudentSchema);

  if (!parsed.success) {
    throw new ValidationError('잘못된 요청 데이터입니다.');
  }

  const { name, email, grade, learningStyle, interests } = parsed.data;
  const student = await studentService.create({ name, email, grade, learningStyle, interests });

  logger.info('Student created successfully', { studentId: student.id });

  return NextResponse.json(student, { status: 201 });
}

export const GET = withErrorHandler(getStudents);
export const POST = withErrorHandler(createStudent);
