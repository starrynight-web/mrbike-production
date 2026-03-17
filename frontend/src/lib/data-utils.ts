import type { Bike, UsedBike, ApiUsedBikeListing, Review } from "@/types";
import { User } from "@/types";

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

    // Validate absolute URLs (http/https)
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        try {
            new URL(trimmed);
            // Upgrade HTTP to HTTPS for Cloudinary
            return trimmed.startsWith("http://") ? trimmed.replace("http://", "https://") : trimmed;
        } catch {
            return fallback;
        }
    }

    // Validate protocol-relative URLs (//example.com)
    if (trimmed.startsWith("//")) {
        try {
            new URL(`https:${trimmed}`);
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
    };

    return {
        ...bike,
        brand_name: brandName,
        brand: typeof bike.brand === 'object' ? bike.brand : { name: brandName, slug: brandName.toLowerCase(), id: "" },
        primary_image: sanitizeImageUrl(bike.primary_image),
        thumbnailUrl: sanitizeImageUrl(bike.thumbnailUrl || bike.primary_image),
        images: bike.images?.map((img: any) => sanitizeImageUrl(typeof img === 'string' ? img : img.url)) || [],
        specs: specs as any,
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
        comment: item.comment || "",
        createdAt: item.created_at || item.createdAt || new Date(),
        created_at: item.created_at || item.createdAt || new Date(),
        likes: item.likes || 0,
        isVerifiedOwner: !!item.is_verified_purchase,
        bike_name: item.bike_name || "",
        bike_slug: item.bike_slug || "",
    };
}
