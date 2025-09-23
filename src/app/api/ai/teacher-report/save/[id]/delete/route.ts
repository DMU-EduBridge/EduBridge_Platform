import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const reportId = params.id;

    // 리포트 존재 여부 확인
    const report = await prisma.teacherReport.findFirst({
      where: {
        id: reportId,
        createdBy: session.user.id, // 본인이 생성한 리포트만 삭제 가능
        status: { not: 'ARCHIVED' },
      },
    });

    if (!report) {
      return NextResponse.json({ error: '리포트를 찾을 수 없습니다.' }, { status: 404 });
    }

    // 소프트 삭제 (deletedAt 필드 설정)
    await prisma.teacherReport.update({
      where: { id: reportId },
      data: { status: 'ARCHIVED' },
    });

    return NextResponse.json({
      success: true,
      message: '리포트가 삭제되었습니다.',
    });
  } catch (error) {
    console.error('리포트 삭제 오류:', error);
    return NextResponse.json({ error: '리포트 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
