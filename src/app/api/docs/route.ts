import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'edge';

export async function GET() {
  // /api/docs → /docs 로 통일
  return NextResponse.redirect(new URL('/docs', 'http://localhost:3000'), 301);
}
