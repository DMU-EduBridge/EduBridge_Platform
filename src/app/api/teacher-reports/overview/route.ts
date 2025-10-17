import { authOptions } from '@/lib/core/auth';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 실제 교사-학생 관계 조회
    const teacherStudents = await prisma.teacherStudent.findMany({
      where: { teacherId: session.user.id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            gradeLevel: true,
            status: true,
          },
        },
      },
    });

    // 학생이 없는 경우 빈 데이터 반환
    if (teacherStudents.length === 0) {
      return NextResponse.json(
        {
          data: {
            classSummary: {
              avgScore: 0,
              bottom10pctAvg: 0,
              flaggedCount: 0,
              topWeakConcepts: [],
            },
            students: [],
          },
        },
        { status: 200 },
      );
    }

    // 더미 데이터로 학생 정보 생성 (실제로는 ProblemProgress 등에서 계산해야 함)
    const students = teacherStudents.map((ts, index) => ({
      studentId: ts.student.id,
      name: ts.student.name,
      mastery: Math.floor(Math.random() * 40) + 50, // 50-90% 랜덤
      scoreDelta: Math.floor(Math.random() * 20) - 10, // -10 ~ +10 랜덤
      flagged: index < 2, // 처음 2명만 주의 학생으로 설정
      flags: index < 2 ? ['DROP', 'REPEAT_WRONG'] : [],
      risk: {
        score: Math.floor(Math.random() * 100),
        level: index < 2 ? 'HIGH' : 'LOW',
        reasons: index < 2 ? ['최근 점수 급락', '같은 개념 반복 오답'] : [],
      },
      lastUpdated: new Date().toISOString().slice(0, 10),
      reportId: `rep_${ts.student.id}`,
    }));

    const flaggedCount = students.filter((s) => s.flagged).length;
    const avgScore =
      students.length > 0
        ? Math.floor(students.reduce((sum, s) => sum + s.mastery, 0) / students.length)
        : 0;

    const data = {
      classSummary: {
        avgScore,
        bottom10pctAvg: Math.floor(avgScore * 0.7),
        flaggedCount,
        topWeakConcepts: ['이차방정식', '분수의 덧셈', '광합성'],
      },
      students,
    };

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Teacher overview API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
