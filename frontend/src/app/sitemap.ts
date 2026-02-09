import { MetadataRoute } from "next";
import { APP_CONFIG } from "@/config/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = APP_CONFIG.url;

  // In a real production build, these would fetch from the actual API
  // For the generator to work, we'll use the API_URL if defined or default localhost
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

  let bikeEntries: MetadataRoute.Sitemap = [];
  try {
    const bikesRes = await fetch(`${apiUrl}/bikes/models/`, {
      next: { revalidate: 3600 },
    });
    if (bikesRes.ok) {
      const data = await bikesRes.json();
      // Handle DRF pagination or direct array
      const bikes = Array.isArray(data) ? data : data.results || [];

      bikeEntries = bikes.map(
        (bike: { slug: string; updated_at?: string }) => ({
          url: `${baseUrl}/bike/${bike.slug}`,
          lastModified: new Date(bike.updated_at || new Date()),
          changeFrequency: "weekly",
          priority: 0.8,
        }),
      );
    }
  } catch (e) {
    console.error("Sitemap: Failed to fetch bikes", e);
  }

  let newsEntries: MetadataRoute.Sitemap = [];
  try {
    const newsRes = await fetch(`${apiUrl}/news/`, {
      next: { revalidate: 3600 },
    });
    if (newsRes.ok) {
      const data = await newsRes.json();
      // Handle DRF pagination or direct array
      const news = Array.isArray(data) ? data : data.results || [];

      newsEntries = news.map(
        (article: { slug: string; updated_at?: string }) => ({
          url: `${baseUrl}/news/${article.slug}`,
          lastModified: new Date(article.updated_at || new Date()),
          changeFrequency: "monthly",
          priority: 0.6,
        }),
      );
    }
  } catch (e) {
    console.error("Sitemap: Failed to fetch news", e);
  }

  const staticRoutes = [
    "",
    "/bikes",
    "/used-bikes",
    "/compare",
    "/brands",
    "/news",
    "/about",
    "/privacy",
    "/terms",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.7,
  }));

  return [...staticRoutes, ...bikeEntries, ...newsEntries];
}
