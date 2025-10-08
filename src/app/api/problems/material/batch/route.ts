import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');
    if (!idsParam) {
      return NextResponse.json({ error: 'ids 파라미터가 필요합니다.' }, { status: 400 });
    }

    const ids = idsParam
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (ids.length === 0) {
      return NextResponse.json({ error: '유효한 problemId가 없습니다.' }, { status: 400 });
    }

    const links = await prisma.learningMaterialProblem.findMany({
      where: { problemId: { in: ids } },
      select: { problemId: true, learningMaterialId: true },
    });

    const map = new Map(links.map((l) => [l.problemId, l.learningMaterialId] as const));
    const result = ids.map((id) => ({ id, studyId: map.get(id) || null }));

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
