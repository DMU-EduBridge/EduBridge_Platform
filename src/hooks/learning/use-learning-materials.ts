import { learningService } from '@/services/learning';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { learningKeys } from '../keys/learning';

/**
 * 학습 자료 관리용 통합 훅
 * 관리 페이지에서 사용하는 모든 기능을 제공
 * @param params 검색 및 필터 파라미터
 */
export function useLearningMaterials(params?: {
  search?: string;
  subject?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const queryClient = useQueryClient();

  const materialsQuery = useQuery({
    queryKey: learningKeys.list(params),
    queryFn: () => learningService.getMaterials(params).then((r) => r.data),
  });

  const useMaterial = (id: string) =>
    useQuery({
      queryKey: learningKeys.detail(id),
      queryFn: () => learningService.getMaterial(id).then((r) => r.data),
      enabled: !!id,
    });

  const statsQuery = useQuery({
    queryKey: learningKeys.stats,
    queryFn: () => learningService.getMaterialStats().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: learningService.createMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningKeys.all });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<any> }) =>
      learningService.updateMaterial(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: learningKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: learningKeys.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: learningService.deleteMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningKeys.all });
    },
  });

  return {
    materials: materialsQuery,
    material: useMaterial,
    stats: statsQuery,
    create: createMutation,
    update: updateMutation,
    delete: deleteMutation,
  };
}
