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

    // In production, fetch bike data here
    // const bike = await getBikeBySlug(slug);

    // For now, use placeholder
    const bikeName = slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    return {
        title: `${bikeName} - Price, Specs, Mileage & Review`,
        description: `${bikeName} price in Bangladesh starts from ৳X Lac. Check specifications, mileage, images, reviews, and compare with similar bikes. EMI calculator available.`,
        keywords: [
            bikeName,
            `${bikeName} price`,
            `${bikeName} specs`,
            `${bikeName} mileage`,
            `${bikeName} review`,
            "motorcycle Bangladesh",
        ],
        openGraph: {
            title: `${bikeName} - Price, Specs & Review${SEO_DEFAULTS.titleSuffix}`,
            description: `${bikeName} price in Bangladesh. Check full specifications, mileage, images, and expert reviews.`,
            url: `${APP_CONFIG.url}/bike/${slug}`,
            type: "website",
            images: [
                {
                    url: `/bikes/${slug}.webp`, // Dynamic OG image
                    width: 1200,
                    height: 630,
                    alt: bikeName,
                },
            ],
        },
        alternates: {
            canonical: `${APP_CONFIG.url}/bike/${slug}`,
        },
    };
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
