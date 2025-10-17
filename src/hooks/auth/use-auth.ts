import { authService } from '@/services/auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { authKeys } from '../keys/auth';

/**
 * 인증 관리용 통합 훅
 * 모든 인증 관련 기능을 제공
 */
export const useAuth = () => {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: authKeys.profile,
    queryFn: () => authService.getProfile().then((res) => res.data),
    enabled: false, // 수동으로 호출
  });

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: () => {
      // NextAuth가 httpOnly 쿠키로 토큰을 관리하므로 별도 저장 불필요
      // 프로필 정보 다시 가져오기
      queryClient.invalidateQueries({ queryKey: authKeys.profile });
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.profile });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // 클라이언트사이드 정리 (세션 스토리지만)
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }
      // 모든 쿼리 캐시 정리
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout mutation error:', error);
      // 오류가 발생해도 클라이언트 정리와 캐시 정리는 수행
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }
      queryClient.clear();
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.profile });
    },
  });

  return {
    profile: profileQuery,
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
    updateProfile: updateProfileMutation,
  };
};

/**
 * 세션 keep-alive 훅: 주기적으로 /api/auth/session을 조회하여 세션 만료를 늦추고,
 * 401 발생 시 재로그인을 유도할 수 있도록 신호를 제공한다.
 */
export function useSessionKeepAlive(options?: { intervalMs?: number; onExpired?: () => void }) {
  useEffect(() => {
    let timer: any;
    const interval = options?.intervalMs ?? 12 * 60 * 60 * 1000; // 12h
    const ping = async () => {
      try {
        const res = await fetch('/api/auth/session', { cache: 'no-store' });
        if (res.status === 401) {
          options?.onExpired?.();
        }
      } catch {
        // 네트워크 오류는 무시
      }
      timer = setTimeout(ping, interval);
    };
    timer = setTimeout(ping, interval);
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [options]);
}
