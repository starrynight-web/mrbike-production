import axios, { InternalAxiosRequestConfig } from "axios";
import { getSession } from "next-auth/react";
import {
  getMockBikes,
  getMockBrands,
  getMockNews,
  getMockNewsArticle,
  getMockUsedBikes,
  getMockBikeBySlug,
  getMockSimilarBikes,
  getMockReviews,
  getMockWishlist,
  getMockUserStats,
  getMockProfile,
} from "./mock-adapter";
import { QueryParams } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
  }
}

class ApiService {
  public client;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE,
      timeout: 5000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor to add the JWT token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        try {
          const session = await getSession();
          if (session && session.accessToken) {
            config.headers.Authorization = `Bearer ${session.accessToken}`;
          }
        } catch (error) {
          console.error("Error fetching session:", error);
        }
        return config;
      },
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleError(method: string, error: any) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isNetworkError = (err: any) =>
      err.code === "ECONNREFUSED" ||
      err.code === "ETIMEDOUT" ||
      err.message?.includes("Network Error");

    if (isNetworkError(error)) {
      console.warn(`[${method}] Backend unreachable, using mock data.`);
    } else {
      console.warn(`[${method}] API failed, using mock data.`, error);
    }
  }

  // Auth APIs
  async loginWithGoogle(idToken: string) {
    return this.client.post("/users/auth/google/", { id_token: idToken });
  }

  async verifyPhone(phone: string, otp: string) {
    return this.client.post("/users/verify-phone/", { phone, otp });
  }

  // Bike APIs
  async getBikes(params: QueryParams = {}) {
    try {
      return await this.client.get("/bikes/models/", { params });
    } catch (error) {
      this.handleError("getBikes", error);
      return getMockBikes(params);
    }
  }

  async getBikeBySlug(slug: string) {
    try {
      return await this.client.get(`/bikes/models/${slug}/`);
    } catch (error) {
      this.handleError("getBikeBySlug", error);
      return getMockBikeBySlug(slug);
    }
  }

  async getBrands() {
    try {
      return await this.client.get("/bikes/brands/");
    } catch (error) {
      this.handleError("getBrands", error);
      return getMockBrands();
    }
  }

  // Recommendation APIs
  async getSimilarBikes(slug: string) {
    try {
      return await this.client.get(`/recommendations/similar/${slug}/`);
    } catch (error) {
      this.handleError("getSimilarBikes", error);
      return getMockSimilarBikes(slug);
    }
  }

  // News APIs
  async getNews(params: QueryParams = {}) {
    try {
      return await this.client.get("/news/", { params });
    } catch (error) {
      this.handleError("getNews", error);
      return getMockNews(params);
    }
  }

  async getArticleBySlug(slug: string) {
    try {
      return await this.client.get(`/news/${slug}/`);
    } catch (error) {
      this.handleError("getArticleBySlug", error);
      return getMockNewsArticle(slug);
    }
  }

  // Marketplace APIs
  async getUsedBikes(params: QueryParams = {}) {
    try {
      return await this.client.get("/marketplace/listings/", { params });
    } catch (error) {
      this.handleError("getUsedBikes", error);
      return getMockUsedBikes(params);
    }
  }

  async createUsedBike(data: FormData) {
    return this.client.post("/marketplace/listings/", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  // Interaction APIs
  async getWishlist() {
    try {
      return await this.client.get("/interactions/wishlist/");
    } catch (error) {
      this.handleError("getWishlist", error);
      return getMockWishlist();
    }
  }

  async toggleWishlist(bikeId: string | number) {
    try {
      return await this.client.post(`/interactions/wishlist/toggle/${bikeId}/`);
    } catch (error) {
      this.handleError("toggleWishlist", error);
      return { data: { success: true, message: "Mock: Wishlist toggled" } };
    }
  }

  async getBikeReviews(bikeId: string | number) {
    try {
      return await this.client.get(`/interactions/bikes/${bikeId}/reviews/`);
    } catch (error) {
      this.handleError("getBikeReviews", error);
      return getMockReviews(bikeId);
    }
  }

  async submitReview(bikeId: string | number, rating: number, comment: string) {
    try {
      return await this.client.post(`/interactions/bikes/${bikeId}/reviews/`, {
        rating,
        comment,
      });
    } catch (error) {
      this.handleError("submitReview", error);
      return {
        data: {
          id: Math.floor(Math.random() * 1000),
          bikeId,
          rating,
          comment,
          createdAt: new Date().toISOString(),
          user: { name: "You" },
        },
      };
    }
  }

  // User Profile APIs
  async getUserStats() {
    try {
      return await this.client.get("/users/me/stats/");
    } catch (error) {
      this.handleError("getUserStats", error);
      return getMockUserStats();
    }
  }

  async getProfile() {
    try {
      return await this.client.get("/users/profile/");
    } catch (error) {
      this.handleError("getProfile", error);
      return getMockProfile();
    }
  }
}

export const api = new ApiService();
