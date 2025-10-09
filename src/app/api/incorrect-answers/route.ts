/**
 * 오답노트 API 엔드포인트
 */

import { authOptions } from '@/lib/core/auth';
import { createIncorrectAnswersData } from '@/server/services/incorrect-answers.service';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const incorrectAnswersData = await createIncorrectAnswersData(session.user.id);

    if (!incorrectAnswersData) {
      return NextResponse.json({ error: '오답노트 데이터를 불러올 수 없습니다.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: incorrectAnswersData,
    });
  } catch (error) {
    console.error('오답노트 API 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
