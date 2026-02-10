// ============================================
// CORE TYPE DEFINITIONS FOR MRBIKEBD
// ============================================

export interface Review {
  id: string;
  bikeId: string;
  userId: string;
  userName: string;
  userImage?: string;
  rating: number;
  comment: string;
  createdAt: string | Date;
  likes: number;
  isVerifiedOwner: boolean;
  bike_name?: string;
  bike_slug?: string;
}

// -------------------- COMMON TYPES --------------------
export type QueryParams = Record<
  string,
  string | number | boolean | undefined | string[] | number[]
>;

// -------------------- USER TYPES --------------------
export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  phone?: string;
  location?: string;
  phoneVerified: boolean;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = "user" | "seller" | "dealer" | "moderator" | "admin";

// -------------------- BIKE TYPES --------------------
export interface Bike {
  id: string;
  slug: string;
  name: string;
  brand: Brand;
  category: BikeCategory;
  variants: BikeVariant[];
  images: string[];
  thumbnailUrl: string;
  description: string;
  specs: BikeSpecs;
  priceRange: PriceRange;
  rating: Rating;
  popularityScore: number;
  resaleScore: number;
  demandScore: number;
  isElectric: boolean;
  launchDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Optional fields for backward compatibility or API variations
  primary_image?: string;
  brand_name?: string;
  price?: number;
  mileage?: number;
  specsSummary?: string;
  detailed_specs?: any;
  engine_capacity?: number | string;
  gears?: number | string;
  max_power?: string;
  max_torque?: string;
  fuel_capacity?: number | string;
  curb_weight?: number | string;
  tyre_type?: string;
}

export interface BikeVariant {
  id: string;
  name: string;
  price: number;
  color: string;
  specs?: Partial<BikeSpecs>;
  // API compatibility fields
  variant_key?: string;
  variant_name?: string;
  [key: string]: unknown;
}

export interface BikeSpecs {
  // Engine
  engineType: string;
  displacement: number; // CC
  maxPower: string;
  maxTorque: string;
  cooling: string;
  fuelSystem: string;
  ignition: string;
  starting: string;
  transmission: string;
  clutch: string;

  // Performance
  topSpeed: number; // kmph
  mileage: number; // kmpl
  fuelCapacity: number; // liters
  acceleration?: string; // 0-60 time

  // Dimensions
  length: number;
  width: number;
  height: number;
  wheelbase: number;
  groundClearance: number;
  seatHeight: number;
  kerbWeight: number;

  // Brakes & Suspension
  frontBrake: string;
  rearBrake: string;
  frontSuspension: string;
  rearSuspension: string;
  abs: "Single Channel" | "Dual Channel" | "None";

  // Wheels & Tyres
  frontTyre: string;
  rearTyre: string;
  wheelType: string;

  // Electrical
  headlight: string;
  taillight: string;
  battery: string;
}

export type BikeCategory =
  | "sport"
  | "naked"
  | "commuter"
  | "scooter"
  | "cruiser"
  | "cafe-racer"
  | "off-road"
  | "electric";

export interface Brand {
  id: string;
  slug: string;
  name: string;
  logo: string;
  country: string;
  bikeCount: number;
  description?: string;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface Rating {
  average: number;
  count: number;
  breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

// -------------------- NEWS TYPES --------------------
export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: Author;
  category: NewsCategory;
  tags: string[];
  views: number;
  publishedAt: Date;
  updatedAt: Date;
}

export interface Author {
  id: string;
  name: string;
  image: string;
  bio: string;
}

export type NewsCategory =
  | "launch"
  | "review"
  | "industry"
  | "tips"
  | "motorsport";

// -------------------- MARKETPLACE TYPES --------------------
export interface UsedBike {
  id: string;
  bikeName: string;
  brandName: string;
  sellerId: string;
  sellerName: string;
  sellerPhone: string;
  images: string[];
  thumbnailUrl: string;
  price: number;
  year: number;
  kmDriven: number;
  condition: BikeCondition;
  accidentHistory: boolean;
  location: Location;
  status: ListingStatus;
  description?: string;
  isFeatured: boolean;
  isVerified: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiUsedBikeListing {
  id: number;
  title: string;
  price: string;
  mileage: number;
  manufacturing_year: number;
  condition: string;
  description: string;
  location: string;
  status: string;
  is_featured: boolean;
  is_verified: boolean;
  created_at: string;
  image_url?: string;
  bike_model_name?: string;
  brand?: string;
  seller_name?: string;
  images?: {
    id: number;
    url: string;
    is_primary: boolean;
  }[];
}

export type BikeCondition = "new" | "excellent" | "good" | "fair" | "poor";
export type ListingStatus = "active" | "sold" | "expired" | "pending";

export interface Location {
  city: string;
  area: string;
  lat?: number;
  lng?: number;
}

// -------------------- API TYPES --------------------
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
  message?: string;
  status?: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  currentPage: number;
}

export interface BikeFilters {
  [key: string]: string | number | boolean | undefined;
  brand?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minCC?: number;
  maxCC?: number;
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
}

export interface UsedBikeFilters {
  [key: string]: string | number | boolean | undefined | string[];
  brand?: string[];
  condition?: string[];
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  featured?: boolean;
}

export interface WishlistItem {
  id: string;
  bikeId: string;
  userId: string;
  addedAt: Date;
  bike: Bike;
}

export interface BikeRecommendation {
  bike: Bike;
  score: number;
  reason: string;
}

export interface UsedBikeRecommendation {
  usedBike: UsedBike;
  score: number;
  reason: string;
}
