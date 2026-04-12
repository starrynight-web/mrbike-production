import { MetadataRoute } from "next";
import { APP_CONFIG } from "@/config/constants";
import { apiServer } from "@/lib/api-server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = APP_CONFIG.url;

  // 1. Static Routes
  const staticRoutes: MetadataRoute.Sitemap = [
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
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "hourly" : "daily",
    priority: route === "" ? 1.0 : route === "/bikes" ? 0.9 : 0.8,
  }));

  // 2. Dynamic Bike Routes
  let bikeEntries: MetadataRoute.Sitemap = [];
  try {
    const bikes = await apiServer.get<any[]>("/bikes/"); // Simplified helper call
    const bikeResults = (bikes as any)?.results || (Array.isArray(bikes) ? bikes : []);
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
    const news = await apiServer.get<any[]>("/news/");
    const newsResults = (news as any)?.results || (Array.isArray(news) ? news : []);
    newsEntries = newsResults.map((article: any) => ({
      url: `${baseUrl}/news/${article.slug}`,
      lastModified: new Date(article.updated_at || new Date()),
      changeFrequency: "daily",
      priority: 0.7,
    }));
  } catch (e) {
    console.error("Sitemap: Failed to fetch news", e);
  }

  // 4. Dynamic Used Bike Routes
  let usedBikeEntries: MetadataRoute.Sitemap = [];
  try {
    const usedBikes = await apiServer.get<any[]>("/marketplace/listings/");
    const usedResults = (usedBikes as any)?.results || (Array.isArray(usedBikes) ? usedBikes : []);
    usedBikeEntries = usedResults.map((bike: any) => ({
      url: `${baseUrl}/used-bike/${bike.slug}`,
      lastModified: new Date(bike.updated_at || new Date()),
      changeFrequency: "daily",
      priority: 0.8,
    }));
  } catch (e) {
    console.error("Sitemap: Failed to fetch used bikes", e);
  }

  // 5. Dynamic Brand Routes
  let brandEntries: MetadataRoute.Sitemap = [];
  try {
    const brands = await apiServer.get<any[]>("/bikes/brands/");
    const brandResults = (brands as any)?.results || (Array.isArray(brands) ? brands : []);
    brandEntries = brandResults.map((brand: any) => ({
      url: `${baseUrl}/brands/${brand.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (e) {
    console.error("Sitemap: Failed to fetch brands", e);
  }

  return [...staticRoutes, ...bikeEntries, ...newsEntries, ...usedBikeEntries, ...brandEntries];
}
