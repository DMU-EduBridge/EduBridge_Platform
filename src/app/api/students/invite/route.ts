import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { logger } from '@/lib/monitoring';
import { GradeLevel, UserRole, UserStatus } from '@prisma/client';
import { hash } from 'bcryptjs';
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

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: '이미 등록된 이메일 주소입니다.' },
        { status: 409 },
      );
    }

    // 임시 비밀번호 생성 및 해싱
    const temporaryPassword = Math.random().toString(36).slice(-8); // 8자리 랜덤 문자열
    const hashedPassword = await hash(temporaryPassword, 10);

    const newStudent = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: UserRole.STUDENT,
        status: UserStatus.ACTIVE,
        gradeLevel: data.gradeLevel,
        // TODO: 초대 메시지 처리 로직 추가 (예: 이메일 발송)
      },
    });

    logger.info('학생 초대 성공', {
      userId: session.user.id,
      studentId: newStudent.id,
      studentEmail: newStudent.email,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: newStudent.id,
          name: newStudent.name,
          email: newStudent.email,
          gradeLevel: newStudent.gradeLevel,
          status: newStudent.status,
          temporaryPassword: temporaryPassword, // 임시 비밀번호는 클라이언트에 반환하지 않도록 주의
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    logger.error('학생 초대 실패', undefined, { error: error.message });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
