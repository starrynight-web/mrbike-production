/**
 * Admin API Service
 * Handles all admin operations for bikes and used bikes management
 */

import { api } from "./api-service";

// ==================== TYPES ====================

interface Brand {
  id: number;
  name: string;
  logo_url?: string;
}

export interface Bike {
  id: number;
  name: string;
  brand: number | string;
  brand_name?: string;
  category: string;
  price: number;
  primary_image: string;
  image_url?: string; // For compatibility
  featured?: boolean;
  engine_capacity: number;
  engine_type?: string;
  gears?: number;
  clutch_type?: string;
  curb_weight?: number;
  fuel_capacity?: number;
  seat_height?: number;
  tyre_type?: string;
  is_available: boolean;
  description?: string;
  created_at?: string;
}

export interface UsedBikeListing {
  id: number;
  bike_model: string;
  brand: string;
  seller_name: string;
  seller_phone: string;
  seller_location: string;
  price: number;
  year: number;
  mileage: number;
  condition: string;
  status: "pending" | "active" | "rejected" | "sold";
  category?: string;
  image_url: string;
  description: string;
  created_at: string;
  seller_id: number;
}

export interface AdminStats {
  total_users: number;
  total_bikes: number;
  active_listings: number;
  monthly_traffic: number;
  pending_approvals: number;
  user_change: number;
  bikes_change: number;
  listings_change: number;
  traffic_change: number;
  verified_users?: number;
  published_news?: number;
}

// Internal interface for backend response mapping
interface BackendAdminStats {
  users: { total: number; verified: number };
  marketplace: {
    total: number;
    active: number;
    pending: number;
    categories: Array<{ category: string, count: number }>;
    locations: Array<{ location: string, count: number }>;
  };
  content: { published_articles: number; draft_articles: number };
  last_updated: string;
}

// ==================== API CLIENT ====================

class AdminAPI {
  // ===== BIKES MANAGEMENT =====

  /**
   * Get all official bikes with optional filtering and pagination
   */
  async getAllBikes(params?: {
    search?: string;
    status?: "published" | "draft";
    sort?: "name" | "price" | "rating";
    limit?: number;
    offset?: number;
  }) {
    const response = await api.get<any>(
      "/bikes/",
      { params },
    );
    if (!response.success || !response.data) {
      return { results: [], count: 0 };
    }
    // api-service request() wrapper already extracts 'results' from paginated responses
    // So response.data is the array of bikes directly
    const results = Array.isArray(response.data) ? response.data : (response.data.results || []);
    const count = response.meta?.total || results.length;
    return { results, count };
  }

  /**
   * Get single bike by ID
   */
  async getBike(id: number) {
    const response = await api.get(`/bikes/${id}/`);
    return response.data;
  }

  /**
   * Create new bike
   */
  async createBike(data: Partial<Bike>) {
    const response = await api.post("/bikes/", data);
    return response.data;
  }

  /**
   * Update existing bike
   */
  async updateBike(id: number, data: Partial<Bike>) {
    const response = await api.patch(`/bikes/${id}/`, data);
    return response.data;
  }

  /**
   * Delete bike
   */
  async deleteBike(id: number) {
    await api.delete(`/bikes/${id}/`);
  }

  /**
   * Bulk update bike status
   */
  async bulkUpdateBikes(
    ids: number[],
    updates: { published?: boolean; featured?: boolean },
  ) {
    const response = await api.post("/bikes/bulk-update/", {
      ids,
      ...updates,
    });
    return response.data;
  }

  /**
   * Duplicate a bike
   */
  async duplicateBike(id: number) {
    const response = await api.post(`/bikes/${id}/duplicate/`);
    return response.data;
  }

  // ===== USED BIKES MANAGEMENT =====

  /**
   * Get all used bike listings with filtering
   */
  async getAllUsedBikes(params?: {
    status?: "pending" | "active" | "rejected" | "sold";
    search?: string;
    condition?: string;
    sort?: "newest" | "price_asc" | "price_desc";
    limit?: number;
    offset?: number;
  }) {
    const response = await api.get<any>("/marketplace/listings/", { params });
    if (!response.success || !response.data) {
      return { results: [], count: 0 };
    }

    // api-service request() wrapper already extracts 'results' from paginated responses
    const rawData = Array.isArray(response.data) ? response.data : (response.data.results || []);

    // Transform API response to match UsedBikeListing interface
    const results = rawData.map((item: any) => ({
      id: item.id,
      bike_model: item.bike_model_name || item.title || "Unknown Model",
      brand: item.brand_name || item.custom_brand || "Unknown Brand",
      seller_name: item.seller_name || "Unknown Seller",
      seller_phone: item.seller_phone || "",
      seller_location: item.location || "",
      price: Number(item.price) || 0,
      year: item.manufacturing_year || new Date().getFullYear(),
      mileage: item.mileage || 0,
      condition: item.condition || "good",
      status: item.status || "pending",
      image_url: item.image_url || item.images?.[0]?.url || "",
      description: item.description || "",
      created_at: item.created_at || new Date().toISOString(),
      seller_id: item.seller || 0,
      category: item.category || "",
    }));

    return {
      count: response.meta?.total || results.length,
      results: results as UsedBikeListing[],
    };
  }

  /**
   * Get single used bike listing
   */
  async getUsedBike(id: number) {
    const response = await api.get(`/marketplace/listings/${id}/`);
    return response.data;
  }

  /**
   * Approve used bike listing
   */
  async approveListing(id: number, reason?: string) {
    const response = await api.post(`/marketplace/listings/${id}/approve/`, { reason });
    return response.data;
  }

  /**
   * Reject used bike listing
   */
  async rejectListing(id: number, reason: string) {
    const response = await api.post(`/marketplace/listings/${id}/reject/`, { reason });
    return response.data;
  }

  /**
   * Delete used bike listing
   */
  async deleteUsedBike(id: number) {
    await api.delete(`/marketplace/listings/${id}/`);
  }

  /**
   * Mark listing as featured
   */
  async markFeatured(id: number, featured: boolean) {
    const response = await api.patch(`/marketplace/listings/${id}/`, { is_featured: featured });
    return response.data;
  }

  /**
   * Send verification email to seller (using the new resend-verification if needed or specific marketplace logic)
   */
  async sendVerificationEmail(id: number) {
    // This is often for the listing itself if there's a specific logic, 
    // but the backend uses Brevo for user verification now.
    const response = await api.post(`/marketplace/listings/${id}/send-verification/`);
    return response.data;
  }

  // ===== NEWS MANAGEMENT =====

  async getAllNews(params?: {
    search?: string;
    category?: string;
    limit?: number;
    offset?: number;
    ordering?: string;
  }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await api.get<any>("/news/", { params });
    if (!response.success || !response.data) {
      if (!response.success && response.error) {
        throw new Error(response.error.message || "Failed to fetch news articles");
      }
      return { results: [], count: 0 };
    }
    // api-service request() wrapper already extracts 'results' from paginated responses
    const results = Array.isArray(response.data) ? response.data : (response.data.results || []);
    const count = response.meta?.total || results.length;
    return { results, count };
  }

  /**
   * Get single article
   */
  async getArticle(id: string | number) {
    const response = await api.get(`/news/admin/${id}/`);
    if (!response.success) {
      throw new Error(response.error?.message || "Failed to fetch article");
    }
    return response.data;
  }

  /**
   * Create new article
   */
  async createArticle(data: FormData) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await api.post<any>("/news/", data);

    if (!response.success) {
      throw new Error(response.error?.message || "Failed to create article");
    }

    return response.data;
  }

  /**
   * Update article
   */
  async updateArticle(id: string | number, data: FormData) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await api.patch<any>(`/news/admin/${id}/`, data);

    if (!response.success) {
      throw new Error(response.error?.message || "Failed to update article");
    }

    return response.data;
  }

  /**
   * Delete article
   */
  async deleteArticle(id: string | number) {
    const response = await api.delete(`/news/admin/${id}/`);
    if (!response.success) {
      throw new Error(response.error?.message || "Failed to delete article");
    }
  }

  // ===== ADMIN STATISTICS =====

  /**
   * Get admin dashboard statistics
   */
  async getDashboardStats(): Promise<AdminStats> {
    const response = await api.get<BackendAdminStats>("/users/admin/stats/");
    if (!response.success || !response.data) {
      return {
        total_users: 0,
        total_bikes: 0,
        active_listings: 0,
        monthly_traffic: 0,
        pending_approvals: 0,
        user_change: 0,
        bikes_change: 0,
        listings_change: 0,
        traffic_change: 0,
      };
    }

    const d = response.data;
    return {
      total_users: d.users.total,
      verified_users: d.users.verified,
      total_bikes: d.marketplace.total, // Total used listings as a proxy if official bikes not available here
      active_listings: d.marketplace.active,
      pending_approvals: d.marketplace.pending,
      published_news: d.content.published_articles,
      monthly_traffic: 0, // Not implemented in backend yet
      user_change: 0,
      bikes_change: 0,
      listings_change: 0,
      traffic_change: 0,
    };
  }

  /**
   * Get pending approvals count
   */
  async getPendingApprovalsCount(): Promise<{ count: number }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await api.get<any>("/marketplace/listings/?status=pending&limit=1");
    if (!response.success || !response.data) {
      return { count: 0 };
    }
    return { count: response.meta?.total || (Array.isArray(response.data) ? response.data.length : 0) };
  }

  /**
   * Get recent pending listings (for dashboard)
   */
  async getRecentPending(limit: number = 5): Promise<UsedBikeListing[]> {
    const response = await api.get<any>(
      "/marketplace/listings/?status=pending&ordering=-created_at",
      {
        params: { limit },
      },
    );

    if (!response.success || !response.data) {
      return [];
    }

    // api-service request() wrapper already extracts 'results' from paginated responses
    const rawData = Array.isArray(response.data) ? response.data : (response.data.results || []);

    return rawData.map((item: any) => ({
      id: item.id,
      bike_model: item.bike_model_name || item.title || "Unknown Model",
      brand: item.brand_name || item.custom_brand || "Unknown Brand",
      seller_name: item.seller_name || "Unknown Seller",
      seller_phone: item.seller_phone || "",
      seller_location: item.location || "",
      price: Number(item.price) || 0,
      year: item.manufacturing_year || new Date().getFullYear(),
      mileage: item.mileage || 0,
      condition: item.condition || "good",
      status: item.status || "pending",
      image_url: item.image_url || item.images?.[0]?.url || "",
      description: item.description || "",
      created_at: item.created_at || new Date().toISOString(),
      seller_id: item.seller || 0,
    }));
  }

  // ===== IMAGE MANAGEMENT =====

  /**
   * Upload image with compression preview
   */
  async uploadImage(
    file: File,
  ): Promise<{ url: string; size: number; originalSize: number }> {
    const formData = new FormData();
    formData.append("image", file);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await api.post<any>("/bikes/upload-image/", formData);

    return response.data;
  }

  /**
   * Delete image
   */
  async deleteImage(imageId: number) {
    await api.delete(`/images/${imageId}/`);
  }

  // ===== SEARCH & FILTER =====

  /**
   * Search bikes and listings
   */
  async search(query: string, type: "bikes" | "used-bikes" = "bikes") {
    const endpoint = type === "bikes" ? "/bikes/" : "/marketplace/listings/";
    const response = await api.get(endpoint, {
      params: { search: query },
    });
    return response.data;
  }

  /**
   * Get filter options
   */
  async getFilterOptions(): Promise<{
    brands: string[];
    categories: string[];
    conditions: string[];
    fuelTypes: string[];
  }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await api.get<any>("/admin/filter-options/");
    return response.data;
  }

  // ===== BRANDS MANAGEMENT =====

  /**
   * Get all brands
   */
  async getAllBrands() {
    const response = await api.get<Brand[]>("/bikes/brands/");
    return response.data;
  }

  /**
   * Create brand
   */
  async createBrand(data: { name: string; logo_url?: string }) {
    const response = await api.post("/bikes/brands/", data);
    return response.data;
  }

  /**
   * Update brand
   */
  async updateBrand(id: number, data: { name?: string; logo_url?: string }) {
    const response = await api.patch(`/bikes/brands/${id}/`, data);
    return response.data;
  }

  /**
   * Delete brand
   */
  async deleteBrand(id: number) {
    await api.delete(`/bikes/brands/${id}/`);
  }

  // ===== REPORTS & ANALYTICS =====

  /**
   * Get usage analytics
   */
  async getAnalytics(period: "week" | "month" | "year" = "month") {
    const response = await api.get("/admin/analytics/", {
      params: { period },
    });
    return response.data;
  }

  /**
   * Get bike performance metrics
   */
  async getBikeMetrics(id: number) {
    const response = await api.get(`/bikes/${id}/metrics/`);
    return response.data;
  }

  /**
   * Export data
   */
  async exportData(
    type: "bikes" | "listings" | "users",
    format: "csv" | "excel" = "csv",
  ) {
    const response = await api.get(`/admin/export-${type}/`, {
      params: { format },
      responseType: "blob",
    });
    return response.data;
  }
  // ===== SETTINGS MANAGEMENT =====

  async getSettings() {
    const response = await api.get("/admin/settings/");
    return response.data;
  }

  async updateSettings(data: any) {
    const response = await api.patch("/admin/settings/", data);
    return response.data;
  }
}

// Export singleton instance
export const adminAPI = new AdminAPI();
