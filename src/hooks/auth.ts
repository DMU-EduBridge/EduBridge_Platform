import { authService } from '@/services/auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authKeys } from './keys/auth';

// 인증 관련 훅
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
    onSuccess: (response) => {
      // 토큰 저장
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth-token', response.data.token);
      }
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
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
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
