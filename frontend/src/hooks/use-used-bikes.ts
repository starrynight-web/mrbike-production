import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-service";
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
            return response.data;
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
            const response = await api.client.get(`/marketplace/listings/${id}/`);
            return response.data;
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
