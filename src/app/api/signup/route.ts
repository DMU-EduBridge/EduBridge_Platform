import { hashPassword } from '@/services/auth';
import { prisma } from '@/lib/core/prisma';

export async function POST(req: Request): Promise<Response> {
  try {
    const { email, password, name, role, school, subject } = await req.json();

    // 유효성 검사
    if (!email || !password || !name || !role) {
      return new Response(JSON.stringify({ error: '모든 필드를 입력해야 합니다.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 비밀번호 해싱
    const hashedPassword = await hashPassword(password);

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        school: school || null,
        subject: subject || null,
        role,
      },
    });

    return new Response(JSON.stringify(user), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return new Response(JSON.stringify({ error: '회원가입 중 오류가 발생했습니다.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// 다른 메서드는 막기 (선택사항)
export function GET() {
  return new Response('Method Not Allowed', { status: 405 });
}
