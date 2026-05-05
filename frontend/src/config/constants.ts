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

// -------------------- ALLOWED BRANDS --------------------
export const ALLOWED_BRANDS = [
  { name: "Yamaha", slug: "yamaha", logo: "/Logos/yamaha.png" },
  { name: "Suzuki", slug: "suzuki", logo: "/Logos/suzuki.png" },
  { name: "CFMoto", slug: "cfmoto", logo: "/Logos/cfmoto.png" },
  {
    name: "Royal Enfield",
    slug: "royal-enfield",
    logo: "/Logos/royal_enfield.png",
  },
  { name: "Bajaj", slug: "bajaj", logo: "/Logos/bajaj.png" },
  { name: "Hero", slug: "hero", logo: "/Logos/hero.png" },
  { name: "TVS", slug: "tvs", logo: "/Logos/tvs.png" },
  { name: "Honda", slug: "honda", logo: "/Logos/Honda.png" },
  { name: "KTM", slug: "ktm", logo: "/Logos/KTM.png" },
  { name: "Aprilia", slug: "aprilia", logo: "/Logos/aprilia.png" },
  { name: "Vespa", slug: "vespa", logo: "/Logos/vespa.png" },
  { name: "Lifan", slug: "lifan", logo: "/Logos/lifan.png" },
  { name: "Runner", slug: "runner", logo: "/Logos/runner.png" },
  { name: "Akij", slug: "akij", logo: "/Logos/akij.png" },
  { name: "QJ Motor", slug: "qj-motor", logo: "/Logos/qj_motor.png" },
  { name: "GPX", slug: "gpx", logo: "/Logos/gpx.png" },
  { name: "Hyosung", slug: "hyosung", logo: "/Logos/hyosung.png" },
  { name: "Taro", slug: "taro", logo: "/Logos/taro.png" },
  { name: "Yadea", slug: "yadea", logo: "/Logos/yadea.png" },
  { name: "Revoo", slug: "revoo", logo: "/Logos/revoo.png" },
  { name: "Zonsen", slug: "zonsen", logo: "/Logos/zonsen.png" },
  { name: "Jedi Motor", slug: "jedi-motor", logo: "/Logos/jedi_motor.png" },
] as const;

// -------------------- API ENDPOINTS --------------------
export const API_ENDPOINTS = {
  // Auth
  AUTH_GOOGLE: "/users/auth/google/",
  AUTH_LOGIN: "/users/auth/login/",
  AUTH_OTP_SEND: "/users/auth/otp/send/",
  AUTH_OTP_VERIFY: "/users/auth/verify-2fa/",
  AUTH_SESSION: "/users/auth/me/",
  AUTH_LOGOUT: "/users/auth/logout/",
  AUTH_REGISTER: "/users/auth/register/",
  AUTH_PASSWORD_RESET: "/users/auth/password-reset/",
  AUTH_PASSWORD_RESET_CONFIRM: "/users/auth/password-reset-confirm/",
  AUTH_REFRESH: "/users/auth/refresh/",
  AUTH_RESEND_VERIFICATION: "/users/auth/resend-verification/",

  // Bikes
  BIKES: "/bikes/",
  BIKE_DETAIL: (slug: string) => `/bikes/${slug}/`,
  BIKE_SIMILAR: (slug: string) => `/recommendations/similar/${slug}/`,
  BIKE_EMOTIONAL_RECOMMENDATIONS: (slug: string) =>
    `/bikes/${slug}/emotional_recommendations/`,
  BIKE_USED: (slug: string) => `/recommendations/budget/`, // Adjusted to match backend views.py
  BRANDS: "/bikes/brands/",
  BRAND_DETAIL: (id: string | number) => `/bikes/brands/${id}/`,
  BRAND_BIKES: (slug: string) => `/bikes/brands/${slug}/bikes/`,

  // Used Bikes (Marketplace)
  USED_BIKES: "/marketplace/listings/",
  USED_BIKE_DETAIL: (id: string) => `/marketplace/listings/${id}/`,
  USED_BIKE_CREATE: "/marketplace/listings/",
  USED_BIKE_UPDATE: (id: string) => `/marketplace/listings/${id}/`,
  USED_BIKE_DELETE: (id: string) => `/marketplace/listings/${id}/`,

  // Shops
  SHOPS: "/marketplace/shops/",
  SHOP_DETAIL: (slug: string) => `/marketplace/shops/${slug}/`,
  SHOP_ME: "/marketplace/shops/me/",

  // Interactions (Reviews, Wishlist, Inquiries)
  REVIEWS: "/interactions/me/reviews/",
  BIKE_REVIEWS: (bikeId: string | number) =>
    `/interactions/bikes/${bikeId}/reviews/`,
  REVIEW_CREATE: (bikeId: string | number) =>
    `/interactions/bikes/${bikeId}/reviews/`,
  REVIEW_DELETE: (id: string) => `/interactions/reviews/${id}/`,

  WISHLIST: "/interactions/wishlist/",
  WISHLIST_TOGGLE: (bikeId: string | number) =>
    `/interactions/wishlist/toggle/${bikeId}/`,

  INQUIRIES: "/interactions/inquiries/",

  // News
  NEWS: "/news/",
  NEWS_DETAIL: (slug: string) => `/news/${slug}/`,

  // User Profile
  USER_PROFILE: "/users/profile/",
  USER_STATS: "/users/me/stats/",
  USER_NOTIFICATIONS: "/users/notifications/",
  USER_LISTINGS: "/marketplace/listings/my_listings/",
  USER_REVIEWS: "/interactions/me/reviews/",

  // Admin Tools
  ADMIN_STATS: "/users/admin/stats/",
  ADMIN_FILTERS: "/admin/filter-options/",
  ADMIN_ANALYTICS: "/admin/analytics/",
  SITE_CONFIG: "/admin/site-config/",

  // Upload
  UPLOAD_IMAGE: "/bikes/upload-image/",

  // Search
  SEARCH: "/search/",
} as const;

// -------------------- BIKE CATEGORIES --------------------
export const BIKE_CATEGORIES = [
  { value: "sports", label: "Sports", icon: "🏍️", image: "/images/sports.png" },
  { value: "naked", label: "Naked", icon: "💪", image: "/images/naked.png" },
  {
    value: "commuter",
    label: "Commuter",
    icon: "🛵",
    image: "/images/commuter.png",
  },
  {
    value: "scooter",
    label: "Scooter",
    icon: "🛴",
    image: "/images/scooty.png",
  },
  {
    value: "cruiser",
    label: "Cruiser",
    icon: "🏍️",
    image: "/images/cruiser.png",
  },
  {
    value: "adventure",
    label: "Adventure",
    icon: "🏔️",
    image: "/images/adventure.png",
  },
  {
    value: "cafe_racer",
    label: "Café Racer",
    icon: "☕",
    image: "/images/cafe_racer.png",
  },
  {
    value: "offroad",
    label: "Off-Road",
    icon: "🏞️",
    image: "/images/off_road.png",
  },
  {
    value: "electric",
    label: "Electric",
    icon: "⚡",
    image: "/images/electric.png",
  },
] as const;

// -------------------- BIKE CONDITIONS --------------------
export const BIKE_CONDITIONS = [
  {
    value: "excellent",
    label: "Excellent",
    description: "Like new, minimal wear",
  },
  {
    value: "good",
    label: "Good",
    description: "Well maintained, minor issues",
  },
  { value: "fair", label: "Fair", description: "Some wear, functional" },
  { value: "need_work", label: "Needs Work", description: "Needs repairs" },
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
