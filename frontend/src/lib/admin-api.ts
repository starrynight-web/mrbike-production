/**
 * Admin API Service
 * Handles all admin operations for bikes and used bikes management
 */

import { api } from './api';

// ==================== TYPES ====================

export interface Bike {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  image_url: string;
  featured: boolean;
  published: boolean;
  ratings: number;
  reviews_count: number;
  stock: number;
  engine_cc: number;
  fuel_type: string;
  transmission: string;
  braking_system: string;
  features: string[];
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
  status: 'pending' | 'approved' | 'rejected';
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
}

// ==================== API CLIENT ====================

class AdminAPI {
  // ===== BIKES MANAGEMENT =====

  /**
   * Get all official bikes with optional filtering and pagination
   */
  async getAllBikes(params?: {
    search?: string;
    status?: 'published' | 'draft';
    sort?: 'name' | 'price' | 'rating';
    limit?: number;
    offset?: number;
  }) {
    const response = await api.get('/bikes/', { params });
    return response.data;
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
    const response = await api.post('/bikes/', data);
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
  async bulkUpdateBikes(ids: number[], updates: { published?: boolean; featured?: boolean }) {
    const response = await api.post('/bikes/bulk-update/', {
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
    status?: 'pending' | 'approved' | 'rejected';
    search?: string;
    condition?: string;
    sort?: 'newest' | 'price_asc' | 'price_desc';
    limit?: number;
    offset?: number;
  }) {
    const response = await api.get('/used-bikes/', { params });
    return response.data;
  }

  /**
   * Get single used bike listing
   */
  async getUsedBike(id: number) {
    const response = await api.get(`/used-bikes/${id}/`);
    return response.data;
  }

  /**
   * Approve used bike listing
   */
  async approveListing(id: number, reason?: string) {
    const response = await api.post(`/used-bikes/${id}/approve/`, { reason });
    return response.data;
  }

  /**
   * Reject used bike listing
   */
  async rejectListing(id: number, reason: string) {
    const response = await api.post(`/used-bikes/${id}/reject/`, { reason });
    return response.data;
  }

  /**
   * Delete used bike listing
   */
  async deleteUsedBike(id: number) {
    await api.delete(`/used-bikes/${id}/`);
  }

  /**
   * Mark listing as featured
   */
  async markFeatured(id: number, featured: boolean) {
    const response = await api.patch(`/used-bikes/${id}/`, { featured });
    return response.data;
  }

  /**
   * Send verification email to seller
   */
  async sendVerificationEmail(id: number) {
    const response = await api.post(`/used-bikes/${id}/send-verification/`);
    return response.data;
  }

  // ===== ADMIN STATISTICS =====

  /**
   * Get admin dashboard statistics
   */
  async getDashboardStats(): Promise<AdminStats> {
    const response = await api.get('/admin/stats/');
    return response.data;
  }

  /**
   * Get pending approvals count
   */
  async getPendingApprovalsCount(): Promise<{ count: number }> {
    const response = await api.get('/used-bikes/?status=pending&limit=1');
    return { count: response.data.count || 0 };
  }

  /**
   * Get recent pending listings (for dashboard)
   */
  async getRecentPending(limit: number = 5): Promise<UsedBikeListing[]> {
    const response = await api.get('/used-bikes/?status=pending&ordering=-created_at', {
      params: { limit },
    });
    return response.data.results || [];
  }

  // ===== IMAGE MANAGEMENT =====

  /**
   * Upload image with compression preview
   */
  async uploadImage(file: File): Promise<{ url: string; size: number; originalSize: number }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/bikes/upload-image/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

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
  async search(query: string, type: 'bikes' | 'used-bikes' = 'bikes') {
    const endpoint = type === 'bikes' ? '/bikes/' : '/used-bikes/';
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
    const response = await api.get('/admin/filter-options/');
    return response.data;
  }

  // ===== BRANDS MANAGEMENT =====

  /**
   * Get all brands
   */
  async getAllBrands() {
    const response = await api.get('/brands/');
    return response.data;
  }

  /**
   * Create brand
   */
  async createBrand(data: { name: string; logo_url?: string }) {
    const response = await api.post('/brands/', data);
    return response.data;
  }

  /**
   * Update brand
   */
  async updateBrand(id: number, data: { name?: string; logo_url?: string }) {
    const response = await api.patch(`/brands/${id}/`, data);
    return response.data;
  }

  /**
   * Delete brand
   */
  async deleteBrand(id: number) {
    await api.delete(`/brands/${id}/`);
  }

  // ===== REPORTS & ANALYTICS =====

  /**
   * Get usage analytics
   */
  async getAnalytics(period: 'week' | 'month' | 'year' = 'month') {
    const response = await api.get('/admin/analytics/', {
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
  async exportData(type: 'bikes' | 'listings' | 'users', format: 'csv' | 'excel' = 'csv') {
    const response = await api.get(`/admin/export-${type}/`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  }
}

// Export singleton instance
export const adminAPI = new AdminAPI();
