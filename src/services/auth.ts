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
      // API 로그아웃 호출 (httpOnly 쿠키는 서버에서 처리)
      await api.post('/auth/logout');

      // 클라이언트 정리 (세션 스토리지만)
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }

      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // API 호출 실패해도 클라이언트 정리는 수행
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }
      throw error;
    }
  },

  getProfile: () => api.get<User>('/auth/profile'),
  updateProfile: (data: Partial<User>) => api.put('/auth/profile', data),
};
