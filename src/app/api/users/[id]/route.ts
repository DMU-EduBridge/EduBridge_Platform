import { authOptions } from '@/lib/core/auth';
import { logger } from '@/lib/monitoring';
import { userService } from '@/server';
import { UpdateUserDto, UserResponseDto, UserRoleSetupDto } from '@/server/dto/user';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 특정 사용자 조회
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    // 본인 또는 관리자만 조회 가능
    if (!session?.user?.id || (session.user.id !== params.id && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const user = await userService.getUserById(params.id);

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 응답 스키마 검증
    const response = UserResponseDto.parse(user);

    return NextResponse.json(response);
  } catch (error) {
    logger.error('사용자 조회 API 오류', undefined, {
      userId: params.id,
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: '사용자 조회에 실패했습니다.' }, { status: 500 });
  }
}

/**
 * 사용자 정보 업데이트
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    // 본인 또는 관리자만 업데이트 가능
    if (!session?.user?.id || (session.user.id !== params.id && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = UpdateUserDto.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const user = await userService.updateUser(params.id, parsed.data);

    // 응답 스키마 검증
    const response = UserResponseDto.parse(user);

    return NextResponse.json(response);
  } catch (error) {
    logger.error('사용자 업데이트 API 오류', undefined, {
      userId: params.id,
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof Error && error.message.includes('사용자를 찾을 수 없습니다')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: '사용자 업데이트에 실패했습니다.' }, { status: 500 });
  }
}

/**
 * 사용자 삭제 (소프트 삭제)
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    // 관리자만 삭제 가능
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const user = await userService.deleteUser(params.id);

    // 응답 스키마 검증
    const response = UserResponseDto.parse(user);

    return NextResponse.json(response);
  } catch (error) {
    logger.error('사용자 삭제 API 오류', undefined, {
      userId: params.id,
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof Error && error.message.includes('사용자를 찾을 수 없습니다')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: '사용자 삭제에 실패했습니다.' }, { status: 500 });
  }
}

/**
 * 사용자 역할 설정
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    // 본인 또는 관리자만 역할 설정 가능
    if (!session?.user?.id || (session.user.id !== params.id && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = UserRoleSetupDto.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: parsed.error.errors },
        { status: 400 },
      );
    }

    const user = await userService.setupUserRole(params.id, parsed.data.role, {
      school: parsed.data.school,
      grade: parsed.data.grade,
      subject: parsed.data.subject,
    });

    // 응답 스키마 검증
    const response = UserResponseDto.parse(user);

    return NextResponse.json(response);
  } catch (error) {
    logger.error('사용자 역할 설정 API 오류', undefined, {
      userId: params.id,
      error: error instanceof Error ? error.message : String(error),
    });

    if (error instanceof Error && error.message.includes('사용자를 찾을 수 없습니다')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ error: '사용자 역할 설정에 실패했습니다.' }, { status: 500 });
  }
}
