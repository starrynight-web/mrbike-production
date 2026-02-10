import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-service";
import type { NewsArticle, PaginationMeta } from "@/types";

export function useNews(filters?: { category?: string; page?: number; limit?: number }) {
    return useQuery({
        queryKey: ["news", filters],
        queryFn: async () => {
            const queryParams: any = {};
            if (filters?.category) queryParams.category__slug = filters.category;
            if (filters?.page) queryParams.page = filters.page;

            const response = await api.getNews(queryParams);
            if (!response.success) throw new Error(response.error?.message || "Failed to fetch news");

            return {
                articles: (response.data as NewsArticle[]) || [],
                meta: response.meta as PaginationMeta
            };
        },
        staleTime: 10 * 60 * 1000,
    });
}

export function useNewsArticle(slug: string) {
    return useQuery({
        queryKey: ["news", "article", slug],
        queryFn: async () => {
            const response = await api.getArticleBySlug(slug);
            if (!response.success) throw new Error(response.error?.message || "Failed to fetch article");
            return response.data as NewsArticle;
        },
        enabled: !!slug,
        staleTime: 30 * 60 * 1000,
    });
}
