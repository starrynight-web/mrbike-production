import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bikeService, brandService, reviewService, wishlistService } from "@/lib/api";
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
            const response = await bikeService.getAll(filters);
            if (!response.success) {
                throw new Error(response.error?.message || "Failed to fetch bikes");
            }
            return response.data;
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
            const response = await bikeService.getBySlug(slug);
            if (!response.success) {
                throw new Error(response.error?.message || "Failed to fetch bike");
            }
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
            const response = await bikeService.getSimilar(slug);
            if (!response.success) {
                throw new Error(response.error?.message || "Failed to fetch similar bikes");
            }
            return response.data;
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
            const response = await bikeService.getUsedNearBudget(slug);
            if (!response.success) {
                throw new Error(response.error?.message || "Failed to fetch recommendations");
            }
            return response.data;
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
            const response = await brandService.getAll();
            if (!response.success) {
                throw new Error(response.error?.message || "Failed to fetch brands");
            }
            return response.data;
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
            const response = await reviewService.getBikeReviews(bikeId);
            if (!response.success) {
                throw new Error(response.error?.message || "Failed to fetch reviews");
            }
            return response.data;
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
        mutationFn: async ({ bikeId, rating }: { bikeId: string; rating: number }) => {
            const response = await reviewService.create(bikeId, rating);
            if (!response.success) {
                throw new Error(response.error?.message || "Failed to submit review");
            }
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
        mutationFn: async ({ reviewId, bikeId }: { reviewId: string; bikeId: string }) => {
            const response = await reviewService.delete(reviewId);
            if (!response.success) {
                throw new Error(response.error?.message || "Failed to delete review");
            }
            return { reviewId, bikeId };
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
            const response = await wishlistService.getAll();
            if (!response.success) {
                throw new Error(response.error?.message || "Failed to fetch wishlist");
            }
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
            const response = await wishlistService.add(bikeId);
            if (!response.success) {
                throw new Error(response.error?.message || "Failed to add to wishlist");
            }
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
            const response = await wishlistService.remove(bikeId);
            if (!response.success) {
                throw new Error(response.error?.message || "Failed to remove from wishlist");
            }
            return bikeId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all });
        },
    });
}
