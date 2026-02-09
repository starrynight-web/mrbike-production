import axios, { InternalAxiosRequestConfig } from "axios";
import { getSession } from "next-auth/react";
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
      timeout: 10000,
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

  // Auth APIs
  async loginWithGoogle(idToken: string) {
    return this.client.post("/users/auth/google/", { id_token: idToken });
  }

  async sendOtp(phone: string) {
    return this.client.post("/users/auth/otp/send/", { phone });
  }

  async verifyPhone(phone: string, otp: string) {
    return this.client.post("/users/auth/verify-phone/", { phone, otp });
  }

  // Bike APIs
  async getBikes(params: QueryParams = {}) {
    return this.client.get("/bikes/", { params });
  }

  async getBikeBySlug(slug: string) {
    return this.client.get(`/bikes/${slug}/`);
  }

  async getBrands() {
    return this.client.get("/bikes/brands/");
  }

  // Recommendation APIs
  async getSimilarBikes(slug: string) {
    return this.client.get(`/recommendations/similar/${slug}/`);
  }

  // News APIs
  async getNews(params: QueryParams = {}) {
    return this.client.get("/news/", { params });
  }

  async getArticleBySlug(slug: string) {
    return this.client.get(`/news/${slug}/`);
  }

  // Marketplace APIs
  async getUsedBikes(params: QueryParams = {}) {
    return this.client.get("/marketplace/listings/", { params });
  }

  async getUsedBike(id: string) {
    return this.client.get(`/marketplace/listings/${id}/`);
  }

  async createUsedBike(data: FormData) {
    return this.client.post("/marketplace/listings/", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  async getMyListings() {
    return this.client.get("/marketplace/listings/my_listings/");
  }

  // Interaction APIs
  async getWishlist() {
    return this.client.get("/interactions/wishlist/");
  }

  async toggleWishlist(bikeId: string | number) {
    return this.client.post(`/interactions/wishlist/toggle/${bikeId}/`);
  }

  async getBikeReviews(bikeId: string | number) {
    return this.client.get(`/interactions/bikes/${bikeId}/reviews/`);
  }

  async submitReview(bikeId: string | number, rating: number, comment: string) {
    return this.client.post(`/interactions/bikes/${bikeId}/reviews/`, {
      rating,
      comment,
    });
  }

  async getUserReviews() {
    return this.client.get("/interactions/me/reviews/");
  }

  async sendInquiry(data: Record<string, unknown>) {
    return this.client.post("/interactions/inquiries/", data);
  }

  // User Profile APIs
  async getUserStats() {
    return this.client.get("/users/me/stats/");
  }

  async getProfile() {
    return this.client.get("/users/profile/");
  }

  async getNotifications() {
    return this.client.get("/users/notifications/");
  }
}

export const api = new ApiService();
