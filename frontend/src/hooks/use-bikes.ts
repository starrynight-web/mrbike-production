import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-service";
import type { BikeFilters, Bike, Review } from "@/types";

// ============================================
// QUERY KEYS - Centralized for cache management
// ============================================
export const queryKeys = {
    bikes: {
        all: ["bikes"] as const,
        list: (filters?: BikeFilters) => ["bikes", "list", filters] as const,
        detail: (slug: string) => ["bikes", "detail", slug] as const,
        similar: (slug: string) => ["bikes", "similar", slug] as const,
        usedNearBudget: (slug: string) => ["bikes", "usedNearBudget", slug] as const,
    },
    brands: {
        all: ["brands"] as const,
        bikes: (slug: string, filters?: BikeFilters) =>
            ["brands", slug, "bikes", filters] as const,
    },
    reviews: {
        byBike: (bikeId: string) => ["reviews", "bike", bikeId] as const,
    },
    wishlist: {
        all: ["wishlist"] as const,
    },
} as const;

// ============================================
// BIKE HOOKS
// ============================================

/**
 * Fetch paginated list of bikes with filters
 */
export function useBikes(filters?: BikeFilters) {
    return useQuery({
        queryKey: queryKeys.bikes.list(filters),
        queryFn: async () => {
            const response = await api.getBikes(filters);
            const results = response.data.results || response.data || [];
            const totalItems = response.data.count || (Array.isArray(results) ? results.length : 0);
            return {
                bikes: results,
                meta: {
                    totalItems,
                    totalPages: Math.ceil(totalItems / (filters?.limit || 12)),
                    currentPage: filters?.page || 1,
                },
            };
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Fetch single bike by slug
 */
export function useBike(slug: string) {
    return useQuery({
        queryKey: queryKeys.bikes.detail(slug),
        queryFn: async () => {
            const response = await api.getBikeBySlug(slug);
            return response.data;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
        enabled: !!slug,
    });
}

/**
 * Fetch similar bikes for a given bike
 */
export function useSimilarBikes(slug: string) {
    return useQuery({
        queryKey: queryKeys.bikes.similar(slug),
        queryFn: async () => {
            const response = await api.getBikes({ similar_to: slug });
            return response.data.results || response.data;
        },
        staleTime: 30 * 60 * 1000, // 30 minutes
        enabled: !!slug,
    });
}

/**
 * Fetch used bikes near budget for emotional recommendation
 */
export function useUsedBikesNearBudget(slug: string) {
    return useQuery({
        queryKey: queryKeys.bikes.usedNearBudget(slug),
        queryFn: async () => {
            const response = await api.getUsedBikes({ budget_near: slug });
            return response.data.results || response.data;
        },
        staleTime: 30 * 60 * 1000,
        enabled: !!slug,
    });
}

// ============================================
// BRAND HOOKS
// ============================================

/**
 * Fetch all brands
 */
export function useBrands() {
    return useQuery({
        queryKey: queryKeys.brands.all,
        queryFn: async () => {
            const response = await api.getBrands();
            return response.data.results || response.data;
        },
        staleTime: 60 * 60 * 1000, // 1 hour - brands rarely change
    });
}

// ============================================
// REVIEW HOOKS
// ============================================

/**
 * Fetch reviews for a bike
 */
export function useBikeReviews(bikeId: string) {
    return useQuery({
        queryKey: queryKeys.reviews.byBike(bikeId),
        queryFn: async () => {
            const response = await api.client.get(`/bikes/models/${bikeId}/reviews/`);
            return response.data.results || response.data;
        },
        enabled: !!bikeId,
    });
}

/**
 * Submit a review
 */
export function useSubmitReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ bikeId, rating, comment }: { bikeId: string; rating: number; comment: string }) => {
            const response = await api.client.post(`/bikes/models/${bikeId}/reviews/`, { rating, comment });
            return response.data;
        },
        onSuccess: (_data, variables) => {
            // Invalidate reviews for this bike
            queryClient.invalidateQueries({
                queryKey: queryKeys.reviews.byBike(variables.bikeId),
            });
        },
    });
}

/**
 * Delete a review
 */
export function useDeleteReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ reviewId }: { reviewId: string; bikeId: string }) => {
            const response = await api.client.delete(`/bikes/reviews/${reviewId}/`);
            return response.data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.reviews.byBike(variables.bikeId),
            });
        },
    });
}

// ============================================
// WISHLIST HOOKS
// ============================================

/**
 * Fetch user's wishlist
 */
export function useWishlist() {
    return useQuery({
        queryKey: queryKeys.wishlist.all,
        queryFn: async () => {
            const response = await api.getWishlist();
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Add to wishlist mutation
 */
export function useAddToWishlist() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (bikeId: string) => {
            const response = await api.toggleWishlist(bikeId);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all });
        },
    });
}

/**
 * Remove from wishlist mutation
 */
export function useRemoveFromWishlist() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (bikeId: string) => {
            const response = await api.toggleWishlist(bikeId);
            return bikeId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all });
        },
    });
}
