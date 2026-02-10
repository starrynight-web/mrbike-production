import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-service";
import { mapUsedBike } from "@/lib/data-utils";
import type { UsedBikeFilters, UsedBike } from "@/types";

// ============================================
// QUERY KEYS
// ============================================
export const usedBikeQueryKeys = {
  all: ["usedBikes"] as const,
  list: (filters?: UsedBikeFilters) => ["usedBikes", "list", filters] as const,
  detail: (id: string) => ["usedBikes", "detail", id] as const,
} as const;

// ============================================
// HOOKS
// ============================================

/**
 * Fetch paginated list of used bikes with filters
 */
export function useUsedBikes(filters?: UsedBikeFilters) {
  return useQuery({
    queryKey: usedBikeQueryKeys.list(filters),
    queryFn: async () => {
      const response = await api.getUsedBikes(filters);
      if (!response.success) throw new Error(response.error?.message || "Failed to fetch used bikes");

      const rawBikes = (response.data as any[]) || [];
      return {
        usedBikes: rawBikes.map(mapUsedBike),
        meta: {
          totalItems: response.meta?.total || 0,
          totalPages: response.meta?.totalPages || 1,
          currentPage: filters?.page || 1,
          hasNextPage: response.meta?.hasNextPage || false,
          hasPrevPage: response.meta?.hasPrevPage || false,
        },
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch single used bike by ID
 */
export function useUsedBike(id: string) {
  return useQuery({
    queryKey: usedBikeQueryKeys.detail(id),
    queryFn: async () => {
      const response = await api.getUsedBike(id);
      if (!response.success) throw new Error(response.error?.message || "Failed to fetch used bike");
      return mapUsedBike(response.data);
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });
}

/**
 * Create a new used bike listing
 */
export function useCreateUsedBike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.createUsedBike(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usedBikeQueryKeys.all });
    },
  });
}
