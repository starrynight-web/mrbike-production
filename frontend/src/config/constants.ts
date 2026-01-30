// ============================================
// APPLICATION CONSTANTS
// ============================================

export const APP_CONFIG = {
    name: "MrBikeBD",
    tagline: "Bangladesh's #1 Motorcycle Ecosystem",
    description:
        "Discover, compare, and buy motorcycles. Bangladesh's most trusted bike information platform with used bike marketplace.",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://mrbikebd.com",
    email: "contact@mrbikebd.com",
    phone: "+880-1XXX-XXXXXX",
    socialLinks: {
        facebook: "https://facebook.com/mrbikebd",
        instagram: "https://instagram.com/mrbikebd",
        youtube: "https://youtube.com/mrbikebd",
        twitter: "https://twitter.com/mrbikebd",
    },
} as const;

// -------------------- API ENDPOINTS --------------------
export const API_ENDPOINTS = {
    // Auth
    AUTH_GOOGLE: "/api/auth/google",
    AUTH_OTP_SEND: "/api/auth/otp/send",
    AUTH_OTP_VERIFY: "/api/auth/otp/verify",
    AUTH_SESSION: "/api/auth/session",
    AUTH_LOGOUT: "/api/auth/logout",

    // Bikes
    BIKES: "/api/bikes",
    BIKE_DETAIL: (slug: string) => `/api/bikes/${slug}`,
    BIKE_SIMILAR: (slug: string) => `/api/bikes/${slug}/similar`,
    BIKE_USED: (slug: string) => `/api/bikes/${slug}/used`,
    BRANDS: "/api/brands",
    BRAND_BIKES: (slug: string) => `/api/brands/${slug}/bikes`,

    // Used Bikes
    USED_BIKES: "/api/used-bikes",
    USED_BIKE_DETAIL: (id: string) => `/api/used-bikes/${id}`,
    USED_BIKE_CREATE: "/api/used-bikes",
    USED_BIKE_UPDATE: (id: string) => `/api/used-bikes/${id}`,
    USED_BIKE_DELETE: (id: string) => `/api/used-bikes/${id}`,

    // Reviews
    REVIEWS: "/api/reviews",
    BIKE_REVIEWS: (bikeId: string) => `/api/bikes/${bikeId}/reviews`,
    REVIEW_CREATE: "/api/reviews",
    REVIEW_DELETE: (id: string) => `/api/reviews/${id}`,

    // Wishlist
    WISHLIST: "/api/wishlist",
    WISHLIST_ADD: "/api/wishlist",
    WISHLIST_REMOVE: (bikeId: string) => `/api/wishlist/${bikeId}`,

    // News
    NEWS: "/api/news",
    NEWS_DETAIL: (slug: string) => `/api/news/${slug}`,

    // User
    USER_PROFILE: "/api/user/profile",
    USER_LISTINGS: "/api/user/listings",
    USER_REVIEWS: "/api/user/reviews",

    // Compare
    COMPARE: "/api/compare",

    // Recommendations
    RECOMMENDATIONS: "/api/recommendations",

    // Upload
    UPLOAD_IMAGE: "/api/upload",

    // Search
    SEARCH: "/api/search",
} as const;

// -------------------- BIKE CATEGORIES --------------------
export const BIKE_CATEGORIES = [
    { value: "sport", label: "Sports", icon: "🏍️" },
    { value: "naked", label: "Naked", icon: "💪" },
    { value: "commuter", label: "Commuter", icon: "🛵" },
    { value: "scooter", label: "Scooter", icon: "🛴" },
    { value: "cruiser", label: "Cruiser", icon: "🏍️" },
    { value: "adventure", label: "Adventure", icon: "🏔️" },
    { value: "electric", label: "Electric", icon: "⚡" },
] as const;

// -------------------- BIKE CONDITIONS --------------------
export const BIKE_CONDITIONS = [
    { value: "excellent", label: "Excellent", description: "Like new, minimal wear" },
    { value: "good", label: "Good", description: "Well maintained, minor issues" },
    { value: "fair", label: "Fair", description: "Some wear, functional" },
    { value: "poor", label: "Poor", description: "Needs repairs" },
] as const;

// -------------------- PRICE RANGES (BDT) --------------------
export const PRICE_RANGES = [
    { min: 0, max: 100000, label: "Under ৳1 Lac" },
    { min: 100000, max: 200000, label: "৳1-2 Lac" },
    { min: 200000, max: 300000, label: "৳2-3 Lac" },
    { min: 300000, max: 500000, label: "৳3-5 Lac" },
    { min: 500000, max: 1000000, label: "৳5-10 Lac" },
    { min: 1000000, max: Infinity, label: "Above ৳10 Lac" },
] as const;

// -------------------- ENGINE CC RANGES --------------------
export const CC_RANGES = [
    { min: 0, max: 110, label: "Up to 110cc" },
    { min: 110, max: 125, label: "110-125cc" },
    { min: 125, max: 150, label: "125-150cc" },
    { min: 150, max: 200, label: "150-200cc" },
    { min: 200, max: 400, label: "200-400cc" },
    { min: 400, max: Infinity, label: "Above 400cc" },
] as const;

// -------------------- SORT OPTIONS --------------------
export const BIKE_SORT_OPTIONS = [
    { value: "popularity", label: "Most Popular" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "mileage", label: "Best Mileage" },
    { value: "newest", label: "Newest First" },
] as const;

export const USED_BIKE_SORT_OPTIONS = [
    { value: "newest", label: "Newest First" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "km_asc", label: "Lowest KM" },
    { value: "km_desc", label: "Highest KM" },
] as const;

// -------------------- BANGLADESH CITIES --------------------
export const BD_CITIES = [
    "Dhaka",
    "Chittagong",
    "Sylhet",
    "Rajshahi",
    "Khulna",
    "Barishal",
    "Rangpur",
    "Mymensingh",
    "Comilla",
    "Gazipur",
    "Narayanganj",
    "Cox's Bazar",
] as const;

// -------------------- LISTING SETTINGS --------------------
export const LISTING_CONFIG = {
    maxImages: 5,
    maxImageSizeMB: 5,
    listingDurationDays: 15,
    expirationReminderDays: 3,
    imageCompression: {
        quality: 0.8,
        maxWidth: 1920,
        maxHeight: 1080,
    },
} as const;

// -------------------- EMI CALCULATOR DEFAULTS --------------------
export const EMI_CONFIG = {
    defaultInterestRate: 12, // Annual %
    minTenureMonths: 6,
    maxTenureMonths: 60,
    defaultTenureMonths: 36,
    downPaymentPercent: 20,
} as const;

// -------------------- PAGINATION --------------------
export const PAGINATION = {
    defaultLimit: 12,
    maxLimit: 50,
    bikesPerPage: 12,
    newsPerPage: 10,
    reviewsPerPage: 10,
} as const;

// -------------------- SEO DEFAULTS --------------------
export const SEO_DEFAULTS = {
    titleSuffix: " | MrBikeBD",
    defaultOgImage: "/og-image.jpg",
    twitterHandle: "@mrbikebd",
    locale: "en_BD",
} as const;

// -------------------- CACHE TTL (seconds) --------------------
export const CACHE_TTL = {
    bikes: 3600, // 1 hour
    brands: 86400, // 24 hours
    news: 1800, // 30 minutes
    usedBikes: 300, // 5 minutes
    recommendations: 3600, // 1 hour
    user: 300, // 5 minutes
} as const;

// -------------------- RATE LIMITS --------------------
export const RATE_LIMITS = {
    api: {
        windowMs: 60000, // 1 minute
        maxRequests: 100,
    },
    auth: {
        windowMs: 300000, // 5 minutes
        maxRequests: 10,
    },
    upload: {
        windowMs: 60000, // 1 minute
        maxRequests: 10,
    },
} as const;

// -------------------- VALIDATION --------------------
export const VALIDATION = {
    phone: {
        minLength: 11,
        maxLength: 14,
    },
    price: {
        min: 10000,
        max: 50000000,
    },
    year: {
        min: 2000,
        max: new Date().getFullYear(),
    },
    km: {
        min: 0,
        max: 500000,
    },
    description: {
        min: 20,
        max: 2000,
    },
} as const;
