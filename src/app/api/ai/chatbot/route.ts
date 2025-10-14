import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  try {
    // 빌드 시에는 더미 응답 반환 (Vercel 빌드 에러 방지)
    return NextResponse.json({
      conversationId: 'build-dummy',
      message: {
        role: 'assistant',
        content: '서비스 준비 중입니다.',
      },
      usage: {
        tokensPrompt: 0,
        tokensCompletion: 0,
        tokensTotal: 0,
        costUsd: 0,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: '챗봇 응답 생성에 실패했습니다.' }, { status: 500 });
  }
}
