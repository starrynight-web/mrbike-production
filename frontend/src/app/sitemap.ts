import { MetadataRoute } from "next";
import { APP_CONFIG } from "@/config/constants";
import { apiServer } from "@/lib/api-server";

// For a production SaaS, we use generateSitemaps to avoid the 50,000 URL limit per file.
export async function generateSitemaps() {
  // We can have multiple sitemaps (e.g., bikes-0, bikes-1, etc.)
  // For now, we'll just return one main sitemap ID.
  return [{ id: 0 }];
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const baseUrl = APP_CONFIG.url;

  // 1. Static Routes (Only on the first sitemap)
  const staticRoutes: MetadataRoute.Sitemap = id === 0 ? [
    "",
    "/bikes",
    "/used-bikes",
    "/compare",
    "/brands",
    "/news",
    "/about",
    "/privacy",
    "/terms",
    "/contact",
    "/dealers",
    "/faqs",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1.0 : 0.8,
  })) : [];

  // 2. Dynamic Bike Routes (Fetch all or by 'id' if paginated)
  let bikeEntries: MetadataRoute.Sitemap = [];
  try {
    // In a real paginated scenario, we'd use the 'id' to fetch a specific range
    const bikes = await apiServer.get<any>("/bikes/?limit=1000"); 
    const bikeResults = bikes?.results || (Array.isArray(bikes) ? bikes : []);
    bikeEntries = bikeResults.map((bike: any) => ({
      url: `${baseUrl}/bike/${bike.slug}`,
      lastModified: new Date(bike.updated_at || new Date()),
      changeFrequency: "weekly",
      priority: 0.9,
    }));
  } catch (e) {
    console.error("Sitemap: Failed to fetch bikes", e);
  }

  // 3. Dynamic News Routes
  let newsEntries: MetadataRoute.Sitemap = [];
  try {
    const news = await apiServer.get<any>("/news/?limit=500");
    const newsResults = news?.results || (Array.isArray(news) ? news : []);
    newsEntries = newsResults.map((article: any) => ({
      url: `${baseUrl}/news/${article.slug}`,
      lastModified: new Date(article.published_at || new Date()),
      changeFrequency: "monthly",
      priority: 0.7,
    }));
  } catch (e) {
    console.error("Sitemap: Failed to fetch news", e);
  }

  // 4. Dynamic Used Bike Routes
  let usedBikeEntries: MetadataRoute.Sitemap = [];
  try {
    const usedBikes = await apiServer.get<any>("/marketplace/listings/?limit=1000");
    const usedResults = usedBikes?.results || (Array.isArray(usedBikes) ? usedBikes : []);
    usedBikeEntries = usedResults.map((bike: any) => ({
      url: `${baseUrl}/used-bike/${bike.slug}`,
      lastModified: new Date(bike.updated_at || new Date()),
      changeFrequency: "daily",
      priority: 0.6,
    }));
  } catch (e) {
    console.error("Sitemap: Failed to fetch used bikes", e);
  }

  // 5. Dynamic Brand Routes
  let brandEntries: MetadataRoute.Sitemap = [];
  try {
    const brands = await apiServer.get<any>("/bikes/brands/?limit=100");
    const brandResults = brands?.results || (Array.isArray(brands) ? brands : []);
    brandEntries = brandResults.map((brand: any) => ({
      url: `${baseUrl}/brands/${brand.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    }));
  } catch (e) {
    console.error("Sitemap: Failed to fetch brands", e);
  }

  return [...staticRoutes, ...bikeEntries, ...newsEntries, ...usedBikeEntries, ...brandEntries];
}
