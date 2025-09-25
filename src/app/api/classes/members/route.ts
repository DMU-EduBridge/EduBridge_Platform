import { authOptions } from '@/lib/core/auth';
import { classService } from '@/server/services/class';
import { CreateClassMemberRequest } from '@/types/domain/class';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 클래스 멤버 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const params = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      classId: searchParams.get('classId') || undefined,
      userId: searchParams.get('userId') || undefined,
      role: (searchParams.get('role') as any) || undefined,
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
    };

    const result = await classService.getClassMembers(params);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching class members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * 클래스에 멤버 추가
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data: CreateClassMemberRequest = await request.json();

    // 요청 검증
    if (!data.classId || !data.userId) {
      return NextResponse.json(
        { error: 'Missing required fields: classId, userId' },
        { status: 400 },
      );
    }

    // 클래스 생성자이거나 관리자만 멤버 추가 가능
    const cls = await classService.getClassById(data.classId);
    if (!cls) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    if (cls.createdBy !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const member = await classService.addClassMember(data);
    return NextResponse.json({ success: true, data: member });
  } catch (error) {
    console.error('Error adding class member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
