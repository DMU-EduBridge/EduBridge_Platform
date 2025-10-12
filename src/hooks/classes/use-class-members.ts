import { AddMemberRequest, ClassMember } from '@/types/domain/class';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface ClassMembersResponse {
  success: boolean;
  data: ClassMember[];
}

interface AddMemberResponse {
  success: boolean;
  data: { message: string };
}

interface RemoveMemberResponse {
  success: boolean;
  data: { message: string };
}

export function useClassMembers(classId: string) {
  return useQuery<ClassMembersResponse>({
    queryKey: ['class-members', classId],
    queryFn: async () => {
      const response = await fetch(`/api/classes/${classId}/members`);
      if (!response.ok) {
        throw new Error('멤버 목록을 불러오는데 실패했습니다');
      }
      return response.json();
    },
    enabled: !!classId,
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
  });
}

export function useClassMemberMutations() {
  const queryClient = useQueryClient();

  const addMember = useMutation<
    AddMemberResponse,
    Error,
    { classId: string; data: AddMemberRequest }
  >({
    mutationFn: async ({ classId, data }) => {
      const response = await fetch(`/api/classes/${classId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '멤버 추가에 실패했습니다');
      }

      return response.json();
    },
    onSuccess: (_, { classId }) => {
      queryClient.invalidateQueries({ queryKey: ['class-members', classId] });
      queryClient.invalidateQueries({ queryKey: ['class', classId] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });

  const removeMember = useMutation<
    RemoveMemberResponse,
    Error,
    { classId: string; userId: string }
  >({
    mutationFn: async ({ classId, userId }) => {
      const response = await fetch(`/api/classes/${classId}/members?userId=${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '멤버 제거에 실패했습니다');
      }

      return response.json();
    },
    onSuccess: (_, { classId }) => {
      queryClient.invalidateQueries({ queryKey: ['class-members', classId] });
      queryClient.invalidateQueries({ queryKey: ['class', classId] });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });

  return {
    addMember,
    removeMember,
  };
}
