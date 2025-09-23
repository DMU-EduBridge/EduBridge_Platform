import { api } from '@/lib/core/api';
import type { User } from '@/types/domain/user';

export const authService = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: string;
    school?: string;
    department?: string;
    phone?: string;
    location?: string;
  }) => api.post('/auth/register', data),

  logout: async () => {
    try {
      // API 로그아웃 호출
      await api.post('/auth/logout');

      // 클라이언트 정리
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user-profile');
        sessionStorage.clear();

        // 쿠키 정리
        const cookiesToDelete = [
          'next-auth.session-token',
          'next-auth.callback-url',
          'next-auth.csrf-token',
          '__Secure-next-auth.session-token',
          '__Host-next-auth.csrf-token',
          'auth-token',
        ];

        cookiesToDelete.forEach((cookieName) => {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // API 호출 실패해도 클라이언트 정리는 수행
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user-profile');
        sessionStorage.clear();
      }
      throw error;
    }
  },

  getProfile: () => api.get<User>('/auth/profile'),
  updateProfile: (data: Partial<User>) => api.put('/auth/profile', data),
};
