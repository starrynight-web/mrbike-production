import axios from 'axios';
import { getSession } from 'next-auth/react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

declare module 'next-auth' {
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
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor to add the JWT token
        this.client.interceptors.request.use(async (config: any) => {
            try {
                const session = await getSession();
                if (session && (session as any).accessToken) {
                    config.headers.Authorization = `Bearer ${(session as any).accessToken}`;
                }
            } catch (error) {
                console.error('Error fetching session:', error);
            }
            return config;
        });
    }

    // Auth APIs
    async loginWithGoogle(idToken: string) {
        return this.client.post('/users/auth/google/', { id_token: idToken });
    }

    async verifyPhone(phone: string, otp: string) {
        return this.client.post('/users/verify-phone/', { phone, otp });
    }

    // Bike APIs
    async getBikes(params = {}) {
        return this.client.get('/bikes/models/', { params });
    }

    async getBikeBySlug(slug: string) {
        return this.client.get(`/bikes/models/${slug}/`);
    }

    async getBrands() {
        return this.client.get('/bikes/brands/');
    }

    // Recommendation APIs
    async getSimilarBikes(slug: string) {
        return this.client.get(`/recommendations/similar/${slug}/`);
    }

    // News APIs
    async getNews(params = {}) {
        return this.client.get('/news/', { params });
    }

    async getArticleBySlug(slug: string) {
        return this.client.get(`/news/${slug}/`);
    }

    // Marketplace APIs
    async getUsedBikes(params = {}) {
        return this.client.get('/marketplace/listings/', { params });
    }

    async createUsedBike(data: FormData) {
        return this.client.post('/marketplace/listings/', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    // Interaction APIs
    async getWishlist() {
        return this.client.get('/interactions/wishlist/');
    }

    async toggleWishlist(bikeId: string | number) {
        return this.client.post(`/interactions/wishlist/toggle/${bikeId}/`);
    }

    async getBikeReviews(bikeId: string | number) {
        return this.client.get(`/interactions/bikes/${bikeId}/reviews/`);
    }

    async submitReview(bikeId: string | number, rating: number, comment: string) {
        return this.client.post(`/interactions/bikes/${bikeId}/reviews/`, { rating, comment });
    }

    // User Profile APIs
    async getUserStats() {
        return this.client.get('/users/me/stats/');
    }

    async getProfile() {
        return this.client.get('/users/profile/');
    }
}

export const api = new ApiService();
