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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || undefined;
    const grade = searchParams.get('grade') || undefined;
    const status = searchParams.get('status') || undefined;

    const skip = (page - 1) * limit;

    // 학생 조회 (교사가 생성한 클래스의 학생들만)
    const where: any = {
      role: 'STUDENT',
    };

    if (search) {
      where.OR = [{ name: { contains: search } }, { email: { contains: search } }];
    }

    if (grade) {
      where.gradeLevel = grade;
    }

    if (status) {
      where.status = status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
    }

    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          gradeLevel: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    logger.info('학생 목록 조회 성공', {
      userId: session.user.id,
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
