import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { authService } from '@/services/auth';

// NextAuth 전역 설정 객체
export const authOptions: NextAuthOptions = {
  //인증 공급자 설정
  providers: [
    // Google OAuth 공급자 설정(환경변수 필수)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // 사용자명/비밀번호(이메일/비번) 기반 커스텀 자격 증명
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      // 로그인 시 호출되는 인증 함수
      async authorize(credentials) {
        // 필수 파라미터 확인
        if (!credentials?.email || !credentials?.password) return null;
        try {
          // 서비스 레이어에 위임(내부에서 prisma/bcrypt/예외 처리)
          const user = await authService.loginWithCredentials({
            email: String(credentials.email),
            password: String(credentials.password),
          });

          // 실패 시 null 반환(NextAuth 규약)
          if (!user) return null;

          // 성공 시 NextAuth가 기대하는 형태의 사용자 객체 반환
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
            image: user.avatar ?? null,
          };
        } catch {
          // 예외 발생 시 인증 실패 처리
          return null;
        }
      },
    }),
  ],

  //세션 전략: JWT 사용 및 만료 기간 설정
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30일
  },

  //쿠키 설정: 보안 속성 및 이름 지정
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30일
  },

  //콜백: 로그인/토큰/세션 생성 시 훅
  callbacks: {
    // OAuth 로그인 직후 처리(구글 최초 로그인 시 사용자 생성)
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user?.email) {
        try {
          await authService.upsertOAuthUser({
            provider: 'google',
            providerId: user.id ?? undefined, // 필요시 공급자 ID 사용
            email: user.email,
            name: user.name ?? '',
            image: (user as any).image ?? null,
          });
        } catch (error) {
          // 사용자 생성/업서트 실패 시 로그인 거부
          console.error('Error creating/upserting OAuth user:', error);
          return false;
        }
      }
      return true;
    },
    // JWT 생성/갱신 시 사용자 역할/상태를 토큰에 주입
    async jwt({ token, user }) {
      // 로그인 직후(user가 있을 때)만 DB 조회
      if (user?.email) {
        // 데모 계정의 경우 특별 처리
        if (user.email === 'demo@example.com') {
          token.role = 'TEACHER';
          token.status = 'ACTIVE';
          return token;
        }

        try {
          const rs = await authService.getRoleStatusByEmail(user.email);
          if (rs) {
            token.role = rs.role;
            token.status = rs.status;
          } else {
            // 안전 기본값(실패 시에도 최소 권한)
            token.role = 'STUDENT';
            token.status = 'ACTIVE';
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          token.role = 'STUDENT';
          token.status = 'ACTIVE';
        }
      }
      return token;
    },

    // 세션 객체에 사용자 커스텀 필드 반영
    async session({ session, token }) {
      if (token) {
        // token.sub는 NextAuth가 부여한 사용자 식별자(보통 user.id)
        session.user.id = token.sub!;
        // 커스텀 클레임을 세션에 전달(클라이언트에서 접근 가능)
        session.user.role = token.role as string;
        // 필요하면 상태도 포함 가능
        (session.user as any).status = token.status as string;
      }
      return session;
    },
  },

  // 6) 커스텀 페이지 경로(로그인 화면)
  pages: {
    signIn: '/login',
  },
};
