// ============================================
// CORE TYPE DEFINITIONS FOR MRBIKEBD
// ============================================

// -------------------- USER TYPES --------------------
export interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
    phone?: string;
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
}

export interface BikeVariant {
    id: string;
    name: string;
    price: number;
    color: string;
    specs?: Partial<BikeSpecs>;
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
    | "adventure"
    | "electric";

export interface PriceRange {
    min: number;
    max: number;
}

// -------------------- BRAND TYPES --------------------
export interface Brand {
    id: string;
    slug: string;
    name: string;
    logo: string;
    country: string;
    description?: string;
    bikeCount: number;
}

// -------------------- RATING TYPES --------------------
export interface Rating {
    average: number;
    count: number;
}

export interface Review {
    id: string;
    bikeId: string;
    userId: string;
    userName: string;
    userImage?: string;
    rating: number; // 1-5 stars
    createdAt: Date;
    updatedAt: Date;
}

// -------------------- USED BIKE TYPES --------------------
export interface UsedBike {
    id: string;
    bikeId?: string; // Reference to official bike
    bikeName: string;
    brandName: string;
    sellerId: string;
    sellerName: string;
    sellerPhone: string; // Masked
    images: string[];
    thumbnailUrl: string;
    price: number;
    year: number;
    kmDriven: number;
    condition: BikeCondition;
    accidentHistory: boolean;
    location: Location;
    description?: string;
    status: ListingStatus;
    isFeatured: boolean;
    isVerified: boolean;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export type BikeCondition = "excellent" | "good" | "fair" | "poor";

export type ListingStatus = "pending" | "active" | "expired" | "sold" | "rejected";

export interface Location {
    city: string;
    area?: string;
    latitude?: number;
    longitude?: number;
}

// -------------------- WISHLIST TYPES --------------------
export interface WishlistItem {
    id: string;
    userId: string;
    bikeId: string;
    bike: Bike;
    addedAt: Date;
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
    image?: string;
    bio?: string;
}

export type NewsCategory =
    | "launch"
    | "review"
    | "comparison"
    | "industry"
    | "tips"
    | "events";

// -------------------- SUBSCRIPTION TYPES --------------------
export interface Subscription {
    id: string;
    userId: string;
    type: SubscriptionType;
    status: SubscriptionStatus;
    startDate: Date;
    endDate: Date;
    paymentId?: string;
}

export type SubscriptionType = "free" | "premium" | "dealer";

export type SubscriptionStatus = "active" | "expired" | "cancelled";

// -------------------- API RESPONSE TYPES --------------------
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ApiError;
    meta?: PaginationMeta;
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, string[]>;
}

export interface PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

// -------------------- FILTER TYPES --------------------
export interface BikeFilters {
    brand?: string[];
    category?: BikeCategory[];
    priceMin?: number;
    priceMax?: number;
    ccMin?: number;
    ccMax?: number;
    isElectric?: boolean;
    sortBy?: BikeSortOption;
    page?: number;
    limit?: number;
}

export type BikeSortOption =
    | "popularity"
    | "price_asc"
    | "price_desc"
    | "mileage"
    | "newest";

export interface UsedBikeFilters {
    brand?: string[];
    priceMin?: number;
    priceMax?: number;
    yearMin?: number;
    yearMax?: number;
    location?: string;
    condition?: BikeCondition[];
    sortBy?: UsedBikeSortOption;
    page?: number;
    limit?: number;
}

export type UsedBikeSortOption =
    | "newest"
    | "price_asc"
    | "price_desc"
    | "km_asc"
    | "km_desc";

// -------------------- RECOMMENDATION TYPES --------------------
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

// -------------------- COMPARISON TYPES --------------------
export interface BikeComparison {
    bikes: Bike[];
    highlights: ComparisonHighlight[];
}

export interface ComparisonHighlight {
    field: string;
    label: string;
    winner?: string; // bike id
    values: Record<string, string | number>;
}

// -------------------- SEO TYPES --------------------
export interface SeoMeta {
    title: string;
    description: string;
    keywords?: string[];
    ogImage?: string;
    canonical?: string;
    noIndex?: boolean;
}

// -------------------- FORM TYPES --------------------
export interface PostAdFormData {
    brand: string;
    model: string;
    year: number;
    kmDriven: number;
    condition: BikeCondition;
    accidentHistory: boolean;
    price: number;
    location: string;
    area?: string;
    description?: string;
    images: File[];
}
