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
