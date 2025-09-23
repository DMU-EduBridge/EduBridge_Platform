import { prisma } from '@/lib/core/prisma';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // 실제 구현에서는 데이터베이스에서 사용자를 찾고 비밀번호를 검증합니다
        // 개발 환경에서는 시드된 학생 계정에 한해 고정 비밀번호를 허용합니다.
        const devPassword = process.env.DEV_TEST_PASSWORD || 'student123';

        // 데모 계정 유지
        if (credentials.email === 'demo@example.com' && credentials.password === 'demo123') {
          return {
            id: '1',
            email: credentials.email,
            name: 'Demo User',
            role: 'TEACHER',
          };
        }

        // 개발용 고정 비밀번호로 사용자 계정 인증
        if (credentials.password === devPassword) {
          const user = await prisma.user.findUnique({ where: { email: credentials.email } });
          if (user && user.status === 'ACTIVE') {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            };
          }
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30일 (세션 유지 시간)
  },
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
    maxAge: 30 * 24 * 60 * 60, // 30일 (JWT 토큰 유효 시간)
  },
  callbacks: {
    async signIn({ user, account }) {
      // Google 로그인인 경우
      if (account?.provider === 'google') {
        try {
          // 기존 사용자 확인
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            // 새로운 사용자 생성 (기본적으로 STUDENT 역할로 설정)
            await prisma.user.create({
              data: {
                id: user.id,
                email: user.email!,
                name: user.name!,
                role: 'STUDENT', // 기본 역할
                status: 'ACTIVE',
              },
            });
          }
        } catch (error) {
          console.error('Error creating user:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        // 데이터베이스에서 사용자 정보 가져오기
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: { role: true, status: true },
          });

          if (dbUser) {
            token.role = dbUser.role;
            token.status = dbUser.status;
          } else {
            // 사용자가 없으면 기본 역할 설정
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
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
