import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { userService } from '@/server';
import { CreateUserRequest, UserQueryParams } from '@/types/domain/user';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 사용자 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 관리자만 사용자 목록 조회 가능
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query: UserQueryParams = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      search: searchParams.get('search') || undefined,
      role: (searchParams.get('role') as 'STUDENT' | 'TEACHER' | 'ADMIN') || undefined,
      status: (searchParams.get('status') as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') || undefined,
      subject: searchParams.get('subject') || undefined,
      gradeLevel: searchParams.get('gradeLevel') || undefined,
    };

    const result = await userService.getUsers(query);

    return NextResponse.json({
      success: true,
      data: {
        users: result.users,
        pagination: result.pagination,
        total: result.total,
      },
    });
  } catch (error) {
    logger.error('사용자 목록 조회 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '사용자 목록 조회에 실패했습니다.' }, { status: 500 });
  }
}

/**
 * 사용자 생성
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 관리자만 사용자 생성 가능
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const data: CreateUserRequest = body;

    const user = await userService.createUser(data);

    return NextResponse.json(
      {
        success: true,
        data: user,
        message: '사용자가 성공적으로 생성되었습니다.',
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error('사용자 생성 실패', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '사용자 생성에 실패했습니다.' }, { status: 500 });
  }
}
