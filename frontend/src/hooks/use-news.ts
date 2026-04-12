import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-service";
import { mapArticle } from "@/lib/data-utils";
import type { NewsArticle, PaginationMeta } from "@/types";

export function useNews(filters?: { category?: string; page?: number; limit?: number }) {
    return useQuery({
        queryKey: ["news", filters],
        queryFn: async () => {
            const queryParams: Record<string, string | number> = {};
            if (filters?.category) queryParams.category__slug = filters.category;
            if (filters?.page) queryParams.page = filters.page;

            const response = await api.getNews(queryParams);
            if (!response.success) throw new Error(response.error?.message || "Failed to fetch news");

            return {
                articles: (response.data || []).map(mapArticle),
                meta: response.meta as PaginationMeta
            };
        },
        staleTime: 10 * 60 * 1000,
    });
}

export function useNewsArticle(slug: string, initialData?: NewsArticle) {
    return useQuery({
        queryKey: ["news", "article", slug],
        queryFn: async () => {
            const response = await api.getArticleBySlug(slug);
            if (!response.success) throw new Error(response.error?.message || "Failed to fetch article");
            return mapArticle(response.data);
        },
        initialData: initialData,
        enabled: !!slug,
        staleTime: 30 * 60 * 1000,
    });
}
