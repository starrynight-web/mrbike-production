import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-service";
import type { NewsArticle } from "@/types";

export function useNews(category?: string) {
    return useQuery({
        queryKey: ["news", category],
        queryFn: async () => {
            const response = await api.getNews(category ? { category__slug: category } : {});
            const results = response.data.results || response.data || [];
            return results.map((article: any) => ({
                ...article,
                featuredImage: article.featured_image,
                publishedAt: article.published_at,
                category: article.category?.name
            })) as NewsArticle[];
        },
        staleTime: 10 * 60 * 1000,
    });
}

export function useNewsArticle(slug: string) {
    return useQuery({
        queryKey: ["news", "article", slug],
        queryFn: async () => {
            const response = await api.getArticleBySlug(slug);
            const data = response.data;
            // Map snake_case to camelCase with guards for missing author
            const safeAuthor = data.author || {};
            const authorName = `${safeAuthor?.first_name || ""} ${safeAuthor?.last_name || ""}`.trim() || safeAuthor?.username || "";
            return {
                ...data,
                featuredImage: data.featured_image,
                publishedAt: data.published_at,
                category: data.category?.name,
                tags: data.tags?.map((t: any) => t.name) || [],
                author: {
                    ...safeAuthor,
                    name: authorName,
                    image: safeAuthor?.profile_image
                }
            } as NewsArticle;
        },
        enabled: !!slug,
        staleTime: 30 * 60 * 1000,
    });
}
