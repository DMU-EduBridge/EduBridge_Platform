import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { logger } from '@/lib/monitoring';
import { GradeLevel, UserRole } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const InviteStudentSchema = z.object({
  name: z.string().min(1, '이름은 필수입니다.'),
  email: z.string().email('유효한 이메일 주소를 입력해주세요.'),
  gradeLevel: z.nativeEnum(GradeLevel, {
    errorMap: () => ({ message: '유효한 학년을 선택해주세요.' }),
  }),
  message: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 교사만 학생을 초대할 수 있도록 제한
    if (session.user.role !== 'TEACHER') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const data = InviteStudentSchema.parse(body);

    // 이메일 중복 확인
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: '해당 이메일로 등록된 사용자가 없습니다.',
          suggestion: '학생이 먼저 회원가입을 완료한 후 다시 시도해주세요.',
        },
        { status: 404 },
      );
    }

    if (existingUser.role !== UserRole.STUDENT) {
      return NextResponse.json(
        {
          success: false,
          error: '해당 사용자는 학생이 아닙니다.',
          suggestion: '학생 계정으로 가입된 이메일 주소를 입력해주세요.',
        },
        { status: 400 },
      );
    }

    // 이미 교사와 학생 관계가 등록되어 있는지 확인
    const existingRelation = await prisma.teacherStudent.findUnique({
      where: {
        teacherId_studentId: {
          teacherId: session.user.id,
          studentId: existingUser.id,
        },
      },
    });

    if (existingRelation) {
      return NextResponse.json(
        {
          success: false,
          error: '이미 이 학생과 관계가 등록되어 있습니다.',
          suggestion: '다른 학생의 이메일 주소를 입력하거나, 이미 연결된 학생 목록을 확인해주세요.',
        },
        { status: 409 },
      );
    }

    // 교사-학생 관계 저장
    const teacherStudentRelation = await prisma.teacherStudent.create({
      data: {
        teacherId: session.user.id, // 현재 세션의 교사 ID
        studentId: existingUser.id, // 새로 생성된 학생 ID
      },
    });

    logger.info('학생 연결 성공', {
      userId: session.user.id,
      studentId: existingUser.id,
      studentEmail: existingUser.email,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          teacherStudentRelation,
          student: {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            gradeLevel: existingUser.gradeLevel,
          },
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    logger.error('학생 초대 실패', undefined, { error: error.message });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
