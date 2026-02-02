import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-service";
import type { NewsArticle } from "@/types";

export function useNews(category?: string) {
    return useQuery({
        queryKey: ["news", category],
        queryFn: async () => {
            const response = await api.getNews(category ? { category__slug: category } : {});
            return response.data.results || response.data || [];
        },
        staleTime: 10 * 60 * 1000,
    });
}

export function useNewsArticle(slug: string) {
    return useQuery({
        queryKey: ["news", "article", slug],
        queryFn: async () => {
            const response = await api.getArticleBySlug(slug);
            return response.data;
        },
        enabled: !!slug,
        staleTime: 30 * 60 * 1000,
    });
}
