import type { ApiResponse, ApiError } from "@/types";
import { API_ENDPOINTS } from "@/config/constants";

// ============================================
// API CLIENT - TYPE-SAFE HTTP CLIENT
// ============================================

import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosRequestConfig,
} from "axios";

// ============================================
// API CLIENT - TYPE-SAFE HTTP CLIENT
// ============================================

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

class ApiClient {
  private client: AxiosInstance;

  constructor(baseUrl: string) {
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor: Add JWT token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("accessToken")
            : null;
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor: Handle token refresh
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !originalRequest.url?.includes("/auth/")
        ) {
          originalRequest._retry = true;
          const refreshToken =
            typeof window !== "undefined"
              ? localStorage.getItem("refreshToken")
              : null;

          if (refreshToken) {
            try {
              const response = await axios.post(
                `${API_BASE_URL}/auth/refresh/`,
                {
                  refresh: refreshToken,
                },
              );
              const { access } = response.data;

              if (typeof window !== "undefined") {
                localStorage.setItem("accessToken", access);
              }

              originalRequest.headers.Authorization = `Bearer ${access}`;
              return this.client(originalRequest);
            } catch {
              // Clear tokens and redirect to login if refresh fails
              if (typeof window !== "undefined") {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.location.href = "/login";
              }
            }
          }
        }

        // Format error to match ApiResponse type structure
        const apiError: ApiError = {
          code:
            error.response?.data?.code ||
            `HTTP_${error.response?.status || "UNKNOWN"}`,
          message:
            error.response?.data?.message ||
            error.message ||
            "An error occurred",
          details: error.response?.data?.details,
        };

        return Promise.reject({ success: false, error: apiError });
      },
    );
  }

  /**
   * Helper to wrap axios calls in our ApiResponse format
   */
  private async wrapRequest<T>(
    request: Promise<AxiosResponse>,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await request;
      return {
        success: true,
        data: response.data.data ?? response.data,
        meta: response.data.meta,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // Error is already formatted in interceptor or is a network error
      if (error.success === false) return error;

      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: error.message || "Network error",
        },
      };
    }
  }

  /**
   * GET request
   */
  async get<T>(
    endpoint: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.wrapRequest<T>(this.client.get(endpoint, config));
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.wrapRequest<T>(this.client.post(endpoint, data, config));
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.wrapRequest<T>(this.client.put(endpoint, data, config));
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.wrapRequest<T>(this.client.patch(endpoint, data, config));
  }

  /**
   * DELETE request
   */
  async delete<T>(
    endpoint: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.wrapRequest<T>(this.client.delete(endpoint, config));
  }

  /**
   * Upload file with multipart form data
   */
  async upload<T>(
    endpoint: string,
    formData: FormData,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.wrapRequest<T>(
      this.client.post(endpoint, formData, {
        ...config,
        headers: {
          ...config?.headers,
          "Content-Type": "multipart/form-data",
        },
      }),
    );
  }
}

// Export singleton instance
export const api = new ApiClient(API_BASE_URL);

// ============================================
// API SERVICE METHODS
// ============================================

import type {
  Bike,
  BikeFilters,
  UsedBike,
  UsedBikeFilters,
  NewsArticle,
  Brand,
  Review,
  WishlistItem,
  BikeRecommendation,
  UsedBikeRecommendation,
  PaginationMeta,
} from "@/types";

export const bikeService = {
  getAll: (filters?: BikeFilters) =>
    api.get<{ bikes: Bike[]; meta: PaginationMeta }>(API_ENDPOINTS.BIKES, {
      params: filters as Record<string, string | number | boolean | undefined>,
    }),

  getBySlug: (slug: string) => api.get<Bike>(API_ENDPOINTS.BIKE_DETAIL(slug)),

  getSimilar: (slug: string) =>
    api.get<BikeRecommendation[]>(API_ENDPOINTS.BIKE_SIMILAR(slug)),

  getUsedNearBudget: (slug: string) =>
    api.get<UsedBikeRecommendation[]>(API_ENDPOINTS.BIKE_USED(slug)),
};

export const brandService = {
  getAll: () => api.get<Brand[]>(API_ENDPOINTS.BRANDS),

  getBikes: (slug: string, filters?: BikeFilters) =>
    api.get<{ bikes: Bike[]; meta: PaginationMeta }>(
      API_ENDPOINTS.BRAND_BIKES(slug),
      {
        params: filters as Record<
          string,
          string | number | boolean | undefined
        >,
      },
    ),
};

export const usedBikeService = {
  getAll: (filters?: UsedBikeFilters) =>
    api.get<{ usedBikes: UsedBike[]; meta: PaginationMeta }>(
      API_ENDPOINTS.USED_BIKES,
      {
        params: filters as Record<
          string,
          string | number | boolean | undefined
        >,
      },
    ),

  getById: (id: string) =>
    api.get<UsedBike>(API_ENDPOINTS.USED_BIKE_DETAIL(id)),

  create: (data: FormData) =>
    api.upload<UsedBike>(API_ENDPOINTS.USED_BIKE_CREATE, data),

  update: (id: string, data: Partial<UsedBike>) =>
    api.patch<UsedBike>(API_ENDPOINTS.USED_BIKE_UPDATE(id), data),

  delete: (id: string) => api.delete(API_ENDPOINTS.USED_BIKE_DELETE(id)),
};

export const reviewService = {
  getBikeReviews: (bikeId: string) =>
    api.get<Review[]>(API_ENDPOINTS.BIKE_REVIEWS(bikeId)),

  create: (bikeId: string, rating: number, comment: string) =>
    api.post<Review>(API_ENDPOINTS.REVIEW_CREATE, { bikeId, rating, comment }),

  delete: (id: string) => api.delete(API_ENDPOINTS.REVIEW_DELETE(id)),
};

export const wishlistService = {
  getAll: () => api.get<WishlistItem[]>(API_ENDPOINTS.WISHLIST),

  add: (bikeId: string) =>
    api.post<WishlistItem>(API_ENDPOINTS.WISHLIST_ADD, { bikeId }),

  remove: (bikeId: string) => api.delete(API_ENDPOINTS.WISHLIST_REMOVE(bikeId)),
};

export const newsService = {
  getAll: (page?: number, limit?: number) =>
    api.get<{ articles: NewsArticle[]; meta: PaginationMeta }>(
      API_ENDPOINTS.NEWS,
      { params: { page, limit } },
    ),

  getBySlug: (slug: string) =>
    api.get<NewsArticle>(API_ENDPOINTS.NEWS_DETAIL(slug)),
};

export const searchService = {
  search: (query: string, type?: "bikes" | "used" | "news") =>
    api.get<{ bikes?: Bike[]; usedBikes?: UsedBike[]; news?: NewsArticle[] }>(
      API_ENDPOINTS.SEARCH,
      { params: { q: query, type } },
    ),
};
