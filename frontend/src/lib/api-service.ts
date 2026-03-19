import axios, { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { getSession, signOut } from "next-auth/react";
import { API_ENDPOINTS } from "@/config/constants";
import { 
  QueryParams, 
  ApiResponse, 
  ApiError, 
  Bike, 
  Brand, 
  ApiUsedBikeListing, 
  NewsArticle,
  Review,
  WishlistItem,
  User
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

class ApiService {
  public client;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE,
      timeout: 60000,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
      paramsSerializer: (params) => {
        const searchParams = new URLSearchParams();
        for (const key in params) {
          const value = params[key] as any;
          if (Array.isArray(value)) {
            value.forEach((v) => {
              if (v !== undefined && v !== null && v !== "") {
                searchParams.append(key, v);
              }
            });
          } else if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
          }
        }
        return searchParams.toString();
      },
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
          console.error("[API] Session retrieval error:", error);
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const newSession = await getSession();
            if (newSession?.accessToken) {
              originalRequest.headers.Authorization = `Bearer ${newSession.accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            console.error("[API] Token refresh failed:", refreshError);
          }

          if (typeof window !== "undefined") {
            signOut({ callbackUrl: '/login' });
          }
        }

        const retryCount = originalRequest._retryCount || 0;
        const isGetRequest = originalRequest.method?.toLowerCase() === 'get';

        if (
          isGetRequest &&
          retryCount < 2 &&
          (!error.response || error.response.status === 502 || error.response.status === 503)
        ) {
          originalRequest._retryCount = retryCount + 1;
          await new Promise((r) => setTimeout(r, 1000 * (retryCount + 1))); 
          return this.client(originalRequest);
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

  private async request<T>(promise: Promise<AxiosResponse>): Promise<ApiResponse<T>> {
    try {
      const response = await promise;
      const responseData = response.data;

      let extractedData = responseData;
      if (responseData && typeof responseData === 'object' && 'success' in responseData) {
        extractedData = responseData.data !== undefined ? responseData.data : responseData;
      }

      return {
        success: true,
        data: extractedData?.results !== undefined ? extractedData.results : extractedData,
        meta: extractedData?.count !== undefined ? {
          total: extractedData.count,
          page: 1,
          limit: 20,
          totalPages: Math.ceil(extractedData.count / 20),
          hasPrevPage: !!extractedData.previous,
          hasNextPage: !!extractedData.next,
          currentPage: 1
        } : undefined
      };
    } catch (error: unknown) {
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
    return this.request<Bike[]>(this.client.get(API_ENDPOINTS.BIKES, { params }));
  }

  async getBikeBySlug(slug: string) {
    return this.request<Bike>(this.client.get(API_ENDPOINTS.BIKE_DETAIL(slug)));
  }

  async getBrands() {
    return this.request<Brand[]>(this.client.get(API_ENDPOINTS.BRANDS));
  }

  async resendVerificationEmail() {
    return this.request<null>(this.client.post(API_ENDPOINTS.AUTH_RESEND_VERIFICATION));
  }

  // Marketplace APIs
  async getUsedBikes(params: QueryParams = {}) {
    return this.request<ApiUsedBikeListing[]>(this.client.get(API_ENDPOINTS.USED_BIKES, { params }));
  }

  async getUsedBike(id: string) {
    return this.request<ApiUsedBikeListing>(this.client.get(API_ENDPOINTS.USED_BIKE_DETAIL(id)));
  }

  async createUsedBike(data: FormData) {
    return this.request<ApiUsedBikeListing>(this.client.post(API_ENDPOINTS.USED_BIKE_CREATE, data, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 300000, 
    }));
  }

  async getMyListings() {
    return this.request<ApiUsedBikeListing[]>(this.client.get(API_ENDPOINTS.USER_LISTINGS));
  }

  // Interaction APIs
  async getWishlist() {
    return this.request<WishlistItem>(this.client.get(API_ENDPOINTS.WISHLIST));
  }

  async toggleWishlist(bikeId: string | number) {
    return this.request<{ status: string }>(this.client.post(API_ENDPOINTS.WISHLIST_TOGGLE(bikeId)));
  }

  async getBikeReviews(bikeId: string | number) {
    return this.request<Review[]>(this.client.get(API_ENDPOINTS.BIKE_REVIEWS(bikeId)));
  }

  async submitReview(bikeId: string | number, rating: number, comment: string) {
    return this.request<Review>(this.client.post(API_ENDPOINTS.REVIEW_CREATE(bikeId), { rating, comment }));
  }

  async getUserReviews() {
    return this.request<Review[]>(this.client.get(API_ENDPOINTS.USER_REVIEWS));
  }

  async sendInquiry(data: Record<string, unknown>) {
    return this.request<null>(this.client.post(API_ENDPOINTS.INQUIRIES, data));
  }

  // Recommendation APIs
  async getSimilarBikes(slug: string) {
    return this.request<Bike[]>(this.client.get(API_ENDPOINTS.BIKE_SIMILAR(slug)));
  }

  async getUsedBikesNearBudget(budget: number) {
    return this.request<ApiUsedBikeListing[]>(this.client.get(API_ENDPOINTS.BIKE_USED(budget.toString()), { params: { budget } }));
  }

  // News APIs
  async getNews(params: QueryParams = {}) {
    return this.request<NewsArticle[]>(this.client.get(API_ENDPOINTS.NEWS, { params }));
  }

  async getArticleBySlug(slug: string) {
    return this.request<NewsArticle>(this.client.get(API_ENDPOINTS.NEWS_DETAIL(slug)));
  }

  // User Profile APIs
  async getUserStats() {
    return this.request<any>(this.client.get(API_ENDPOINTS.USER_STATS));
  }

  async updateProfile(data: Partial<User>) {
    return this.request<User>(this.client.patch(API_ENDPOINTS.USER_PROFILE, data));
  }

  async getNotifications() {
    return this.request<any[]>(this.client.get(API_ENDPOINTS.USER_NOTIFICATIONS));
  }

  // Generic HTTP Methods
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
