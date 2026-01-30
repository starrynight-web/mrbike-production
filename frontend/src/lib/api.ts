import type { ApiResponse, ApiError } from "@/types";
import { API_ENDPOINTS } from "@/config/constants";

// ============================================
// API CLIENT - TYPE-SAFE HTTP CLIENT
// ============================================

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestConfig extends RequestInit {
    params?: Record<string, string | number | boolean | undefined>;
    timeout?: number;
}

class ApiClient {
    private baseUrl: string;
    private defaultTimeout: number = 30000;

    constructor(baseUrl: string = "") {
        this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || "";
    }

    /**
     * Build URL with query parameters
     */
    private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
        const url = new URL(endpoint, this.baseUrl || window.location.origin);

        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== "") {
                    url.searchParams.append(key, String(value));
                }
            });
        }

        return url.toString();
    }

    /**
     * Get auth headers from session
     */
    private getAuthHeaders(): Record<string, string> {
        // Token will be handled by NextAuth cookies automatically
        // Add any custom headers here
        return {};
    }

    /**
     * Create abort controller with timeout
     */
    private createAbortController(timeout: number): AbortController {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), timeout);
        return controller;
    }

    /**
     * Parse API error from response
     */
    private async parseError(response: Response): Promise<ApiError> {
        try {
            const data = await response.json();
            return {
                code: data.code || `HTTP_${response.status}`,
                message: data.message || response.statusText,
                details: data.details,
            };
        } catch {
            return {
                code: `HTTP_${response.status}`,
                message: response.statusText || "An error occurred",
            };
        }
    }

    /**
     * Core request method
     */
    private async request<T>(
        method: HttpMethod,
        endpoint: string,
        config: RequestConfig = {}
    ): Promise<ApiResponse<T>> {
        const { params, timeout = this.defaultTimeout, ...fetchConfig } = config;
        const url = this.buildUrl(endpoint, params);
        const controller = this.createAbortController(timeout);

        try {
            const response = await fetch(url, {
                method,
                ...fetchConfig,
                headers: {
                    "Content-Type": "application/json",
                    ...this.getAuthHeaders(),
                    ...fetchConfig.headers,
                },
                signal: controller.signal,
                credentials: "include", // Include cookies for auth
            });

            // Handle no content response
            if (response.status === 204) {
                return { success: true };
            }

            // Handle error responses
            if (!response.ok) {
                const error = await this.parseError(response);
                return { success: false, error };
            }

            // Parse successful response
            const data = await response.json();
            return {
                success: true,
                data: data.data ?? data,
                meta: data.meta,
            };
        } catch (error) {
            // Handle abort/timeout
            if (error instanceof Error && error.name === "AbortError") {
                return {
                    success: false,
                    error: {
                        code: "TIMEOUT",
                        message: "Request timed out",
                    },
                };
            }

            // Handle network errors
            return {
                success: false,
                error: {
                    code: "NETWORK_ERROR",
                    message: error instanceof Error ? error.message : "Network error",
                },
            };
        }
    }

    /**
     * GET request
     */
    async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>("GET", endpoint, config);
    }

    /**
     * POST request
     */
    async post<T>(
        endpoint: string,
        data?: unknown,
        config?: RequestConfig
    ): Promise<ApiResponse<T>> {
        return this.request<T>("POST", endpoint, {
            ...config,
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    /**
     * PUT request
     */
    async put<T>(
        endpoint: string,
        data?: unknown,
        config?: RequestConfig
    ): Promise<ApiResponse<T>> {
        return this.request<T>("PUT", endpoint, {
            ...config,
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    /**
     * PATCH request
     */
    async patch<T>(
        endpoint: string,
        data?: unknown,
        config?: RequestConfig
    ): Promise<ApiResponse<T>> {
        return this.request<T>("PATCH", endpoint, {
            ...config,
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    /**
     * DELETE request
     */
    async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
        return this.request<T>("DELETE", endpoint, config);
    }

    /**
     * Upload file with multipart form data
     */
    async upload<T>(
        endpoint: string,
        formData: FormData,
        config?: RequestConfig
    ): Promise<ApiResponse<T>> {
        const { timeout = 60000, ...fetchConfig } = config || {};
        const url = this.buildUrl(endpoint);
        const controller = this.createAbortController(timeout);

        try {
            const response = await fetch(url, {
                method: "POST",
                ...fetchConfig,
                headers: {
                    ...this.getAuthHeaders(),
                    // Don't set Content-Type - let browser set it with boundary
                },
                body: formData,
                signal: controller.signal,
                credentials: "include",
            });

            if (!response.ok) {
                const error = await this.parseError(response);
                return { success: false, error };
            }

            const data = await response.json();
            return {
                success: true,
                data: data.data ?? data,
            };
        } catch (error) {
            if (error instanceof Error && error.name === "AbortError") {
                return {
                    success: false,
                    error: { code: "TIMEOUT", message: "Upload timed out" },
                };
            }
            return {
                success: false,
                error: {
                    code: "NETWORK_ERROR",
                    message: error instanceof Error ? error.message : "Upload failed",
                },
            };
        }
    }
}

// Export singleton instance
export const api = new ApiClient();

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

    getBySlug: (slug: string) =>
        api.get<Bike>(API_ENDPOINTS.BIKE_DETAIL(slug)),

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
            { params: filters as Record<string, string | number | boolean | undefined> }
        ),
};

export const usedBikeService = {
    getAll: (filters?: UsedBikeFilters) =>
        api.get<{ usedBikes: UsedBike[]; meta: PaginationMeta }>(
            API_ENDPOINTS.USED_BIKES,
            { params: filters as Record<string, string | number | boolean | undefined> }
        ),

    getById: (id: string) =>
        api.get<UsedBike>(API_ENDPOINTS.USED_BIKE_DETAIL(id)),

    create: (data: FormData) =>
        api.upload<UsedBike>(API_ENDPOINTS.USED_BIKE_CREATE, data),

    update: (id: string, data: Partial<UsedBike>) =>
        api.patch<UsedBike>(API_ENDPOINTS.USED_BIKE_UPDATE(id), data),

    delete: (id: string) =>
        api.delete(API_ENDPOINTS.USED_BIKE_DELETE(id)),
};

export const reviewService = {
    getBikeReviews: (bikeId: string) =>
        api.get<Review[]>(API_ENDPOINTS.BIKE_REVIEWS(bikeId)),

    create: (bikeId: string, rating: number) =>
        api.post<Review>(API_ENDPOINTS.REVIEW_CREATE, { bikeId, rating }),

    delete: (id: string) =>
        api.delete(API_ENDPOINTS.REVIEW_DELETE(id)),
};

export const wishlistService = {
    getAll: () => api.get<WishlistItem[]>(API_ENDPOINTS.WISHLIST),

    add: (bikeId: string) =>
        api.post<WishlistItem>(API_ENDPOINTS.WISHLIST_ADD, { bikeId }),

    remove: (bikeId: string) =>
        api.delete(API_ENDPOINTS.WISHLIST_REMOVE(bikeId)),
};

export const newsService = {
    getAll: (page?: number, limit?: number) =>
        api.get<{ articles: NewsArticle[]; meta: PaginationMeta }>(
            API_ENDPOINTS.NEWS,
            { params: { page, limit } }
        ),

    getBySlug: (slug: string) =>
        api.get<NewsArticle>(API_ENDPOINTS.NEWS_DETAIL(slug)),
};

export const searchService = {
    search: (query: string, type?: "bikes" | "used" | "news") =>
        api.get<{ bikes?: Bike[]; usedBikes?: UsedBike[]; news?: NewsArticle[] }>(
            API_ENDPOINTS.SEARCH,
            { params: { q: query, type } }
        ),
};
