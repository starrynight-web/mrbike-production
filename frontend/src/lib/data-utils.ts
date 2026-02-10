import type { Bike, UsedBike, ApiUsedBikeListing } from "@/types";

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
    if (!trimmed) return fallback;

    // Already a valid fallback? Return it
    if (trimmed === fallback) return fallback;

    // Validate absolute URLs (http/https)
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        try {
            new URL(trimmed);
            return trimmed;
        } catch {
            return fallback;
        }
    }

    // Validate protocol-relative URLs (//example.com)
    if (trimmed.startsWith("//")) {
        try {
            new URL(`https:${trimmed}`);
            return trimmed;
        } catch {
            return fallback;
        }
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

    return {
        id: bikeId,
        bikeName: item.bike_model_name || item.title || "Unknown Bike",
        brandName: item.brand || "Unknown Brand",
        sellerId: item.seller?.toString() || "",
        sellerName: item.seller_name || "Unknown Seller",
        sellerPhone: item.seller_phone || "",
        images: item.images?.map((img: any) => sanitizeImageUrl(typeof img === 'string' ? img : img.url)) || [],
        thumbnailUrl: sanitizeImageUrl(item.image_url || item.thumbnail_url),
        price: Number(item.price) || 0,
        year: item.manufacturing_year || new Date().getFullYear(),
        kmDriven: item.mileage || 0,
        condition: item.condition || "good",
        accidentHistory: !!item.accident_history,
        location: {
            city: item.location || "Unknown",
            area: "",
        },
        status: item.status || "active",
        isFeatured: item.is_featured || false,
        isVerified: item.is_verified || false,
        expiresAt: item.expires_at ? new Date(item.expires_at) : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        createdAt: item.created_at ? new Date(item.created_at) : new Date(),
        updatedAt: item.updated_at ? new Date(item.updated_at) : new Date(),
    };
}

/**
 * Normalizes a Bike model from the API
 */
export function mapBike(bike: any): Bike {
    const brandName = bike.brand?.name || bike.brand_name || (typeof bike.brand === 'string' ? bike.brand : "Unknown Brand");

    return {
        ...bike,
        brand_name: brandName,
        brand: typeof bike.brand === 'object' ? bike.brand : { name: brandName, slug: brandName.toLowerCase(), id: "" },
        primary_image: sanitizeImageUrl(bike.primary_image),
        thumbnailUrl: sanitizeImageUrl(bike.thumbnailUrl || bike.primary_image),
        images: bike.images?.map((img: any) => sanitizeImageUrl(typeof img === 'string' ? img : img.url)) || [],
    };
}
