import { prisma } from '@/lib/core/prisma';
import bcrypt from 'bcryptjs';

// 비밀번호 해시 강도(Salt 라운드). 환경변수 없으면 기본 10 사용.
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

// 개발 환경에서 소셜 전용 계정(비밀번호 없음) 로그인 테스트를 위해 허용할 고정 비밀번호.
// 프로덕션에서는 사용하지 않도록 주의하세요.
const DEV_TEST_PASSWORD = process.env.DEV_TEST_PASSWORD || 'password123';

// 이메일 표준화: 대소문자/공백 차이로 인한 중복이나 매칭 실패 방지
function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

// 비밀번호 해시 유틸
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

// 비밀번호 검증 유틸(안전하게 try-catch)
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

// 애플리케이션 전반에서 반환/사용할 공개 사용자 타입
export type PublicUser = {
  id: string;
  email: string;
  name: string | null;
  role: string; // 예: 'STUDENT' | 'TEACHER' ...
  status: string; // 예: 'ACTIVE' | 'INACTIVE' ...
  avatar?: string | null;
};

// 인증 관련 비즈니스 로직을 모은 서비스 객체
export const authService = {
  // 1) Credentials 로그인 처리
  async loginWithCredentials(input: {
    email: string;
    password: string;
  }): Promise<PublicUser | null> {
    const email = normalizeEmail(input.email);
    const password = String(input.password);

    //데모 계정: 별도의 DB 없이 바로 허용(데모/시연용)
    if (email === 'demo@example.com' && password === 'demo123') {
      return {
        id: '1',
        email,
        name: 'Demo User',
        role: 'TEACHER',
        status: 'ACTIVE',
      };
    }

    // DB에서 사용자 조회(소셜 전용 여부 확인 위해 password, 프로필 위해 avatar도 선택)
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        password: true, // 소셜 가입자는 null
        avatar: true,
      },
    });

    // 존재하지 않거나 활성 상태가 아니면 로그인 거부
    if (!user) return null;
    if (user.status !== 'ACTIVE') return null;

    // 로컬(비밀번호 있는) 계정이면 bcrypt 비교
    if (user.password) {
      const ok = await verifyPassword(password, user.password);
      if (!ok) return null;

      // 성공 시 공개 사용자 형태로 반환
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        avatar: user.avatar ?? null,
      };
    }

    // 소셜 전용 계정(비밀번호 없음)인 경우: 개발 고정 비밀번호로만 통과 허용
    // 프로덕션에서는 이 로직을 비활성화하거나 제한해야 합니다.
    if (password === DEV_TEST_PASSWORD) {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        avatar: user.avatar ?? null,
      };
    }

    // 위 조건을 모두 통과하지 못하면 실패
    return null;
  },

  // 2) OAuth(구글) 최초 로그인 시 사용자 생성, 재로그인 시 필요한 필드만 업데이트
  async upsertOAuthUser(input: {
    provider: 'google';
    providerId?: string; // 필요시 공급자측 ID와 매핑 가능
    email: string;
    name?: string | null;
    image?: string | null;
  }): Promise<PublicUser> {
    const email = normalizeEmail(input.email);
    // 먼저 기존 사용자 확인
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true, status: true, avatar: true },
    });

    // 없으면 생성(기본 role/status 설정)
    if (!existing) {
      const created = await prisma.user.create({
        data: {
          email,
          name: input.name ?? '',
          role: 'STUDENT', // 기본 역할
          status: 'ACTIVE', // 기본 상태
          avatar: input.image ?? null,
          // password는 null(소셜 전용)
        },
        select: { id: true, email: true, name: true, role: true, status: true, avatar: true },
      });

      return {
        id: created.id,
        email: created.email,
        name: created.name,
        role: created.role,
        status: created.status,
        avatar: created.avatar ?? null,
      };
    }

    // 존재하면 name/image가 바뀐 경우에만 보수적으로 업데이트
    const needUpdate =
      (input.name && input.name !== existing.name) ||
      (input.image && input.image !== existing.avatar);

    const updated = needUpdate
      ? await prisma.user.update({
          where: { email },
          data: {
            name: input.name ?? existing.name ?? '',
            avatar: input.image ?? existing.avatar ?? null,
          },
          select: { id: true, email: true, name: true, role: true, status: true, avatar: true },
        })
      : existing;

    return {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      status: updated.status,
      avatar: updated.avatar ?? null,
    };
  },

  // 3) 이메일로 role/status만 조회하여 JWT 콜백에서 동기화
  async getRoleStatusByEmail(emailRaw: string): Promise<{ role: string; status: string } | null> {
    const email = normalizeEmail(emailRaw);
    const rs = await prisma.user.findUnique({
      where: { email },
      select: { role: true, status: true },
    });
    return rs ?? null;
  },
  // ------- 아래 메서드들은 클라이언트 훅 호환을 위한 래퍼/더미 구현 -------
  async getProfile(): Promise<{ data: PublicUser | null }> {
    // 서버 세션 의존 없이 컴파일 호환용 기본 구현
    return { data: null };
  },
  async login(email: string, password: string): Promise<PublicUser | null> {
    return this.loginWithCredentials({ email, password });
  },
  async register(): Promise<void> {
    // 실제 회원가입 로직은 NextAuth/route 구현에 위임. 타입 호환용 더미
    return;
  },
  async logout(): Promise<void> {
    // NextAuth가 httpOnly 쿠키로 관리하므로 클라이언트에서 별도 처리 없음
    return;
  },
  async updateProfile(): Promise<void> {
    // 프로필 업데이트는 별도 API 필요. 타입 호환용 더미
    return;
  },
};
