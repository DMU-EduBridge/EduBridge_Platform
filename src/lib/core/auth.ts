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
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
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
