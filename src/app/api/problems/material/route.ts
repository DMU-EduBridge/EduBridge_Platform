import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/problems/material?ids=a,b,c
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '인증이 필요합니다.', code: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids') || '';
    const ids = idsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'ids 파라미터가 필요합니다.', code: 'BAD_REQUEST' },
        { status: 400 },
      );
    }

    const links = await prisma.learningMaterialProblem.findMany({
      where: { problemId: { in: ids } },
      select: { problemId: true, learningMaterialId: true },
    });

    const map = new Map(links.map((l) => [l.problemId, l.learningMaterialId] as const));
    const data = ids.map((id) => ({ id, studyId: map.get(id) || null }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.', code: 'SERVER_ERROR' },
      { status: 500 },
    );
  }
}
