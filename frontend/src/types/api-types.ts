/**
 * 4.1 — Typed API Definitions
 * 
 * Strongly-typed API method signatures that map 1:1 with the DRF backend.
 * This file defines the contract — api-service.ts implements it.
 * Generated from DRF serializer analysis, updated manually for now.
 */

import type {
  Bike,
  Brand,
  NewsArticle,
  UsedBike,
  User,
  QueryParams,
  ApiResponse,
  PaginationMeta,
} from "@/types";

// ─────────────────────────────────────────────
// API Paginated Response
// ─────────────────────────────────────────────
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ─────────────────────────────────────────────
// Auth API Types
// ─────────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: BackendUser;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  username?: string;
}

export interface GoogleAuthRequest {
  id_token: string;
}

export interface BackendUser {
  id: number;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  role: string;
  profile_image?: string;
  is_email_verified: boolean;
  phone?: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
  bio?: string;
}

// ─────────────────────────────────────────────
// Bike API Types
// ─────────────────────────────────────────────
export interface ApiBike {
  id: number;
  slug: string;
  name: string;
  brand: ApiBrand;
  brand_name?: string;
  category: string;
  primary_image?: string;
  thumbnailUrl?: string;
  description?: string;
  price?: number;
  mileage?: number;
  engine_capacity?: number;
  year?: number;
  is_available?: boolean;
  popularity_score?: number;
  rating?: {
    average: number;
    count: number;
  };
  variants?: ApiBikeVariant[];
  detailed_specs?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
  meta_title?: string;
  meta_description?: string;
}

export interface ApiBikeVariant {
  id: number;
  name: string;
  price: number;
  color?: string;
  variant_key?: string;
  variant_name?: string;
}

export interface ApiBrand {
  id: number;
  slug: string;
  name: string;
  logo?: string;
  description?: string;
  is_popular?: boolean;
  country?: string;
  bike_count?: number;
  model_count?: number;
}

export interface BikesListParams extends QueryParams {
  brand?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  min_cc?: number;
  max_cc?: number;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface BrandDetailResponse extends ApiBrand {
  bikes?: PaginatedResponse<ApiBike>;
}

// ─────────────────────────────────────────────
// Marketplace API Types
// ─────────────────────────────────────────────
export interface CreateListingRequest {
  bike_model?: number;
  custom_brand?: string;
  custom_model?: string;
  title: string;
  price: number;
  mileage: number;
  manufacturing_year: number;
  registration_year?: number;
  condition: "excellent" | "good" | "fair" | "poor";
  description?: string;
  location?: string;
  location_city?: string;
  location_area?: string;
  location_division?: string;
  contact_number: string;
  whatsapp_number?: string;
  has_accident_history?: boolean;
  engine_condition?: string;
  body_condition?: string;
  engine_cc?: number;
  ownership_count?: number;
  has_original_papers?: boolean;
  registration_type?: string;
  category?: string;
  is_featured?: boolean;
  is_urgent?: boolean;
}

export interface UsedBikeListParams extends QueryParams {
  status?: string;
  location_city?: string;
  condition?: string;
  min_price?: number;
  max_price?: number;
  brand?: string;
  ordering?: string;
  search?: string;
  page?: number;
  featured?: boolean;
}

// Canonical API shape returned by the DRF UsedBikeListingSerializer
export interface ApiUsedBikeListing {
  id: number;
  title: string;
  slug: string;
  price: string;
  mileage: number;
  manufacturing_year: number;
  condition: string;
  description?: string;
  location: {
    city: string;
    area: string;
    full: string;
  };
  location_city?: string;
  location_area?: string;
  location_division?: string;
  status: string;
  is_featured: boolean;
  is_verified: boolean;
  is_urgent?: boolean;
  views_count?: number;
  contact_number?: string;
  whatsapp_number?: string;
  has_accident_history?: boolean;
  engine_condition?: string;
  body_condition?: string;
  engine_cc?: number;
  ownership_count?: number;
  has_original_papers?: boolean;
  registration_year?: number;
  registration_type?: string;
  category?: string;
  bike_model?: number;
  bike_model_name?: string;
  custom_brand?: string;
  custom_model?: string;
  brand_name?: string;
  year?: number;
  seller?: number;
  seller_name?: string;
  seller_phone?: string;
  image_url?: string;
  images?: Array<{ id: number; url: string; is_primary: boolean }>;
  shop?: { id: number; name: string; slug: string; logo?: string; is_verified: boolean; location_city?: string };
  created_at: string;
  updated_at: string;
  reports_count?: number;
  active_boost?: boolean;
  has_pending_boost?: boolean;
}

// ─────────────────────────────────────────────
// News API Types
// ─────────────────────────────────────────────
export interface ApiArticle {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featured_image?: string;
  author?: BackendUser;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  tags: Array<{ id: number; name: string }>;
  views: number;
  is_published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  meta_title?: string;
  meta_description?: string;
}

export interface NewsListParams extends QueryParams {
  category?: string;
  search?: string;
  ordering?: string;
  page?: number;
  is_published?: boolean;
}

// ─────────────────────────────────────────────
// Interaction API Types
// ─────────────────────────────────────────────
export interface ApiReview {
  id: number;
  bike: number;
  bike_name?: string;
  bike_slug?: string;
  user: BackendUser;
  rating: number;
  comment: string;
  likes: number;
  created_at: string;
}

export interface CreateReviewRequest {
  rating: number;
  comment: string;
}

export interface ApiInquiry {
  id: number;
  listing: number;
  sender: BackendUser;
  message: string;
  contact_number?: string;
  created_at: string;
}

// ─────────────────────────────────────────────
// User Profile API Types
// ─────────────────────────────────────────────
export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  location?: string;
  bio?: string;
  profile_image?: File | string;
}

export interface UserStatsResponse {
  listings_count: number;
  wishlists_count: number;
  reviews_count: number;
  views_total: number;
}

// ─────────────────────────────────────────────
// Admin API Types
// ─────────────────────────────────────────────
export interface AdminStatsResponse {
  total_users: number;
  total_bikes: number;
  total_listings: number;
  pending_listings: number;
  total_articles: number;
  recent_signups: number;
}

export interface ApproveRejectRequest {
  status: "active" | "rejected";
  rejection_reason?: string;
}
