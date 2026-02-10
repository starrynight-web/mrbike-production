import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-service";
import { ApiUsedBikeListing, Review } from "@/types";

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
      if (!response.success) throw new Error(response.error?.message || "Failed to fetch user stats");
      return response.data as UserStats;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyListings() {
  return useQuery({
    queryKey: ["user", "listings"],
    queryFn: async () => {
      const response = await api.getMyListings();
      if (!response.success) throw new Error(response.error?.message || "Failed to fetch listings");
      return (response.data as ApiUsedBikeListing[]) || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyReviews() {
  return useQuery({
    queryKey: ["user", "reviews"],
    queryFn: async () => {
      const response = await api.getUserReviews();
      if (!response.success) throw new Error(response.error?.message || "Failed to fetch reviews");
      return (response.data as Review[]) || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["user", "notifications"],
    queryFn: async () => {
      const response = await api.getNotifications();
      if (!response.success) throw new Error(response.error?.message || "Failed to fetch notifications");
      return (response.data as any[]) || [];
    },
    staleTime: 1 * 60 * 1000,
  });
}
