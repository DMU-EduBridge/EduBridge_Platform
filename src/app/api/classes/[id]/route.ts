import { authOptions } from '@/lib/core/auth';
import { classService } from '@/server/services/class';
import { UpdateClassRequest } from '@/types/domain/class';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 클래스 상세 조회
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cls = await classService.getClassById(params.id);

    if (!cls) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: cls });
  } catch (error) {
    console.error('Error fetching class:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * 클래스 수정
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data: UpdateClassRequest = await request.json();

    // 클래스 생성자이거나 관리자만 수정 가능
    const cls = await classService.getClassById(params.id);
    if (!cls) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    if (cls.createdBy !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedClass = await classService.updateClass(params.id, data);
    return NextResponse.json({ success: true, data: updatedClass });
  } catch (error) {
    console.error('Error updating class:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * 클래스 삭제
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 클래스 생성자이거나 관리자만 삭제 가능
    const cls = await classService.getClassById(params.id);
    if (!cls) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    if (cls.createdBy !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await classService.deleteClass(params.id);
    return NextResponse.json({ success: true, message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Error deleting class:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
