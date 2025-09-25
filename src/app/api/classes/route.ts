import { authOptions } from '@/lib/core/auth';
import { classService } from '@/server/services/class';
import { CreateClassRequest } from '@/types/domain/class';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// ===== 클래스 관리 API =====

/**
 * 클래스 목록 조회
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
      subject: searchParams.get('subject') || undefined,
      gradeLevel: searchParams.get('gradeLevel') || undefined,
      schoolYear: searchParams.get('schoolYear') || undefined,
      semester: searchParams.get('semester') || undefined,
      isActive: searchParams.get('isActive') ? searchParams.get('isActive') === 'true' : undefined,
      createdBy: searchParams.get('createdBy') || undefined,
    };

    const result = await classService.getClasses(params);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * 클래스 생성
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 선생님만 클래스 생성 가능
    if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data: CreateClassRequest = await request.json();

    // 요청 검증
    if (!data.name || !data.subject || !data.gradeLevel || !data.schoolYear || !data.semester) {
      return NextResponse.json(
        { error: 'Missing required fields: name, subject, gradeLevel, schoolYear, semester' },
        { status: 400 },
      );
    }

    const cls = await classService.createClass(data, session.user.id);
    return NextResponse.json({ success: true, data: cls });
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
