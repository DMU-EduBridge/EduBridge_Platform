import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { classService } from '@/server/services/class';
import { UpdateClassMemberRequest } from '@/types/domain/class';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 클래스 멤버 상세 조회
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const member = await prisma.classMember.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        class: true,
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Class member not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: member });
  } catch (error) {
    console.error('Error fetching class member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * 클래스 멤버 수정
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data: UpdateClassMemberRequest = await request.json();

    // 클래스 생성자이거나 관리자만 멤버 수정 가능
    const member = await prisma.classMember.findUnique({
      where: { id: params.id },
      include: { class: true },
    });

    if (!member) {
      return NextResponse.json({ error: 'Class member not found' }, { status: 404 });
    }

    if (member.class.createdBy !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedMember = await classService.updateClassMember(params.id, data);
    return NextResponse.json({ success: true, data: updatedMember });
  } catch (error) {
    console.error('Error updating class member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * 클래스에서 멤버 제거
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 클래스 생성자이거나 관리자만 멤버 제거 가능
    const member = await prisma.classMember.findUnique({
      where: { id: params.id },
      include: { class: true },
    });

    if (!member) {
      return NextResponse.json({ error: 'Class member not found' }, { status: 404 });
    }

    if (member.class.createdBy !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await classService.removeClassMember(params.id);
    return NextResponse.json({ success: true, message: 'Class member removed successfully' });
  } catch (error) {
    console.error('Error removing class member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
