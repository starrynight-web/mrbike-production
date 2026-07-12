import type { Bike, UsedBike, ApiUsedBikeListing, Review, Brand, NewsArticle, UsedBikeFilters } from "@/types";
import type { ApiBrand, UsedBikeListParams, UserStatsResponse } from "@/types/api-types";
import type { ApiArticle } from "@/types/api-types";
import { User } from "@/types";

/**
 * Maps a raw API UserStatsResponse to frontend UserStats format
 */
export function mapUserStats(statsResponse: UserStatsResponse | any): any {
    return {
        listings_count: statsResponse.listings_count || 0,
        wishlist_count: statsResponse.wishlists_count || 0,
        reviews_count: statsResponse.reviews_count || 0,
        member_since: statsResponse.member_since || new Date().toISOString(),
    };
}

/**
 * Maps a raw API brand to the frontend Brand model
 * Converts snake_case API fields to camelCase frontend format
 */
export function mapBrand(apiBrand: ApiBrand | any): Brand {
    return {
        id: apiBrand.id?.toString() || "",
        slug: apiBrand.slug || "",
        name: apiBrand.name || "Unknown Brand",
        logo: sanitizeImageUrl(apiBrand.logo),
        description: apiBrand.description,
        bikeCount: apiBrand.bike_count || 0,
        usedBikeCount: apiBrand.used_bike_count,
        country: apiBrand.country,
        official_website: apiBrand.official_website,
    };
}

/**
 * Maps a raw API article to the frontend NewsArticle model
 * Converts snake_case API fields to camelCase frontend format
 */
export function mapArticle(apiArticle: ApiArticle | any): NewsArticle {
    return {
        id: apiArticle.id?.toString() || "",
        slug: apiArticle.slug || "",
        title: apiArticle.title || "",
        excerpt: apiArticle.excerpt || "",
        content: apiArticle.content || "",
        featured_image: sanitizeImageUrl(apiArticle.featured_image),
        author: apiArticle.author || { id: "", username: "Unknown" },
        category: apiArticle.category?.slug || apiArticle.category || "industry",
        tags: apiArticle.tags || [],
        views: apiArticle.views || 0,
        is_published: apiArticle.is_published,
        published_at: apiArticle.published_at || new Date(),
        created_at: apiArticle.created_at || new Date(),
        updated_at: apiArticle.updated_at || new Date(),
    };
}

/**
 * Transforms frontend filters to API request parameters
 * Converts camelCase arrays to API format (comma-separated strings)
 */
export function transformUsedBikeFilters(filters?: UsedBikeFilters): UsedBikeListParams | undefined {
    if (!filters) return undefined;
    
    const params: UsedBikeListParams = {};
    
    // Convert array filters to comma-separated strings
    if (filters.brand && Array.isArray(filters.brand) && filters.brand.length > 0) {
        params.brand = filters.brand.join(',');
    }
    
    if (filters.condition && Array.isArray(filters.condition) && filters.condition.length > 0) {
        params.condition = filters.condition.join(',');
    }
    
    // Direct mappings with snake_case conversion
    if (filters.minPrice !== undefined) params.min_price = filters.minPrice;
    if (filters.maxPrice !== undefined) params.max_price = filters.maxPrice;
    if (filters.location) params.location_city = filters.location;
    if (filters.search) params.search = filters.search;
    if (filters.page !== undefined) params.page = filters.page;
    if (filters.sort) params.ordering = filters.sort;
    if (filters.featured !== undefined) params.featured = filters.featured;
    
    return params;
}

/**
 * Sanitizes image URLs for Next.js Image component
 * - Validates absolute URLs
 * - Fixes relative paths (adds leading /, encodes special chars)
 * - Handles edge cases: empty strings, spaces, invalid chars
 * 
 * @param url - The URL to sanitize
 * @param fallback - Fallback URL if the input is invalid
 * @returns Sanitized URL string
 */
export function sanitizeImageUrl(
    url: any,
    fallback: string = "/bikes/default.webp"
): string {
    // Non-string values → fallback
    if (typeof url !== "string") return fallback;

    const trimmed = url.trim();
    if (!trimmed || trimmed === "None" || trimmed === "null") return fallback;

    // Already a valid fallback? Return it
    if (trimmed === fallback) return fallback;

    // Helper to validate Cloudinary URLs
    const isBrokenCloudinary = (urlString: string) => {
        try {
            const url = new URL(urlString.startsWith('//') ? `https:${urlString}` : urlString);
            if (url.hostname.includes('cloudinary')) {
                // If it's just res.cloudinary or res.cloudinary.com without a proper path
                if (url.pathname === '/' || url.pathname === '') return true;
                // If it doesn't look like a valid Cloudinary upload path
                if (!url.pathname.includes('/image/upload/')) {
                    // some old cloudinary urls might not have /image/upload/, but mrbikebd always uses it
                    // let's be safe: if path length is very short, it's probably broken
                    if (url.pathname.length < 10) return true;
                }
            }
            return false;
        } catch {
            return true;
        }
    };

    if (isBrokenCloudinary(trimmed)) {
        return fallback;
    }

    // Validate absolute URLs (http/https)
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        try {
            // Upgrade HTTP to HTTPS for Cloudinary
            return trimmed.startsWith("http://") ? trimmed.replace("http://", "https://") : trimmed;
        } catch {
            return fallback;
        }
    }

    // Validate protocol-relative URLs (//example.com)
    if (trimmed.startsWith("//")) {
        try {
            return `https:${trimmed}`;
        } catch {
            return fallback;
        }
    }

    // Cloudinary public_id detection: looks like "mrbikebd/bikes/abc123"
    // These are not full URLs but need to be converted to Cloudinary CDN URLs
    if (trimmed.includes("/") && !trimmed.startsWith("/") && !trimmed.startsWith(".")) {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        if (cloudName) {
            return `https://res.cloudinary.com/${cloudName}/image/upload/${trimmed}`;
        }
        // Can't build URL without cloud name; return fallback
        return fallback;
    }

    // Fix relative paths: ensure leading slash
    let normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

    // Remove duplicate slashes (except after protocol)
    normalized = normalized.replace(/([^:]\/)\/+/g, '$1');

    // Encode only unsafe characters while preserving URL structure
    try {
        // Split by '/' to preserve path structure, encode each segment
        const segments = normalized.split('/');
        const encodedSegments = segments.map(segment =>
            segment ? encodeURIComponent(decodeURIComponent(segment)) : ''
        );
        return encodedSegments.join('/');
    } catch {
        return fallback;
    }
}

/**
 * Maps a raw API used bike listing to the frontend UsedBike model
 */
export function mapUsedBike(item: any): UsedBike {
    const bikeId = item.id?.toString() || `temp_${Date.now()}_${Math.random()}`;
    const status = item.status || "active";

    return {
        id: bikeId,
        slug: item.slug || bikeId,
        bikeName: item.bike_model_name || item.title || "Unknown Bike",
        brandName: item.brand_name || item.brand || "Unknown Brand",
        sellerId: item.seller?.toString() || "",
        sellerName: item.seller_name || "Unknown Seller",
        sellerPhone: item.seller_phone || "",
        images: (item.images || item.uploaded_images || []).map((img: any) => 
            sanitizeImageUrl(typeof img === 'string' ? img : (img.url || img.original_image || img.image))
        ),
        thumbnailUrl: sanitizeImageUrl(item.image_url || item.thumbnail_url || (item.images?.[0]?.url) || (item.images?.[0])),
        price: Number(item.price) || 0,
        year: item.manufacturing_year || item.year || new Date().getFullYear(),
        kmDriven: item.mileage || item.kmDriven || 0,
        condition: item.condition || "good",
        accidentHistory: !!item.accident_history,
        location: {
            city: typeof item.location === 'object' ? (item.location.city || item.location_city || "Unknown") : (item.location || item.location_city || "Unknown"),
            area: typeof item.location === 'object' ? (item.location.area || item.location_area || "") : (item.location_area || ""),
        },
        description: item.description || "",
        status: status as any,
        isFeatured: item.is_featured || false,
        isVerified: item.is_verified || false,
        isUrgent: item.is_urgent || false,
        engineCC: item.engine_cc || item.engineCC || (item.bike_model?.engine_capacity) || 0,
        whatsappNumber: item.whatsapp_number || "",
        primaryContactNumber: item.contact_number || item.primary_contact_number || "",
        whatsapp_number: item.whatsapp_number || "",
        primary_contact_number: item.contact_number || item.primary_contact_number || "",
        registrationYear: item.registration_year,
        registrationType: item.registration_type,
        hasOriginalPapers: item.has_original_papers,
        ownershipCount: item.ownership_count,
        engineCondition: item.engine_condition,
        bodyCondition: item.body_condition,
        modifications: item.modifications,
        expiresAt: item.expires_at ? new Date(item.expires_at) : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        createdAt: item.created_at ? new Date(item.created_at) : new Date(),
        updatedAt: item.updated_at ? new Date(item.updated_at) : new Date(),
        shop: item.shop || undefined,
        shop_info: item.shop_info || undefined,
    };
}

export function mapBike(bike: any): Bike {
    const brandName = bike.brand?.name || bike.brand_name || (typeof bike.brand === 'string' ? bike.brand : "Unknown Brand");
    
    // Normalize detailed_specs into specs
    const detailed = bike.detailed_specs || {};
    const specs = {
        ...(bike.specs || {}),
        // Map new backend snake_case fields to frontend camelCase
        gearShiftPattern: detailed.gear_shift_pattern,
        sparkPlugs: detailed.spark_plugs,
        coolingType: detailed.cooling_type,
        usbCharging: detailed.usb_charging,
        sideStandCutOff: detailed.side_stand_cut_off,
        projectorHeadlight: detailed.projector_headlight,
        drls: detailed.drls,
        gearIndicator: detailed.gear_indicator,
        distanceToEmpty: detailed.distance_to_empty,
        avgFuelConsumption: detailed.avg_fuel_consumption,
        // Existing fields mapping if needed (parity check)
        engineType: detailed.engine_type || bike.specs?.engineType,
        displacement: Number(detailed.displacement || bike.specs?.displacement || 0),
        maxPower: detailed.max_power || bike.specs?.maxPower,
        maxTorque: detailed.max_torque || bike.specs?.maxTorque,
        cooling: detailed.cooling || bike.specs?.cooling,
        fuelSystem: detailed.fuel_system || bike.specs?.fuelSystem,
        transmission: detailed.transmission || bike.specs?.transmission,
        kerbWeight: Number(detailed.kerb_weight || bike.specs?.kerbWeight || 0),
        frontBrake: detailed.brakes_front || bike.specs?.frontBrake,
        rearBrake: detailed.brakes_rear || bike.specs?.rearBrake,
        abs: detailed.abs_channel || bike.specs?.abs,
        mileage: parseFloat(detailed.mileage_city || detailed.mileage_highway || detailed.mileage_arai || bike.specs?.mileage || "0") || 0,
        topSpeed: parseFloat(detailed.top_speed || bike.specs?.topSpeed || "0") || 0,
    };

    return {
        ...bike,
        brand_name: brandName,
        brand: typeof bike.brand === 'object' ? bike.brand : { name: brandName, slug: brandName.toLowerCase(), id: "" },
        primary_image: sanitizeImageUrl(bike.primary_image),
        thumbnailUrl: sanitizeImageUrl(bike.thumbnailUrl || bike.primary_image),
        images: [bike.primary_image, bike.image1, bike.image2, bike.image3, bike.image4, bike.image5]
            .filter(Boolean)
            .map((img: any) => sanitizeImageUrl(typeof img === 'string' ? img : img.url)),
        variants: Array.isArray(bike.variants) 
            ? bike.variants.map((v: any) => ({ ...v, image_url: v.image_url ? sanitizeImageUrl(v.image_url) : null }))
            : bike.variants,
        specs: specs as any,
        rating: {
            average: Number(bike.average_rating) || 0,
            count: Number(bike.review_count) || 0,
            breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } // Breakdown will be handled by reviews API
        },
    };
}

/**
 * Maps a raw API review to the frontend Review model
 */
export function mapReview(item: any): Review {
    return {
        id: item.id?.toString() || "",
        bikeId: item.bike?.toString() || item.bike_model?.toString() || "",
        userId: item.user?.id?.toString() || item.user?.toString() || "",
        userName: item.user_name || item.user?.name || "Anonymous",
        userImage: sanitizeImageUrl(item.user?.image || item.user_image),
        rating: Number(item.rating) || 0,
        performanceRating: Number(item.performance_rating) || 0,
        looksRating: Number(item.looks_rating) || 0,
        reliabilityRating: Number(item.reliability_rating) || 0,
        comment: item.comment || "",
        createdAt: item.created_at || item.createdAt || new Date(),
        created_at: item.created_at || item.createdAt || new Date(),
        likes: item.likes || 0,
        isVerifiedOwner: !!item.is_verified_purchase,
        bike_name: item.bike_name || "",
        bike_slug: item.bike_slug || "",
    };
}
