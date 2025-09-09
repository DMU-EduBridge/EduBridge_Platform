import { learningService } from '@/services/learning';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { learningKeys } from './keys/learning';

export function useLearningMaterials(params?: {
  search?: string;
  subject?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const queryClient = useQueryClient();

  const materials = useQuery({
    queryKey: learningKeys.list(params),
    queryFn: () => learningService.getMaterials(params).then((r) => r.data),
  });

  const useMaterial = (id: string) =>
    useQuery({
      queryKey: learningKeys.detail(id),
      queryFn: () => learningService.getMaterial(id).then((r) => r.data),
      enabled: !!id,
    });

  const stats = useQuery({
    queryKey: learningKeys.stats,
    queryFn: () => learningService.getMaterialStats().then((r) => r.data),
  });

  const create = useMutation({
    mutationFn: learningService.createMaterial,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: learningKeys.all }),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      learningService.updateMaterial(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: learningKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: learningKeys.all });
    },
  });

  const remove = useMutation({
    mutationFn: learningService.deleteMaterial,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: learningKeys.all }),
  });

  return { materials, useMaterial, stats, create, update, remove };
}
