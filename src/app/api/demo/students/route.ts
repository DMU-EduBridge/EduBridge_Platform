import { prisma } from '@/lib/core/prisma';
import { NextResponse } from 'next/server';

/**
 * Demo 페이지용 학생 데이터 조회 (인증 불필요)
 */
export async function GET() {
  try {
    // 실제 DB에서 학생 데이터 가져오기
    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        gradeLevel: true,
      },
      take: 20, // 최대 20명만 조회
    });

    // 데이터가 없으면 더미 데이터 반환
    if (students.length === 0) {
      return NextResponse.json({
        students: [
          {
            id: 'user_perfect',
            name: '김완벽',
            email: 'perfect@student.com',
            grade: '고1',
            progress: 95,
          },
          {
            id: 'user_struggling',
            name: '이어려움',
            email: 'struggling@student.com',
            grade: '고1',
            progress: 35,
          },
          {
            id: 'user_inconsistent',
            name: '박불안',
            email: 'inconsistent@student.com',
            grade: '고2',
            progress: 60,
          },
          {
            id: 'user_slow',
            name: '최천천',
            email: 'slow@student.com',
            grade: '고1',
            progress: 75,
          },
        ],
      });
    }

    // 실제 DB 데이터 반환
    return NextResponse.json({
      students: students.map((student) => ({
        id: student.id,
        name: student.name,
        email: student.email,
        grade: student.gradeLevel || '미지정',
        progress: Math.floor(Math.random() * 40) + 50, // 임시 진행률 (실제로는 계산 필요)
      })),
    });
  } catch (error) {
    console.error('Error fetching demo students:', error);
    // 에러 발생 시 더미 데이터 반환
    return NextResponse.json({
      students: [
        {
          id: 'user_perfect',
          name: '김완벽',
          email: 'perfect@student.com',
          grade: '고1',
          progress: 95,
        },
        {
          id: 'user_struggling',
          name: '이어려움',
          email: 'struggling@student.com',
          grade: '고1',
          progress: 35,
        },
        {
          id: 'user_inconsistent',
          name: '박불안',
          email: 'inconsistent@student.com',
          grade: '고2',
          progress: 60,
        },
        { id: 'user_slow', name: '최천천', email: 'slow@student.com', grade: '고1', progress: 75 },
      ],
    });
  }
}
