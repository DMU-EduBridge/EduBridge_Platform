import { authService } from '@/services/auth';
import { useQuery } from '@tanstack/react-query';
import { authKeys } from '../keys/auth';

/**
 * 사용자 프로필을 가져오는 훅
 */
export function useProfile() {
  return useQuery({
    queryKey: authKeys.profile,
    queryFn: () => authService.getProfile().then((res) => res.data),
    enabled: false, // 수동으로 호출
  });
}
