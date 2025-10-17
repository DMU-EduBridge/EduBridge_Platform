import { prisma } from '@/lib/core/prisma';
import { hashPassword } from '@/services/auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// 간단한 인메모리 레이트리밋(개발/경량 용도)
const rateBucket = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // 기간당 허용 횟수
const RATE_WINDOW_MS = 60 * 1000; // 1분

function rateLimit(ip: string, email: string): boolean {
  const key = `${ip}:${email.toLowerCase()}`;
  const now = Date.now();
  const entry = rateBucket.get(key);
  if (!entry || now > entry.resetAt) {
    rateBucket.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count += 1;
  return true;
}

const RoleEnum = z.enum(['STUDENT', 'TEACHER']);
const SignupSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다.')
    .refine((s) => /[a-zA-Z]/.test(s) && /\d/.test(s), '영문/숫자를 포함해야 합니다.'),
  name: z.string().min(1),
  role: RoleEnum.default('STUDENT').optional(),
  school: z.string().optional(),
  subject: z.string().optional(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const ip = req.ip ?? req.headers.get('x-forwarded-for') ?? 'unknown';
    const body = await req.json().catch(() => ({}));
    const parsed = SignupSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message } }, { status: 422 });
    }

    const { email, password, name } = parsed.data;
    const role = parsed.data.role ?? 'STUDENT';
    const school = parsed.data.school ?? null;
    const subject = parsed.data.subject ?? null;

    // 교사일 때만 school/subject 허용(필수는 비즈니스 요구에 따라 변경 가능)
    if (role === 'TEACHER') {
      // 예: 교사는 subject가 있어야 하는 정책이라면 아래처럼 강제
      // if (!subject) return NextResponse.json({ error: { code: 'REQUIRED', message: '교사는 과목이 필요합니다.' } }, { status: 422 });
    }

    // 레이트 리밋(소프트)
    if (!rateLimit(String(ip), email)) {
      return NextResponse.json(
        {
          error: {
            code: 'RATE_LIMITED',
            message: '요청이 너무 많습니다. 잠시 후 다시 시도하세요.',
          },
        },
        { status: 429 },
      );
    }

    // 이메일 중복 검사
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, password: true },
    });
    if (existing) {
      // 소셜 전용 계정(비밀번호 없음)과 충돌 시 안내
      const code = existing.password ? 'EMAIL_EXISTS' : 'OAUTH_CONFLICT';
      const message = existing.password
        ? '이미 가입된 이메일입니다.'
        : '해당 이메일은 소셜 로그인 계정입니다. 소셜 로그인을 이용하세요.';
      return NextResponse.json({ error: { code, message } }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const created = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        school,
        subject,
        role: role as any,
        status: 'ACTIVE',
      },
      select: { id: true, email: true, name: true, role: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL', message: '회원가입 중 오류가 발생했습니다.' } },
      { status: 500 },
    );
  }
}

// 다른 메서드는 막기 (선택사항)
export function GET() {
  return new Response('Method Not Allowed', { status: 405 });
}
