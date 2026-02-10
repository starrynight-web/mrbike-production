import axios, { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { getSession, signOut } from "next-auth/react";
import { API_ENDPOINTS } from "@/config/constants";
import { QueryParams, ApiResponse, ApiError } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

class ApiService {
  public client;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE,
      timeout: 15000,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        try {
          const session = await getSession();
          if (session?.accessToken) {
            config.headers.Authorization = `Bearer ${session.accessToken}`;
          }
        } catch (error) {
          console.error("Session retrieval error:", error);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          if (typeof window !== "undefined") {
            // Let next-auth handle logout if unauthorized
            // signOut({ callbackUrl: '/login' });
          }
        }

        const apiError: ApiError = {
          message: error.response?.data?.message || error.message || "An unexpected error occurred",
          code: error.response?.data?.code || `HTTP_${error.response?.status}`,
          details: error.response?.data?.details
        };

        return Promise.reject(apiError);
      }
    );
  }

  // Generic wrapper for standard response format
  private async request<T>(promise: Promise<AxiosResponse>): Promise<ApiResponse<T>> {
    try {
      const response = await promise;
      return {
        success: true,
        data: response.data.results || response.data,
        meta: response.data.count !== undefined ? {
          total: response.data.count,
          page: 1, // Fallback, hooks should handle pagination normalization
          limit: 20,
          totalPages: Math.ceil(response.data.count / 20),
          hasPrevPage: !!response.data.previous,
          hasNextPage: !!response.data.next,
          currentPage: 1
        } : undefined
      };
    } catch (error: any) {
      return {
        success: false,
        error: error as ApiError
      };
    }
  }

  // Auth APIs
  async loginWithGoogle(idToken: string) {
    return this.request(this.client.post(API_ENDPOINTS.AUTH_GOOGLE, { id_token: idToken }));
  }

  async sendOtp(phone: string) {
    return this.request(this.client.post(API_ENDPOINTS.AUTH_OTP_SEND, { phone }));
  }

  async verifyPhone(phone: string, otp: string) {
    return this.request(this.client.post(API_ENDPOINTS.AUTH_OTP_VERIFY, { phone, otp }));
  }

  // Bike APIs
  async getBikes(params: QueryParams = {}) {
    return this.request<any[]>(this.client.get(API_ENDPOINTS.BIKES, { params }));
  }

  async getBikeBySlug(slug: string) {
    return this.request<any>(this.client.get(API_ENDPOINTS.BIKE_DETAIL(slug)));
  }

  async getBrands() {
    return this.request<any[]>(this.client.get(API_ENDPOINTS.BRANDS));
  }

  // Marketplace APIs
  async getUsedBikes(params: QueryParams = {}) {
    return this.request<any[]>(this.client.get(API_ENDPOINTS.USED_BIKES, { params }));
  }

  async getUsedBike(id: string) {
    return this.request<any>(this.client.get(API_ENDPOINTS.USED_BIKE_DETAIL(id)));
  }

  async createUsedBike(data: FormData) {
    return this.request<any>(this.client.post(API_ENDPOINTS.USED_BIKE_CREATE, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }));
  }

  async getMyListings() {
    return this.request<any[]>(this.client.get(API_ENDPOINTS.USER_LISTINGS));
  }

  // Interaction APIs
  async getWishlist() {
    return this.request<any[]>(this.client.get(API_ENDPOINTS.WISHLIST));
  }

  async toggleWishlist(bikeId: string | number) {
    return this.request<any>(this.client.post(API_ENDPOINTS.WISHLIST_TOGGLE(bikeId)));
  }

  async getBikeReviews(bikeId: string | number) {
    return this.request<any[]>(this.client.get(API_ENDPOINTS.BIKE_REVIEWS(bikeId)));
  }

  async submitReview(bikeId: string | number, rating: number, comment: string) {
    return this.request<any>(this.client.post(API_ENDPOINTS.REVIEW_CREATE(bikeId), { rating, comment }));
  }

  async getUserReviews() {
    return this.request<any[]>(this.client.get(API_ENDPOINTS.USER_REVIEWS));
  }

  async sendInquiry(data: Record<string, unknown>) {
    return this.request(this.client.post(API_ENDPOINTS.INQUIRIES, data));
  }

  // Recommendation APIs
  async getSimilarBikes(slug: string) {
    return this.request(this.client.get(API_ENDPOINTS.BIKE_SIMILAR(slug)));
  }

  async getUsedBikesNearBudget(budget: number) {
    return this.request(this.client.get(API_ENDPOINTS.BIKE_USED(budget.toString()), { params: { budget } }));
  }

  // News APIs
  async getNews(params: QueryParams = {}) {
    return this.request(this.client.get(API_ENDPOINTS.NEWS, { params }));
  }

  async getArticleBySlug(slug: string) {
    return this.request(this.client.get(API_ENDPOINTS.NEWS_DETAIL(slug)));
  }

  // User Profile APIs
  async getUserStats() {
    return this.request(this.client.get(API_ENDPOINTS.USER_STATS));
  }

  async getNotifications() {
    return this.request(this.client.get(API_ENDPOINTS.USER_NOTIFICATIONS));
  }

  // Generic HTTP Methods for compatibility
  async get<T>(url: string, config?: any): Promise<ApiResponse<T>> {
    return this.request<T>(this.client.get(url, config));
  }

  async post<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    return this.request<T>(this.client.post(url, data, config));
  }

  async patch<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    return this.request<T>(this.client.patch(url, data, config));
  }

  async delete<T>(url: string, config?: any): Promise<ApiResponse<T>> {
    return this.request<T>(this.client.delete(url, config));
  }
}

export const api = new ApiService();
