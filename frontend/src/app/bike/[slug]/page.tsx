import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BikeDetailClient } from "./detail-client";
import { APP_CONFIG, SEO_DEFAULTS } from "@/config/constants";

interface BikePageProps {
    params: Promise<{ slug: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BikePageProps): Promise<Metadata> {
    const { slug } = await params;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

    try {
        const response = await fetch(`${apiUrl}/bikes/${slug}/`, { next: { revalidate: 3600 } });
        if (!response.ok) throw new Error("Bike not found");
        const bike = await response.json();

        const title = `${bike.brand_name} ${bike.name} Price in Bangladesh, Specs & Review`;
        const engineCapacityText = bike.engine_capacity ? `${bike.engine_capacity}cc` : "N/A";
        const description = `${bike.brand_name} ${bike.name} price in Bangladesh is ৳${(bike.price || 0).toLocaleString()}. Check ${engineCapacityText} engine specs, mileage, images, and user reviews on MrBikeBD.`;

        return {
            title,
            description,
            keywords: [
                bike.name,
                `${bike.brand_name} ${bike.name}`,
                `${bike.name} price BD`,
                `${bike.name} specifications`,
                "motorcycle price in Bangladesh",
            ],
            openGraph: {
                title: `${bike.brand_name} ${bike.name} - Official Price & Full Specs${SEO_DEFAULTS.titleSuffix}`,
                description,
                url: `${APP_CONFIG.url}/bike/${slug}`,
                type: "website",
                images: [
                    {
                        url: bike.primary_image || SEO_DEFAULTS.defaultOgImage,
                        width: 1200,
                        height: 630,
                        alt: `${bike.brand_name} ${bike.name}`,
                    },
                ],
            },
            alternates: {
                canonical: `${APP_CONFIG.url}/bike/${slug}`,
            },
        };
    } catch (error) {
        return {
            title: `Bike Details${SEO_DEFAULTS.titleSuffix}`,
            description: "View detailed motorcycle specifications, pricing, and reviews on MrBikeBD.",
        };
    }
}

// Generate static params for popular bikes (ISR)
export async function generateStaticParams() {
    // In production, fetch popular bike slugs
    return [
        { slug: "yamaha-r15-v4" },
        { slug: "honda-cb150r" },
        { slug: "suzuki-gixxer-sf" },
        { slug: "ktm-duke-200" },
        { slug: "tvs-apache-rtr-160" },
    ];
}

export default async function BikePage({ params }: BikePageProps) {
    const { slug } = await params;

    // Validate slug format
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
        notFound();
    }

    return <BikeDetailClient slug={slug} />;
}
