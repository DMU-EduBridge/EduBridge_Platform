import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { userService } from '@/server';
import {
  CreateUserDto,
  UserListQueryDto,
  UserListResponseSchema,
  UserResponseDto,
  UserStatsSchema,
} from '@/server/dto/user';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 사용자 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // 관리자만 사용자 목록 조회 가능
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      role: searchParams.get('role') || undefined,
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const parsed = UserListQueryDto.safeParse(query);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const result = await userService.getUsers(parsed.data);

    // 응답 스키마 검증
    const response = UserListResponseSchema.parse({
      users: result.users,
      pagination: result.pagination,
    });

    return NextResponse.json(response);
  } catch (error) {
    logger.error('사용자 목록 조회 API 오류', undefined, {
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

    // 관리자만 사용자 생성 가능
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = CreateUserDto.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const user = await userService.createUser(parsed.data);

    // 응답 스키마 검증
    const response = UserResponseDto.parse(user);

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    logger.error('사용자 생성 API 오류', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof Error && error.message.includes('이미 존재하는 이메일')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json({ error: '사용자 생성에 실패했습니다.' }, { status: 500 });
  }
}

/**
 * 사용자 통계 조회
 */
export async function PUT() {
  try {
    const session = await getServerSession(authOptions);

    // 관리자만 통계 조회 가능
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const stats = await userService.getUserStats();

    // 응답 스키마 검증
    const response = UserStatsSchema.parse(stats);

    return NextResponse.json(response);
  } catch (error) {
    logger.error('사용자 통계 조회 API 오류', undefined, {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '사용자 통계 조회에 실패했습니다.' }, { status: 500 });
  }
}
