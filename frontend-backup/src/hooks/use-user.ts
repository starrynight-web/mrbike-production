import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-service";

export interface UserStats {
    listings_count: number;
    wishlist_count: number;
    reviews_count: number;
    member_since: string;
}

export function useUserStats() {
    return useQuery({
        queryKey: ["user", "stats"],
        queryFn: async () => {
            const response = await api.getUserStats();
            return response.data as UserStats;
        },
        staleTime: 5 * 60 * 1000,
    });
}

export function useUserListings() {
    return useQuery({
        queryKey: ["user", "listings"],
        queryFn: async () => {
            const response = await api.getMyListings();
            return response.data;
        },
    });
}

export function useUserReviews() {
    return useQuery({
        queryKey: ["user", "reviews"],
        queryFn: async () => {
            const response = await api.getUserReviews();
            return response.data;
        },
    });
}

export function useUserWishlist() {
    return useQuery({
        queryKey: ["user", "wishlist"],
        queryFn: async () => {
            const response = await api.getWishlist();
            return response.data;
        },
    });
}
