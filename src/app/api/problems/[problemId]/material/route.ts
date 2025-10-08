import { NextResponse } from 'next/server';

// Deprecated: 단일 조회는 /api/problems/material?ids=... 사용으로 통합
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'Deprecated endpoint. Use /api/problems/material?ids=... instead.',
      code: 'DEPRECATED',
    },
    { status: 410 },
  );
}
