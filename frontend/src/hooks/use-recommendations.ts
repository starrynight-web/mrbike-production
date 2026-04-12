import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-service";
import { API_ENDPOINTS } from "@/config/constants";
import { UsedBike } from "@/types";
import { mapUsedBike } from "@/lib/data-utils";

export function useEmotionalRecommendations(slug: string) {
  return useQuery({
    queryKey: ["bikes", slug, "emotional-recommendations"],
    queryFn: async () => {
      const response = await api.get<any[]>(
        API_ENDPOINTS.BIKE_EMOTIONAL_RECOMMENDATIONS(slug)
      );
      if (!response.success) {
        throw new Error(response.error?.message || "Failed to fetch recommendations");
      }
      return (response.data || []).map(mapUsedBike);
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}
