import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { logger } from '@/lib/monitoring';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 학생 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 교사만 접근 가능
    if (session.user.role !== 'TEACHER') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const teacherId = session.user.id; // 현재 로그인된 교사의 ID
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || undefined;
    const grade = searchParams.get('grade') || undefined;
    const status = searchParams.get('status') || undefined;

    const skip = (page - 1) * limit;

    // 1. TeacherStudent 테이블에서 studentId 가져오기
    const studentRelations = await prisma.teacherStudent.findMany({
      where: {
        teacherId,
      },
      select: {
        studentId: true, // studentId만 가져오기
      },
      skip,
      take: Number(limit),
    });

    const studentIds = studentRelations.map((relation) => relation.studentId);

    // 2. User 테이블에서 학생 데이터 가져오기
    const students = await prisma.user.findMany({
      where: {
        id: { in: studentIds },
        role: 'STUDENT', // 학생만 필터링
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(grade && { gradeLevel: grade }),
        ...(status && { status: status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE' }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        gradeLevel: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // 3. 총 학생 수 계산
    const total = await prisma.user.count({
      where: {
        id: { in: studentIds },
        role: 'STUDENT',
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }),
        ...(grade && { gradeLevel: grade }),
        ...(status && { status: status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE' }),
      },
    });

    logger.info('학생 목록 조회 성공', {
      userId: teacherId,
      count: students.length,
      total,
    });
    return NextResponse.json({
      success: true,
      data: {
        students,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    logger.error('학생 목록 조회 실패', undefined, { error: error.message });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
