import { authService } from '@/services/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authKeys } from '../keys/auth';

/**
 * 로그인 뮤테이션 훅
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: (response) => {
      // 토큰 저장
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth-token', response.data.token);
      }
      // 프로필 정보 다시 가져오기
      queryClient.invalidateQueries({ queryKey: authKeys.profile });
    },
  });
}

/**
 * 회원가입 뮤테이션 훅
 */
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.profile });
    },
  });
}

/**
 * 로그아웃 뮤테이션 훅
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // 클라이언트사이드 정리
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user-profile');
        sessionStorage.clear();
      }
      // 모든 쿼리 캐시 정리
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout mutation error:', error);
      // 오류가 발생해도 클라이언트 정리와 캐시 정리는 수행
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user-profile');
        sessionStorage.clear();
      }
      queryClient.clear();
    },
  });
}

/**
 * 프로필 업데이트 뮤테이션 훅
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.profile });
    },
  });
}
