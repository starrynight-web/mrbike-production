import { API_ENDPOINTS } from "@/config/constants";
import { 
  Bike, 
  Review, 
  NewsArticle, 
  ApiUsedBikeListing, 
  Brand,
  ApiResponse 
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/**
 * Server-side API utility for Next.js Server Components.
 * Uses native fetch with ISR/caching capabilities.
 */
export const apiServer = {
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    const url = `${API_BASE}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      
      // Handle StandardResponse format { success, data, message }
      if (responseData && typeof responseData === 'object' && 'success' in responseData) {
        return (responseData.data !== undefined ? responseData.data : responseData) as T;
      }

      return responseData as T;
    } catch (error) {
      console.error(`[API Server] Error fetching ${url}:`, error);
      return null;
    }
  },

  // Specific helpers for ISR
  async getBike(slug: string) {
    return this.get<Bike>(API_ENDPOINTS.BIKE_DETAIL(slug), {
        next: { revalidate: 3600, tags: [`bike-${slug}`] }
    });
  },

  async getBikeReviews(bikeId: string | number) {
    return this.get<Review[]>(API_ENDPOINTS.BIKE_REVIEWS(bikeId), {
        next: { revalidate: 3600, tags: [`bike-reviews-${bikeId}`] }
    });
  },

  async getSimilarBikes(slug: string) {
    return this.get<Bike[]>(API_ENDPOINTS.BIKE_SIMILAR(slug), {
        next: { revalidate: 3600 }
    });
  },

  async getAllBikeSlugs() {
    // Helper for generateStaticParams
    const data = await this.get<any>(API_ENDPOINTS.BIKES, {
        next: { revalidate: 86400 } // Cache slugs for 24h
    });
    
    const results = data?.results || (Array.isArray(data) ? data : []);
    return results.map((bike: Bike) => ({ slug: bike.slug }));
  },

  async getArticle(slug: string) {
    return this.get<NewsArticle>(API_ENDPOINTS.NEWS_DETAIL(slug), {
        next: { revalidate: 1800, tags: [`news-${slug}`] }
    });
  },

  async getAllArticleSlugs() {
    const data = await this.get<any>(API_ENDPOINTS.NEWS, {
        next: { revalidate: 3600 }
    });
    const results = data?.results || (Array.isArray(data) ? data : []);
    return results.map((article: NewsArticle) => ({ slug: article.slug }));
  },

  async getUsedBike(slug: string) {
    return this.get<ApiUsedBikeListing>(API_ENDPOINTS.USED_BIKE_DETAIL(slug), {
        next: { revalidate: 30, tags: [`used-bike-${slug}`] }
    });
  },

  async getBrand(slug: string) {
    return this.get<Brand>(API_ENDPOINTS.BRAND_BIKES(slug), {
        next: { revalidate: 86400, tags: [`brand-${slug}`] }
    });
  },

  async getAllUsedBikeSlugs() {
    const data = await this.get<any>(API_ENDPOINTS.USED_BIKES, {
        next: { revalidate: 30 }
    });
    const results = data?.results || (Array.isArray(data) ? data : []);
    return results.map((bike: ApiUsedBikeListing) => ({ slug: bike.slug || String(bike.id) }));
  }
};
