import { authOptions } from '@/lib/core/auth';
import { classService } from '@/server/services/class';
import { CreateProblemAssignmentRequest } from '@/types/domain/class';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 문제 할당 목록 조회
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
      problemId: searchParams.get('problemId') || undefined,
      assignedBy: searchParams.get('assignedBy') || undefined,
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
      dueDate: searchParams.get('dueDate') ? new Date(searchParams.get('dueDate')!) : undefined,
    };

    const result = await classService.getProblemAssignments(params);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching problem assignments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * 문제 할당
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 선생님만 문제 할당 가능
    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data: CreateProblemAssignmentRequest = await request.json();

    // 요청 검증
    if (!data.classId || !data.problemId) {
      return NextResponse.json(
        { error: 'Missing required fields: classId, problemId' },
        { status: 400 },
      );
    }

    // 클래스 생성자이거나 관리자만 문제 할당 가능
    const cls = await classService.getClassById(data.classId);
    if (!cls) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    if (cls.createdBy !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const assignment = await classService.assignProblem(data, session.user.id);
    return NextResponse.json({ success: true, data: assignment });
  } catch (error) {
    console.error('Error assigning problem:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
